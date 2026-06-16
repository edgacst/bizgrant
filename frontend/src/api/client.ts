import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { clearAuthSession, isAccessTokenExpired, refreshAuthTokens } from '../utils/authSession';

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<boolean> | null = null;

async function ensureFreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = refreshAuthTokens().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function shouldAttemptRefresh(error: AxiosError<unknown>, config?: RetryConfig): boolean {
  if (!config || config._retry) {
    return false;
  }

  const status = error.response?.status;
  if (status === 401) {
    return true;
  }

  if (status === 400) {
    const url = config.url ?? '';
    const hasRefresh = Boolean(localStorage.getItem('refreshToken'));
    if (hasRefresh && (url.includes('/bookmarks') || url.includes('/pipeline'))) {
      return true;
    }
  }

  if (status === 403) {
    const url = config.url ?? '';
    return url.includes('/admin') || url.includes('/auth/me');
  }

  return false;
}

client.interceptors.request.use(async (config) => {
  if (isAccessTokenExpired() && localStorage.getItem('refreshToken')) {
    await ensureFreshAccessToken();
  }
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;

    if (shouldAttemptRefresh(error, config)) {
      config!._retry = true;
      const refreshed = await ensureFreshAccessToken();
      if (refreshed) {
        config!.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`;
        return client(config!);
      }
    }

    if (error.response?.status === 401) {
      clearAuthSession();
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default client;
