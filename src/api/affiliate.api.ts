import api from '@/api/axios';
import type { ApiResponse, PaginationMeta } from '@/types';

export interface AffiliateMe {
  code: string;
  commission_model: string;
  commission_rate: string;
  cpa_amount: string | null;
  status: string;
  referral_link: string;
}

export interface AffiliateStats {
  referred_players_count: number;
  commissions_count: number;
  total_commission: string;
  pending_commission: string;
}

export interface AffiliateReferredPlayer {
  player_id: number;
  nickname: string | null;
  registered_at: string;
}

export interface AffiliateCommission {
  id: number;
  type: string;
  amount: string;
  reference_type: string;
  reference_id: string;
  status: string;
  created_at: string | null;
}

interface Paginated<T> {
  items: T[];
  pagination: PaginationMeta;
}

export const affiliateApi = {
  getMe: async () => {
    const { data } = await api.get<ApiResponse<AffiliateMe>>('/affiliate/me');
    return data.data;
  },

  getStats: async () => {
    const { data } = await api.get<ApiResponse<AffiliateStats>>('/affiliate/stats');
    return data.data;
  },

  getPlayers: async (page = 1) => {
    const { data } = await api.get<ApiResponse<Paginated<AffiliateReferredPlayer>>>(
      '/affiliate/players',
      { params: { page } },
    );
    return data.data;
  },

  getCommissions: async (page = 1) => {
    const { data } = await api.get<ApiResponse<Paginated<AffiliateCommission>>>(
      '/affiliate/commissions',
      { params: { page } },
    );
    return data.data;
  },
};
