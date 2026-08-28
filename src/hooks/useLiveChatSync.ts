import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePlayerSession } from '@/hooks/usePlayerSession';
import { useLiveChatStore } from '@/stores/liveChatStore';
import { useUiStore } from '@/stores/uiStore';

const POLL_INTERVAL_MS = 15_000;

export function useLiveChatSync() {
  const location = useLocation();
  const { hasHydrated, enabled } = usePlayerSession();
  const liveChatOpen = useUiStore((s) => s.liveChatOpen);
  const fetchUnreadCount = useLiveChatStore((s) => s.fetchUnreadCount);
  const clear = useLiveChatStore((s) => s.clear);

  useEffect(() => {
    if (!hasHydrated) return;

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
  }, [hasHydrated, enabled, liveChatOpen, fetchUnreadCount, clear]);

  useEffect(() => {
    if (!enabled || liveChatOpen) return;
    void fetchUnreadCount();
  }, [location.pathname, enabled, liveChatOpen, fetchUnreadCount]);
}
