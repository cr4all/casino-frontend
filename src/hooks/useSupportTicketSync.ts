import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useSupportTicketStore } from '@/stores/supportTicketStore';

const POLL_INTERVAL_MS = 15_000;

export function useSupportTicketSync() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const fetchUnreadCount = useSupportTicketStore((s) => s.fetchUnreadCount);
  const clear = useSupportTicketStore((s) => s.clear);

  const enabled = isAuthenticated && user?.role !== 'affiliate';

  useEffect(() => {
    if (!enabled) {
      clear();
      return;
    }

    void fetchUnreadCount();

    const pollId = window.setInterval(() => {
      void fetchUnreadCount();
    }, POLL_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void fetchUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(pollId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enabled, fetchUnreadCount, clear]);

  useEffect(() => {
    if (!enabled) return;
    void fetchUnreadCount();
  }, [location.pathname, enabled, fetchUnreadCount]);
}
