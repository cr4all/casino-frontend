import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePlayerStore } from '@/stores/playerStore';

export function usePlayerProfileSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const fetchProfile = usePlayerStore((s) => s.fetchProfile);
  const clear = usePlayerStore((s) => s.clear);

  const enabled = isAuthenticated && user?.role !== 'affiliate';

  useEffect(() => {
    if (!enabled) {
      clear();
      return;
    }

    void fetchProfile();
  }, [enabled, fetchProfile, clear]);
}
