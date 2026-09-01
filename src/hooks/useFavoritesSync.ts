import { useEffect } from 'react';
import { usePlayerSession } from '@/hooks/usePlayerSession';
import { useFavoritesStore } from '@/stores/favoritesStore';

export function useFavoritesSync() {
  const { hasHydrated, enabled } = usePlayerSession();
  const fetchFavorites = useFavoritesStore((s) => s.fetchFavorites);
  const clear = useFavoritesStore((s) => s.clear);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!enabled) {
      clear();
      return;
    }

    void fetchFavorites();
  }, [hasHydrated, enabled, fetchFavorites, clear]);
}
