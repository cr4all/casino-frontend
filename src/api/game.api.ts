import api from '@/api/axios';
import type { ApiResponse, Game } from '@/types';

export interface GameVendor {
  id: number;
  slug: string;
  name: string;
  logo_url: string | null;
  game_count: number;
}

export interface GameType {
  id: number;
  slug: string;
  name: string;
  icon: string | null;
  game_count: number;
}

export interface GameCollection {
  slug: string;
  name: string;
  games: Game[];
}

export interface LaunchResult {
  launch_url: string;
  session_id: number;
  session_token: string;
  expires_at: string | null;
}

export const gameApi = {
  getVendors: async () => {
    const { data } = await api.get<ApiResponse<GameVendor[]>>('/games/vendors');
    return data.data;
  },

  getTypes: async () => {
    const { data } = await api.get<ApiResponse<GameType[]>>('/games/types');
    return data.data;
  },

  getCollection: async (slug: string) => {
    const { data } = await api.get<ApiResponse<GameCollection>>(`/games/collections/${slug}`);
    return data.data;
  },

  getGames: async (params?: {
    vendor?: number;
    type?: string;
    collection?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }) => {
    const { data } = await api.get<
      ApiResponse<{ items: Game[]; pagination: { current_page: number; last_page: number; total: number } }>
    >('/games', { params });
    return data.data;
  },

  launch: async (gameId: number) => {
    const { data } = await api.post<ApiResponse<LaunchResult>>(`/games/${gameId}/launch`);
    return data.data;
  },

  getGame: async (gameId: number) => {
    const { data } = await api.get<ApiResponse<Game>>(`/games/${gameId}`);
    return data.data;
  },
};
