import api from '@/api/axios';
import type { ApiResponse, PaginatedTransactions, PlayerProfile, WalletBalance } from '@/types';

export const walletApi = {
  getBalance: async () => {
    const { data } = await api.get<ApiResponse<WalletBalance>>('/wallet/balance');
    return data.data;
  },

  getTransactions: async (
    page = 1,
    perPage = 20,
    filters?: { type?: string; from?: string; to?: string },
  ) => {
    const { data } = await api.get<ApiResponse<PaginatedTransactions>>('/wallet/transactions', {
      params: { page, per_page: perPage, ...filters },
    });
    return data.data;
  },
};

let getMeInflight: Promise<PlayerProfile> | null = null;

export const playerApi = {
  getMe: async () => {
    if (getMeInflight) return getMeInflight;

    getMeInflight = api
      .get<ApiResponse<PlayerProfile>>('/player/me')
      .then(({ data }) => data.data)
      .finally(() => {
        getMeInflight = null;
      });

    return getMeInflight;
  },

  updateProfile: async (payload: { nickname?: string; language?: string }) => {
    const { data } = await api.patch<ApiResponse<PlayerProfile>>('/player/profile', payload);
    return data.data;
  },

  changePassword: async (payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) => {
    const { data } = await api.put<ApiResponse<null>>('/player/password', payload);
    return data;
  },

  requestEmailVerification: async () => {
    const { data } = await api.post<ApiResponse<null>>('/player/verify/email/request');
    return data;
  },

  confirmEmailVerification: async (code: string) => {
    const { data } = await api.post<ApiResponse<PlayerProfile>>('/player/verify/email/confirm', {
      code,
    });
    return data.data;
  },

  requestPhoneVerification: async () => {
    const { data } = await api.post<ApiResponse<null>>('/player/verify/phone/request');
    return data;
  },

  confirmPhoneVerification: async (code: string) => {
    const { data } = await api.post<ApiResponse<PlayerProfile>>('/player/verify/phone/confirm', {
      code,
    });
    return data.data;
  },
};
