import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePlayerSession } from '@/hooks/usePlayerSession';
import { useBonusStore } from '@/stores/bonusStore';

const POLL_INTERVAL_MS = 30_000;

export function useBonusSync() {
  const location = useLocation();
  const { hasHydrated, enabled } = usePlayerSession();
  const fetchBonusState = useBonusStore((s) => s.fetchBonusState);
  const clear = useBonusStore((s) => s.clear);

  useEffect(() => {
    if (!hasHydrated) return;

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

    return () => {
      clearInterval(pollId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [hasHydrated, enabled, fetchBonusState, clear]);

  useEffect(() => {
    if (!enabled) return;
    void fetchBonusState();
  }, [location.pathname, enabled, fetchBonusState]);
}
