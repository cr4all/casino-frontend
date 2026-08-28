import { useEffect } from 'react';
import { usePlayerSession } from '@/hooks/usePlayerSession';
import { usePlayerStore } from '@/stores/playerStore';

export function usePlayerProfileSync() {
  const { hasHydrated, enabled } = usePlayerSession();
  const fetchProfile = usePlayerStore((s) => s.fetchProfile);
  const clear = usePlayerStore((s) => s.clear);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!enabled) {
      clear();
      return;
    }

    void fetchProfile();
  }, [hasHydrated, enabled, fetchProfile, clear]);
}
