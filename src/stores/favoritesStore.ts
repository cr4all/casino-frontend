import { create } from 'zustand';
import { gameApi } from '@/api/game.api';

interface FavoritesState {
  favoriteIds: Set<number>;
  loaded: boolean;
  loading: boolean;
  fetchFavorites: () => Promise<void>;
  isFavorite: (gameId: number) => boolean;
  toggleFavorite: (gameId: number) => Promise<void>;
  clear: () => void;
}

const FAVORITES_PER_PAGE = 100;

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: new Set(),
  loaded: false,
  loading: false,

  fetchFavorites: async () => {
    if (get().loading) return;

    set({ loading: true });
    try {
      const ids = new Set<number>();
      let page = 1;
      let lastPage = 1;

      do {
        const data = await gameApi.getFavorites(page, FAVORITES_PER_PAGE);
        for (const game of data.items) {
          ids.add(game.id);
        }
        lastPage = data.pagination.last_page;
        page += 1;
      } while (page <= lastPage);

      set({ favoriteIds: ids, loaded: true, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  isFavorite: (gameId) => get().favoriteIds.has(gameId),

  toggleFavorite: async (gameId) => {
    const currentlyFavorite = get().favoriteIds.has(gameId);
    const next = new Set(get().favoriteIds);

    if (currentlyFavorite) {
      next.delete(gameId);
      set({ favoriteIds: next });
      try {
        await gameApi.removeFavorite(gameId);
      } catch {
        next.add(gameId);
        set({ favoriteIds: new Set(next) });
        throw new Error('Failed to remove favorite');
      }
      return;
    }

    next.add(gameId);
    set({ favoriteIds: next });
    try {
      await gameApi.addFavorite(gameId);
    } catch {
      next.delete(gameId);
      set({ favoriteIds: new Set(next) });
      throw new Error('Failed to add favorite');
    }
  },

  clear: () => set({ favoriteIds: new Set(), loaded: false, loading: false }),
}));
