import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePlayerSession } from '@/hooks/usePlayerSession';
import { useNotificationStore } from '@/stores/notificationStore';

const POLL_INTERVAL_MS = 30_000;

export function useNotificationSync() {
  const location = useLocation();
  const { hasHydrated, enabled } = usePlayerSession();
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);
  const clear = useNotificationStore((s) => s.clear);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!enabled) {
      clear();
      return;
    }

    void fetchUnreadCount();

    const pollId = setInterval(() => {
      void fetchUnreadCount();
    }, POLL_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void fetchUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(pollId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [hasHydrated, enabled, fetchUnreadCount, clear]);

  useEffect(() => {
    if (!enabled) return;
    void fetchUnreadCount();
  }, [location.pathname, enabled, fetchUnreadCount]);
}
