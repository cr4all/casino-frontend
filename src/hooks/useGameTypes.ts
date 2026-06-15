import { useGameStore } from '@/stores/gameStore';

export function useGameTypes() {
  const types = useGameStore((s) => s.types);
  const loading = useGameStore((s) => s.loadingTypes);

  return { types, loading };
}
