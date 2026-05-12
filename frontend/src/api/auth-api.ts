import { apiGetJson, apiPostJson } from './client';

export type AuthTokensResponse = {
  readonly accessToken: string;
  readonly expiresIn: number;
  readonly tokenType: 'Bearer';
};

export type MeResponse = {
  readonly id: string;
  readonly email: string;
};

export async function registerRequest(
  email: string,
  password: string,
): Promise<AuthTokensResponse> {
  return apiPostJson<AuthTokensResponse>('/api/v1/auth/register', { email, password });
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<AuthTokensResponse> {
  return apiPostJson<AuthTokensResponse>('/api/v1/auth/login', { email, password });
}

export async function googleIdTokenRequest(idToken: string): Promise<AuthTokensResponse> {
  return apiPostJson<AuthTokensResponse>('/api/v1/auth/google', { idToken });
}

export async function refreshRequest(): Promise<AuthTokensResponse> {
  return apiPostJson<AuthTokensResponse>('/api/v1/auth/refresh', {});
}

export async function logoutRequest(): Promise<void> {
  await apiPostJson<{ ok: boolean }>('/api/v1/auth/logout', {});
}

export async function meRequest(accessToken: string): Promise<MeResponse> {
  return apiGetJson<MeResponse>('/api/v1/auth/me', accessToken);
}
