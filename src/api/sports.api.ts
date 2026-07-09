import api from '@/api/axios';
import type { ApiResponse, PaginationMeta } from '@/types';

export type SportsIframeMode = 'prematch' | 'live' | 'history';

export interface SportsLaunchResult {
  launch_url: string;
  expires_at: string | null;
}

export interface SportsBetItem {
  id: number;
  round_id: number;
  payment_id: number;
  stake: string;
  win_amount: string;
  odd_factor: string | null;
  type: string | null;
  status: string;
  created_at: string;
}

export interface PaginatedSportsBets {
  items: SportsBetItem[];
  pagination: PaginationMeta;
}

export const sportsApi = {
  launch: async (mode: SportsIframeMode, oddFormat?: string) => {
    const { data } = await api.post<ApiResponse<SportsLaunchResult>>('/sports/launch', {
      mode,
      odd_format: oddFormat,
    });
    return data.data;
  },

  getBets: async (page = 1, perPage = 20) => {
    const { data } = await api.get<ApiResponse<PaginatedSportsBets>>('/sports/bets', {
      params: { page, per_page: perPage },
    });
    return data.data;
  },
};
