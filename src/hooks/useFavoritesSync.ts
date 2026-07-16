import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useFavoritesStore } from '@/stores/favoritesStore';

export function useFavoritesSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const fetchFavorites = useFavoritesStore((s) => s.fetchFavorites);
  const clear = useFavoritesStore((s) => s.clear);

  const enabled = isAuthenticated && user?.role !== 'affiliate';

  useEffect(() => {
    if (!enabled) {
      clear();
      return;
    }

    void fetchFavorites();

    const unsubHydration = useAuthStore.persist.onFinishHydration(() => {
      if (useAuthStore.getState().isAuthenticated) {
        void fetchFavorites();
      }
    });

    return () => {
      unsubHydration?.();
    };
  }, [enabled, fetchFavorites, clear]);
}
