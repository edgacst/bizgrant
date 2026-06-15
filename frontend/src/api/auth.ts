import client from './client';
import type { JwtTokens, SignupForm, LoginForm, User } from '../types';

export async function signup(data: SignupForm): Promise<User> {
  const res = await client.post('/auth/signup', data);
  return res.data;
}

export async function login(data: LoginForm): Promise<JwtTokens> {
  const res = await client.post('/auth/login', data);
  return res.data;
}

export async function getMe(): Promise<User> {
  const res = await client.get('/auth/me');
  return res.data;
}

export async function updateProfile(data: import('../types').UpdateProfileForm): Promise<User> {
  const res = await client.put('/auth/profile', data);
  return res.data;
}

export async function loginWithOAuth(provider: 'google' | 'naver' | 'kakao'): Promise<JwtTokens> {
  const res = await client.post(`/auth/oauth/${provider}`);
  return res.data;
}
