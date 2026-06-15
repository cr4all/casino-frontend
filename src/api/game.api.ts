import api from '@/api/axios';
import type { ApiResponse, Game, PaginatedBetHistory } from '@/types';

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

export interface GamesListParams {
  vendor?: number;
  type?: string;
  collection?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface GamesListResult {
  items: Game[];
  pagination: { current_page: number; last_page: number; total: number };
}

function requestKey(prefix: string, params: Record<string, unknown>): string {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b));
  return `${prefix}:${JSON.stringify(Object.fromEntries(entries))}`;
}

function dedupeRequest<T>(key: string, request: () => Promise<T>): Promise<T> {
  const inflight = dedupeRequestInflight.get(key) as Promise<T> | undefined;
  if (inflight) return inflight;

  const promise = request().finally(() => {
    if (dedupeRequestInflight.get(key) === promise) {
      dedupeRequestInflight.delete(key);
    }
  });

  dedupeRequestInflight.set(key, promise);
  return promise;
}

const dedupeRequestInflight = new Map<string, Promise<unknown>>();

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
    const key = requestKey('collection', { slug });
    return dedupeRequest(key, async () => {
      const { data } = await api.get<ApiResponse<GameCollection>>(`/games/collections/${slug}`);
      return data.data;
    });
  },

  getGames: async (params?: GamesListParams) => {
    const key = requestKey('games', (params ?? {}) as Record<string, unknown>);
    return dedupeRequest(key, async () => {
      const { data } = await api.get<ApiResponse<GamesListResult>>('/games', { params });
      return data.data;
    });
  },

  launch: async (gameId: number) => {
    const { data } = await api.post<ApiResponse<LaunchResult>>(`/games/${gameId}/launch`);
    return data.data;
  },

  getGame: async (gameId: number) => {
    const { data } = await api.get<ApiResponse<Game>>(`/games/${gameId}`);
    return data.data;
  },

  getBets: async (page = 1, perPage = 20) => {
    const { data } = await api.get<ApiResponse<PaginatedBetHistory>>('/games/bets', {
      params: { page, per_page: perPage },
    });
    return data.data;
  },
};
