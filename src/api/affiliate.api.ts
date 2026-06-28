import api from '@/api/axios';
import type { ApiResponse, PaginationMeta } from '@/types';

export interface AffiliateMe {
  code: string;
  commission_model: string;
  commission_rate: string;
  cpa_amount: string | null;
  status: string;
  referral_link: string;
  is_sub_affiliate: boolean;
  can_manage_sub_affiliates: boolean;
  parent_code: string | null;
  email: string | null;
  email_verified: boolean;
}

export interface AffiliateStats {
  referred_players_count: number;
  commissions_count: number;
  total_commission: string;
  pending_commission: string;
  sub_affiliates_count?: number;
  downline_players_count?: number;
  override_commission?: string;
  pending_override_commission?: string;
}

export interface AffiliateReferredPlayer {
  player_id: number;
  nickname: string | null;
  registered_at: string;
  referred_via_code?: string | null;
}

export interface AffiliateCommission {
  id: number;
  player_id: number;
  type: string;
  amount: string;
  reference_type: string;
  reference_id: string;
  status: string;
  created_at: string | null;
}

export type PlayerStatisticsPeriod = 'today' | 'week' | '30days' | 'month';

export interface PlayerStatisticsMetrics {
  total_bet: string;
  total_win: string;
  deposits: string;
  withdrawals: string;
  cash_turnover: string;
  bonus_turnover: string;
  ggr: string;
  bonus_cost: string;
  affiliate_cost: string;
  ngr: string;
}

export interface AffiliatePlayerStatistics {
  player_id: number;
  nickname: string | null;
  registered_at: string;
  referred_via_code?: string | null;
  stats: PlayerStatisticsMetrics;
}

export interface AffiliatePlayerStatisticsList {
  period: PlayerStatisticsPeriod;
  items: AffiliatePlayerStatistics[];
  pagination: PaginationMeta;
}

export interface AffiliateSubAffiliate {
  id: number;
  code: string;
  commission_model: string;
  commission_rate: string;
  cpa_amount: string | null;
  status: string;
  referred_players_count: number;
  created_at: string | null;
}

export interface CreateSubAffiliatePayload {
  code: string;
  email: string;
  password: string;
  commission_model: string;
  commission_rate?: number;
  cpa_amount?: number;
  status?: string;
}

export interface UpdateSubAffiliatePayload {
  commission_model?: string;
  commission_rate?: number;
  cpa_amount?: number | null;
  status?: string;
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

  getPlayerStatistics: async (period: PlayerStatisticsPeriod = 'week', page = 1) => {
    const { data } = await api.get<ApiResponse<AffiliatePlayerStatisticsList>>(
      '/affiliate/player-statistics',
      { params: { period, page } },
    );
    return data.data;
  },

  getSubAffiliates: async (page = 1) => {
    const { data } = await api.get<ApiResponse<Paginated<AffiliateSubAffiliate>>>(
      '/affiliate/sub-affiliates',
      { params: { page } },
    );
    return data.data;
  },

  createSubAffiliate: async (payload: CreateSubAffiliatePayload) => {
    const { data } = await api.post<ApiResponse<AffiliateSubAffiliate>>(
      '/affiliate/sub-affiliates',
      payload,
    );
    return data.data;
  },

  updateSubAffiliate: async (id: number, payload: UpdateSubAffiliatePayload) => {
    const { data } = await api.patch<ApiResponse<AffiliateSubAffiliate>>(
      `/affiliate/sub-affiliates/${id}`,
      payload,
    );
    return data.data;
  },

  changePassword: async (payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) => {
    const { data } = await api.put<ApiResponse<null>>('/affiliate/password', payload);
    return data;
  },
};
