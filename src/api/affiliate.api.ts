import api from '@/api/axios';
import type { ApiResponse, PaginationMeta } from '@/types';

export type AffiliatePeriod = 'today' | 'yesterday' | '7d' | '30d';

export interface AffiliateMe {
  id: number;
  code: string;
  company_name: string | null;
  commission_model: string;
  commission_rate: string;
  cpa_amount: string | null;
  status: string;
  payout_currency: string;
  referral_link: string;
  requires_invoice: boolean;
}

export interface AffiliateKpi {
  clicks: number;
  registrations: number;
  ftd: number;
  deposits: number;
  ngr: number;
  earnings: number;
}

export interface AffiliateChartPoint {
  date: string;
  clicks: number;
  registrations: number;
  ftd: number;
  deposits: number;
  ngr: number;
  earnings: number;
}

export interface AffiliateBalance {
  current_balance: number;
  pending_commission: number;
  reserved_payouts: number;
  minimum_payout: number;
  currency: string;
}

export interface AffiliateDashboard {
  period: string;
  period_label: string;
  kpi: AffiliateKpi;
  chart: AffiliateChartPoint[];
  balance: AffiliateBalance;
}

export interface AffiliateStats {
  period: string;
  period_label: string;
  clicks: number;
  registrations: number;
  ftd: number;
  deposits: number;
  withdrawals: number;
  active_players: number;
  ngr: number;
  revenue: number;
  earnings: number;
  referred_players_count: number;
  commissions_count: number;
  total_commission: string;
  pending_commission: string;
}

export interface AffiliateTrackingLink {
  id: number;
  name: string;
  sub_id: string | null;
  campaign_id: string | null;
  landing_page: string;
  clicks_count: number;
  is_active: boolean;
  url: string;
  created_at: string | null;
}

export interface AffiliatePlayerReport {
  player_code: string;
  registered_at: string | null;
  country: string | null;
  ftd_at: string | null;
  total_deposit: number;
  revenue: number;
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

export interface AffiliateEarningsSummary {
  current_month: number;
  previous_month: number;
  pending: number;
  approved: number;
  paid: number;
}

export interface AffiliatePayout {
  id: number;
  amount: string;
  currency: string;
  method: string;
  status: string;
  created_at: string | null;
  paid_at: string | null;
}

export interface AffiliateBanner {
  id: string;
  category: string;
  size: string;
  download_url: string;
}

export interface AffiliateLandingPageLink {
  id: string;
  label: string;
  url: string;
}

export interface AffiliateSubAffiliate {
  id: number;
  code: string;
  company_name: string | null;
  status: string;
  players_count: number;
  sub_earnings: number;
  override_rate: number;
  your_commission: number;
  registered_at: string | null;
}

export interface AffiliateSupport {
  telegram?: string;
  skype?: string;
  account_manager_email?: string;
  live_chat_enabled?: boolean;
  tickets_enabled?: boolean;
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

  getDashboard: async (period: AffiliatePeriod = '7d') => {
    const { data } = await api.get<ApiResponse<AffiliateDashboard>>('/affiliate/dashboard', {
      params: { period },
    });
    return data.data;
  },

  getStats: async (period: AffiliatePeriod = '30d') => {
    const { data } = await api.get<ApiResponse<AffiliateStats>>('/affiliate/stats', {
      params: { period },
    });
    return data.data;
  },

  getTrackingLinks: async () => {
    const { data } = await api.get<ApiResponse<{ items: AffiliateTrackingLink[] }>>(
      '/affiliate/tracking-links',
    );
    return data.data.items;
  },

  buildTrackingLink: async (payload: Record<string, string | undefined>) => {
    const { data } = await api.post<ApiResponse<{ url: string }>>(
      '/affiliate/tracking-links/build',
      payload,
    );
    return data.data.url;
  },

  createTrackingLink: async (payload: Record<string, string>) => {
    const { data } = await api.post<ApiResponse<{ id: number; url: string }>>(
      '/affiliate/tracking-links',
      payload,
    );
    return data.data;
  },

  getMarketing: async () => {
    const { data } = await api.get<
      ApiResponse<{ banners: AffiliateBanner[]; landing_pages: AffiliateLandingPageLink[] }>
    >('/affiliate/marketing');
    return data.data;
  },

  getPlayers: async (page = 1) => {
    const { data } = await api.get<ApiResponse<Paginated<AffiliatePlayerReport>>>(
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

  getEarnings: async () => {
    const { data } = await api.get<
      ApiResponse<{ summary: AffiliateEarningsSummary; balance: AffiliateBalance }>
    >('/affiliate/earnings');
    return data.data;
  },

  getPayouts: async (page = 1) => {
    const { data } = await api.get<
      ApiResponse<Paginated<AffiliatePayout> & { balance: AffiliateBalance }>
    >('/affiliate/payouts', { params: { page } });
    return data.data;
  },

  requestPayout: async (payload: { amount: number; method: string; notes?: string }) => {
    const { data } = await api.post<ApiResponse<{ id: number; status: string }>>(
      '/affiliate/payouts',
      payload,
    );
    return data.data;
  },

  getInvoices: async () => {
    const { data } = await api.get<
      ApiResponse<{ items: { id: number; original_name: string; status: string; created_at: string }[] }>
    >('/affiliate/invoices');
    return data.data.items;
  },

  uploadInvoice: async (file: File, notes?: string) => {
    const form = new FormData();
    form.append('invoice', file);
    if (notes) form.append('notes', notes);
    const { data } = await api.post<ApiResponse<{ id: number; status: string }>>(
      '/affiliate/invoices',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data;
  },

  getReferrals: async () => {
    const { data } = await api.get<
      ApiResponse<{
        override_rate: number;
        recruitment_link: string;
        sub_affiliates: AffiliateSubAffiliate[];
      }>
    >('/affiliate/referrals');
    return data.data;
  },

  getSupport: async () => {
    const { data } = await api.get<ApiResponse<AffiliateSupport>>('/affiliate/support');
    return data.data;
  },
};
