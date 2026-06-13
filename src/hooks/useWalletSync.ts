import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { subscribeWalletBalance } from '@/api/walletRealtime';
import { disconnectEcho } from '@/lib/echo';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/stores/walletStore';

const POLL_INTERVAL_PLAYING_MS = 5_000;
const POLL_INTERVAL_DEFAULT_MS = 30_000;
const WS_RETRY_LIMIT = 3;

export function useWalletSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const playerId = useWalletStore((s) => s.balance?.player_id);
  const fetchBalance = useWalletStore((s) => s.fetchBalance);
  const applyBalanceUpdate = useWalletStore((s) => s.applyBalanceUpdate);
  const location = useLocation();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsFailuresRef = useRef(0);
  const isPlayingRef = useRef(false);

  const enabled = isAuthenticated && user?.role !== 'affiliate';

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = () => {
    if (pollRef.current) {
      return;
    }

    void fetchBalance();
    const intervalMs = isPlayingRef.current ? POLL_INTERVAL_PLAYING_MS : POLL_INTERVAL_DEFAULT_MS;
    pollRef.current = setInterval(() => {
      void fetchBalance();
    }, intervalMs);
  };

  useEffect(() => {
    isPlayingRef.current =
      /\/games\/\d+\/play$/.test(location.pathname) ||
      location.pathname.endsWith('/play');

    if (!pollRef.current) {
      return;
    }

    stopPolling();
    startPolling();
  }, [location.pathname]);

  useEffect(() => {
    if (!enabled) {
      disconnectEcho();
      stopPolling();
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    const connectWebSocket = (resolvedPlayerId: number) => {
      unsubscribe?.();

      unsubscribe = subscribeWalletBalance({
        playerId: resolvedPlayerId,
        onBalance: (update) => {
          applyBalanceUpdate(update);
          wsFailuresRef.current = 0;
          stopPolling();
        },
        onConnected: () => {
          wsFailuresRef.current = 0;
          stopPolling();
        },
        onError: () => {
          wsFailuresRef.current += 1;
          if (wsFailuresRef.current >= WS_RETRY_LIMIT) {
            startPolling();
          }
        },
      });
    };

    const bootstrap = async () => {
      wsFailuresRef.current = 0;

      let resolvedPlayerId = playerId ?? null;

      if (resolvedPlayerId === null) {
        await fetchBalance();
        resolvedPlayerId = useWalletStore.getState().balance?.player_id ?? null;
      }

      if (cancelled || resolvedPlayerId === null) {
        if (!cancelled && resolvedPlayerId === null) {
          startPolling();
        }
        return;
      }

      connectWebSocket(resolvedPlayerId);
    };

    void bootstrap();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void fetchBalance();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      unsubscribe?.();
      disconnectEcho();
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enabled, playerId, fetchBalance, applyBalanceUpdate]);
}
