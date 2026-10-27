import api from '@/api/axios';
import type { ApiResponse, HeroBannersResponse } from '@/types';

export const platformApi = {
  getBanners: async (): Promise<HeroBannersResponse> => {
    const { data } = await api.get<ApiResponse<HeroBannersResponse>>('/platform/banners');
    return {
      slides: data.data?.slides ?? [],
      show_default_hero: data.data?.show_default_hero ?? true,
    };
  },
};
