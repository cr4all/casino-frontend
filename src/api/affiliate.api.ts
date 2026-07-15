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
  available_payout: string;
  accruing_commission: string;
  sub_affiliates_count?: number;
  downline_players_count?: number;
  override_commission?: string;
  pending_override_commission?: string;
}

export interface AffiliatePayoutAvailability {
  available_amount: string;
  accruing_amount: string;
  currency: string;
  min_payout_amount: string;
  can_request: boolean;
  has_pending_request: boolean;
  has_payout_details: boolean;
  period_end: string;
  reason: string | null;
}

export interface AffiliatePayoutDetails {
  payout_details: Record<string, string>;
}

export interface UpdateAffiliatePayoutDetailsPayload {
  payout_details: {
    account_wallet_id: string;
    note?: string;
  };
}

export interface AffiliatePayout {
  id: number;
  period_start: string;
  period_end: string;
  total_amount: string;
  currency: string;
  status: 'requested' | 'paid' | 'rejected';
  payout_details: Record<string, string>;
  rejection_reason: string | null;
  paid_at: string | null;
  rejected_at: string | null;
  created_at: string | null;
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

export type PlayerStatisticsPeriod = 'today' | 'last_week' | 'last_month' | 'custom';

export interface PlayerStatisticsMetrics {
  deposits: string;
  withdrawals: string;
  cash_turnover: string;
  bonus_turnover: string;
  cash_win: string;
  bonus_win: string;
  total_turnover: string;
  total_win: string;
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
  from?: string | null;
  to?: string | null;
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

export interface PlayerStatisticsQuery {
  period?: PlayerStatisticsPeriod;
  page?: number;
  from?: string;
  to?: string;
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

  getPlayerStatistics: async ({
    period = 'today',
    page = 1,
    from,
    to,
  }: PlayerStatisticsQuery = {}) => {
    const params: Record<string, string | number> = { period, page };
    if (period === 'custom' && from && to) {
      params.from = from;
      params.to = to;
    }

    const { data } = await api.get<ApiResponse<AffiliatePlayerStatisticsList>>(
      '/affiliate/player-statistics',
      { params },
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

  getPayoutAvailability: async () => {
    const { data } = await api.get<ApiResponse<AffiliatePayoutAvailability>>(
      '/affiliate/payouts/availability',
    );
    return data.data;
  },

  getPayoutDetails: async () => {
    const { data } = await api.get<ApiResponse<AffiliatePayoutDetails>>('/affiliate/payout-details');
    return data.data;
  },

  updatePayoutDetails: async (payload: UpdateAffiliatePayoutDetailsPayload) => {
    const { data } = await api.put<ApiResponse<AffiliatePayoutDetails>>(
      '/affiliate/payout-details',
      payload,
    );
    return data.data;
  },

  getPayouts: async (page = 1) => {
    const { data } = await api.get<ApiResponse<Paginated<AffiliatePayout>>>(
      '/affiliate/payouts',
      { params: { page } },
    );
    return data.data;
  },

  requestPayout: async () => {
    const { data } = await api.post<ApiResponse<AffiliatePayout>>('/affiliate/payouts');
    return data.data;
  },
};
