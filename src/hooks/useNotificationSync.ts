import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

const POLL_INTERVAL_MS = 30_000;

export function useNotificationSync() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);
  const clear = useNotificationStore((s) => s.clear);

  const enabled = isAuthenticated && user?.role !== 'affiliate';

  useEffect(() => {
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

    const unsubHydration = useAuthStore.persist.onFinishHydration(() => {
      if (useAuthStore.getState().isAuthenticated) {
        void fetchUnreadCount();
      }
    });

    return () => {
      clearInterval(pollId);
      document.removeEventListener('visibilitychange', handleVisibility);
      unsubHydration?.();
    };
  }, [enabled, fetchUnreadCount, clear]);

  useEffect(() => {
    if (!enabled) return;
    void fetchUnreadCount();
  }, [location.pathname, enabled, fetchUnreadCount]);
}
