import api from '@/api/axios';
import type { ApiResponse, AuthTokens, User } from '@/types';

export interface RegistrationOption {
  code: string;
  name: string;
}

export interface RegisterOptions {
  currencies: RegistrationOption[];
  countries: RegistrationOption[];
}

export interface RegisterPayload {
  email: string;
  password: string;
  password_confirmation: string;
  nickname: string;
  country: string;
  currency: string;
  affiliate_code?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  getRegisterOptions: async () => {
    const { data } = await api.get<ApiResponse<RegisterOptions>>('/auth/register-options');
    return data.data;
  },

  register: async (payload: RegisterPayload) => {
    const { data } = await api.post<ApiResponse<{ user: User; access_token: string; expires_in: number }>>(
      '/auth/register',
      payload,
    );
    return data.data;
  },

  login: async (payload: LoginPayload) => {
    const { data } = await api.post<ApiResponse<AuthTokens>>('/auth/login', payload);
    return data.data;
  },

  logout: async (refreshToken: string) => {
    await api.post('/auth/logout', { refresh_token: refreshToken });
  },

  refresh: async (refreshToken: string) => {
    const { data } = await api.post<ApiResponse<AuthTokens>>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return data.data;
  },
};
