import api from '@/api/axios';
import type { ApiResponse } from '@/types';

export type BonusClaimBlockedReason =
  | 'deposit_required'
  | 'first_deposit_after_valid_from_required'
  | 'already_claimed'
  | 'provider_not_supported';

export interface BonusPolicy {
  policy_id: number;
  name: string;
  type: string;
  amount_type: string;
  amount_value: string;
  wagering_multiplier: number;
  claimable: boolean;
  claim_blocked_reason?: BonusClaimBlockedReason | null;
  spin_count?: number | null;
  provider_slug?: string | null;
  provider_name?: string | null;
  vendor_names?: string[];
}

export interface ActiveBonus {
  id: number;
  policy_name: string | null;
  type?: string | null;
  amount: string;
  status: string;
  wagering: {
    required: string;
    wagered: string;
  } | null;
  spin_count?: number | null;
  spins_used?: number | null;
  spins_remaining?: number | null;
  provider_slug?: string | null;
  provider_bonus_id?: number | null;
}

export interface ClaimBonusResult {
  bonus_id: number;
  amount: string;
  status: string;
  spin_count?: number | null;
  spins_used?: number | null;
  provider_bonus_id?: number | null;
}

export const bonusApi = {
  getAvailable: async () => {
    const { data } = await api.get<ApiResponse<BonusPolicy[]>>('/bonus/available');
    return data.data;
  },

  getActive: async () => {
    const { data } = await api.get<ApiResponse<ActiveBonus[]>>('/bonus/active');
    return data.data;
  },

  claim: async (policyId: number) => {
    const { data } = await api.post<ApiResponse<ClaimBonusResult>>(`/bonus/${policyId}/claim`);
    return data.data;
  },

  forfeit: async (playerBonusId: number) => {
    const { data } = await api.post<ApiResponse<ClaimBonusResult>>(`/bonus/${playerBonusId}/forfeit`);
    return data.data;
  },
};
