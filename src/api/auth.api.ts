import api from '@/api/axios';
import { buildRiskContext, type ClientRiskContext } from '@/lib/deviceContext';
import type { ApiResponse, AuthTokens, User } from '@/types';

export type { ClientRiskContext };

export interface RegistrationOption {
  code: string;
  name: string;
}

export interface RegisterOptions {
  currencies: RegistrationOption[];
}

export interface SessionPolicy {
  idle_timeout_minutes: number;
}

export interface RegisterPayload {
  email: string;
  password: string;
  password_confirmation: string;
  nickname: string;
  phone: string;
  country: string;
  currency: string;
  affiliate_code?: string;
  invite_code?: string;
  email_verification_code: string;
  turnstileToken?: string;
  risk_context?: ClientRiskContext;
}

export interface RegisterAffiliatePayload {
  email: string;
  password: string;
  password_confirmation: string;
  code: string;
  email_verification_code: string;
  turnstileToken?: string;
  risk_context?: ClientRiskContext;
}

export interface LoginPayload {
  email?: string;
  username?: string;
  phone?: string;
  password: string;
  turnstileToken?: string;
  risk_context?: ClientRiskContext;
}

export interface PasswordRecoveryRequestPayload {
  email?: string;
  phone?: string;
}

export interface PasswordRecoveryResetPayload {
  email?: string;
  phone?: string;
  code: string;
  password: string;
  password_confirmation: string;
}

export const authApi = {
  getRegisterOptions: async () => {
    const { data } = await api.get<ApiResponse<RegisterOptions>>('/auth/register-options');
    return data.data;
  },

  getSessionPolicy: async () => {
    const { data } = await api.get<ApiResponse<SessionPolicy>>('/auth/session-policy');
    return data.data;
  },

  register: async (payload: RegisterPayload) => {
    const { turnstileToken, ...body } = payload;
    const risk_context = await buildRiskContext(turnstileToken);
    const { data } = await api.post<ApiResponse<{ user: User; access_token: string; expires_in: number }>>(
      '/auth/register',
      { ...body, risk_context },
    );
    return data.data;
  },

  registerAffiliate: async (payload: RegisterAffiliatePayload) => {
    const { turnstileToken, ...body } = payload;
    const risk_context = await buildRiskContext(turnstileToken);
    const { data } = await api.post<
      ApiResponse<{ user: User; affiliate: { id: number; code: string }; access_token: string; expires_in: number }>
    >('/auth/register/affiliate', { ...body, risk_context });
    return data.data;
  },

  login: async (payload: LoginPayload) => {
    const { turnstileToken, ...body } = payload;
    const risk_context = await buildRiskContext(turnstileToken);
    const { data } = await api.post<ApiResponse<AuthTokens>>('/auth/login', {
      ...body,
      risk_context,
    });
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

  requestPasswordRecovery: async (payload: PasswordRecoveryRequestPayload) => {
    const { data } = await api.post<ApiResponse<null>>('/auth/password-recovery/request', payload);
    return data;
  },

  requestRegistrationEmailVerification: async (
    email: string,
    context: 'player' | 'affiliate' = 'player',
  ) => {
    const { data } = await api.post<ApiResponse<null>>('/auth/register/verify-email/request', {
      email,
      context,
    });
    return data;
  },

  resetPasswordWithCode: async (payload: PasswordRecoveryResetPayload) => {
    const { data } = await api.post<ApiResponse<null>>('/auth/password-recovery/reset', payload);
    return data;
  },
};
