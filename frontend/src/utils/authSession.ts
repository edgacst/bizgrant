import axios from 'axios';
import type { JwtTokens } from '../types';
import { getMe } from '../api/auth';

export function saveAuthSession(tokens: JwtTokens & { role?: string; email?: string; name?: string }) {
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
  if (tokens.role) {
    localStorage.setItem('userRole', tokens.role);
  }
  if (tokens.email) {
    localStorage.setItem('userEmail', tokens.email);
  }
  if (tokens.name) {
    localStorage.setItem('userName', tokens.name);
  }
  notifyAuthSessionUpdated();
}

export function clearAuthSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('userPlan');
  notifyAuthSessionUpdated();
}

export function isAdminUser(): boolean {
  return localStorage.getItem('userRole') === 'ADMIN';
}

export function hasStoredAuthSession(): boolean {
  return Boolean(localStorage.getItem('accessToken') || localStorage.getItem('refreshToken'));
}

export function isLoggedIn(): boolean {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken && !isAccessTokenExpired()) {
    return true;
  }
  return Boolean(localStorage.getItem('refreshToken'));
}

/** 만료된 accessToken이 있어도 refreshToken으로 세션을 복구합니다. */
export async function restoreAuthSession(): Promise<boolean> {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (!accessToken && !refreshToken) {
    return false;
  }

  if (accessToken && !isAccessTokenExpired()) {
    return true;
  }

  if (!refreshToken) {
    clearAuthSession();
    return false;
  }

  const refreshed = await refreshAuthTokens();
  if (!refreshed) {
    clearAuthSession();
    return false;
  }
  return true;
}

export function getHomePath(): string {
  return isLoggedIn() ? '/dashboard' : '/';
}

export function isAccessTokenExpired(bufferMs = 30_000): boolean {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return true;
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number };
    if (!payload.exp) {
      return true;
    }
    return payload.exp * 1000 <= Date.now() + bufferMs;
  } catch {
    return true;
  }
}

export async function refreshAuthTokens(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    return false;
  }

  try {
    const { data } = await axios.post<JwtTokens>(
      '/api/auth/refresh',
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      },
    );
    saveAuthSession(data);
    return true;
  } catch {
    return false;
  }
}

export async function syncAuthSession(): Promise<void> {
  const restored = await restoreAuthSession();
  if (!restored) {
    return;
  }

  try {
    const me = await getMe();
    if (me.role) {
      localStorage.setItem('userRole', me.role);
    }
    if (me.email) {
      localStorage.setItem('userEmail', me.email);
    }
    if (me.name) {
      localStorage.setItem('userName', me.name);
    }
    if (me.plan) {
      localStorage.setItem('userPlan', me.plan);
    }
    notifyAuthSessionUpdated();
  } catch {
    // client interceptor handles auth failures
  }
}

export function notifyAuthSessionUpdated() {
  window.dispatchEvent(new Event('auth-session-updated'));
}
