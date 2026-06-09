import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';

export function useGameTypes() {
  const types = useGameStore((s) => s.types);
  const loading = useGameStore((s) => s.loadingTypes);
  const fetchTypes = useGameStore((s) => s.fetchTypes);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  return { types, loading };
}
