import { useGameStore } from '@/stores/gameStore';

export function useGameVendors() {
  const vendors = useGameStore((s) => s.vendors);
  const loading = useGameStore((s) => s.loadingVendors);

  return { vendors, loading };
}
