import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { subscribeWalletBalance } from '@/api/walletRealtime';
import { usePlayerSession } from '@/hooks/usePlayerSession';
import { disconnectEcho, refreshEchoToken } from '@/lib/echo';
import { useWalletStore } from '@/stores/walletStore';

const POLL_INTERVAL_PLAYING_MS = 5_000;
const POLL_INTERVAL_DEFAULT_MS = 30_000;
const WS_RETRY_LIMIT = 3;

function isPlayingPath(pathname: string): boolean {
  return (
    pathname.startsWith('/sports') ||
    /\/games\/\d+\/play$/.test(pathname) ||
    pathname.endsWith('/play')
  );
}

export function useWalletSync() {
  const { hasHydrated, enabled } = usePlayerSession();
  const playerId = useWalletStore((s) => s.balance?.player_id);
  const fetchBalance = useWalletStore((s) => s.fetchBalance);
  const applyBalanceUpdate = useWalletStore((s) => s.applyBalanceUpdate);
  const location = useLocation();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsFailuresRef = useRef(0);
  const isPlayingRef = useRef(false);
  const activePlayerIdRef = useRef<number | null>(null);

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

  /** While playing (sports / game), keep REST poll as a safety net even if Echo is up. */
  const syncPollingAfterRealtime = () => {
    wsFailuresRef.current = 0;

    if (isPlayingRef.current) {
      if (!pollRef.current) {
        startPolling();
      }
      return;
    }

    stopPolling();
  };

  useEffect(() => {
    isPlayingRef.current = isPlayingPath(location.pathname);

    if (!enabled) {
      return;
    }

    if (isPlayingRef.current) {
      stopPolling();
      startPolling();
      return;
    }

    if (pollRef.current) {
      stopPolling();
      if (wsFailuresRef.current >= WS_RETRY_LIMIT) {
        startPolling();
      }
    }
  }, [location.pathname, enabled, fetchBalance]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!enabled) {
      activePlayerIdRef.current = null;
      disconnectEcho();
      stopPolling();
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    const connectWebSocket = (resolvedPlayerId: number) => {
      activePlayerIdRef.current = resolvedPlayerId;
      unsubscribe?.();

      unsubscribe = subscribeWalletBalance({
        playerId: resolvedPlayerId,
        onBalance: (update) => {
          applyBalanceUpdate(update);
          syncPollingAfterRealtime();
        },
        onConnected: () => {
          syncPollingAfterRealtime();
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

      if (isPlayingRef.current) {
        startPolling();
      }
    };

    void bootstrap();

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible' || activePlayerIdRef.current === null) {
        return;
      }

      refreshEchoToken();
      wsFailuresRef.current = 0;
      connectWebSocket(activePlayerIdRef.current);
      void fetchBalance();

      if (isPlayingRef.current) {
        stopPolling();
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      activePlayerIdRef.current = null;
      unsubscribe?.();
      disconnectEcho();
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [hasHydrated, enabled, playerId, fetchBalance, applyBalanceUpdate]);
}
