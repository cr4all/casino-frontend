import { useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';

export function useGameVendors() {
  const vendors = useGameStore((s) => s.vendors);
  const loading = useGameStore((s) => s.loadingVendors);
  const fetchVendors = useGameStore((s) => s.fetchVendors);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  return { vendors, loading };
}
