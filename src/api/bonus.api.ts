import api from '@/api/axios';
import type { ApiResponse } from '@/types';

export interface BonusPolicy {
  policy_id: number;
  name: string;
  type: string;
  amount_type: string;
  amount_value: string;
  wagering_multiplier: number;
}

export interface ActiveBonus {
  id: number;
  policy_name: string | null;
  amount: string;
  status: string;
  wagering: {
    required: string;
    wagered: string;
  } | null;
}

export interface ClaimBonusResult {
  bonus_id: number;
  amount: string;
  status: string;
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
};
