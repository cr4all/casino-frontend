import api from '@/api/axios';
import type { ApiResponse } from '@/types';

export interface InviteRewardSummary {
  name: string;
  amount: string;
  amount_type: string;
  wagering_multiplier: string;
  provider_slug?: string | null;
}

export interface InviteStats {
  invited: number;
  pending: number;
  rewarded: number;
  rejected: number;
}

export interface InviteReferralItem {
  id: number;
  status: 'pending' | 'qualified' | 'rewarded' | 'rejected';
  registered_at: string | null;
  qualified_at: string | null;
  rewarded_at: string | null;
  friend: {
    nickname: string | null;
    email: string | null;
  };
}

export interface PlayerInviteOverview {
  enabled: boolean;
  code: string;
  invite_link: string;
  min_deposit_amount: string;
  currency: string;
  referrer_reward: InviteRewardSummary | null;
  invitee_reward: InviteRewardSummary | null;
  stats: InviteStats;
  referrals: InviteReferralItem[];
}

export const inviteApi = {
  async getOverview(): Promise<PlayerInviteOverview> {
    const { data } = await api.get<ApiResponse<PlayerInviteOverview>>('/player/invite');
    return data.data;
  },
};
