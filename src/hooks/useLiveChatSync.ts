import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLiveChatStore } from '@/stores/liveChatStore';
import { useUiStore } from '@/stores/uiStore';

const POLL_INTERVAL_MS = 15_000;

export function useLiveChatSync() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const liveChatOpen = useUiStore((s) => s.liveChatOpen);
  const fetchUnreadCount = useLiveChatStore((s) => s.fetchUnreadCount);
  const clear = useLiveChatStore((s) => s.clear);

  const enabled = isAuthenticated && user?.role !== 'affiliate';

  useEffect(() => {
    if (!enabled) {
      clear();
      return;
    }

    if (liveChatOpen) {
      useLiveChatStore.getState().setUnreadCount(0);
      return;
    }

    void fetchUnreadCount();

    const pollId = window.setInterval(() => {
      void fetchUnreadCount();
    }, POLL_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !useUiStore.getState().liveChatOpen) {
        void fetchUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(pollId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enabled, liveChatOpen, fetchUnreadCount, clear]);

  useEffect(() => {
    if (!enabled || liveChatOpen) return;
    void fetchUnreadCount();
  }, [location.pathname, enabled, liveChatOpen, fetchUnreadCount]);
}
