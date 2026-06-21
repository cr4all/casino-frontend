import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useBonusStore } from '@/stores/bonusStore';

const POLL_INTERVAL_MS = 30_000;

export function useBonusSync() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const fetchBonusState = useBonusStore((s) => s.fetchBonusState);
  const clear = useBonusStore((s) => s.clear);

  const enabled = isAuthenticated && user?.role !== 'affiliate';

  useEffect(() => {
    if (!enabled) {
      clear();
      return;
    }

    void fetchBonusState();

    const pollId = setInterval(() => {
      void fetchBonusState();
    }, POLL_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void fetchBonusState();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    const unsubHydration = useAuthStore.persist.onFinishHydration(() => {
      if (useAuthStore.getState().isAuthenticated) {
        void fetchBonusState();
      }
    });

    return () => {
      clearInterval(pollId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
      unsubHydration?.();
    };
  }, [enabled, fetchBonusState, clear]);

  useEffect(() => {
    if (!enabled) return;
    void fetchBonusState();
  }, [location.pathname, enabled, fetchBonusState]);
}
