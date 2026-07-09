import api from '@/api/axios';
import type { ApiResponse, PlayerLevelTier } from '@/types';

export const playerLevelApi = {
  getTiers: async () => {
    const { data } = await api.get<ApiResponse<PlayerLevelTier[]>>('/player-levels/tiers');
    return data.data;
  },
};
