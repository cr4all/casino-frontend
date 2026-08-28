import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePlayerSession } from '@/hooks/usePlayerSession';
import { useSupportTicketStore } from '@/stores/supportTicketStore';

const POLL_INTERVAL_MS = 15_000;

export function useSupportTicketSync() {
  const location = useLocation();
  const { hasHydrated, enabled } = usePlayerSession();
  const fetchUnreadCount = useSupportTicketStore((s) => s.fetchUnreadCount);
  const clear = useSupportTicketStore((s) => s.clear);

  useEffect(() => {
    if (!hasHydrated) return;

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
  }, [hasHydrated, enabled, fetchUnreadCount, clear]);

  useEffect(() => {
    if (!enabled) return;
    void fetchUnreadCount();
  }, [location.pathname, enabled, fetchUnreadCount]);
}
