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

export const playerApi = {
  getMe: async () => {
    const { data } = await api.get<ApiResponse<PlayerProfile>>('/player/me');
    return data.data;
  },

  updateProfile: async (payload: { nickname?: string; language?: string }) => {
    const { data } = await api.patch<ApiResponse<PlayerProfile>>('/player/profile', payload);
    return data.data;
  },
};
