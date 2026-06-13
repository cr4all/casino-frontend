import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { connectWalletBalanceStream } from '@/api/walletStream';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/stores/walletStore';

const POLL_INTERVAL_PLAYING_MS = 5_000;
const POLL_INTERVAL_DEFAULT_MS = 30_000;
const SSE_RETRY_LIMIT = 3;

export function useWalletSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const fetchBalance = useWalletStore((s) => s.fetchBalance);
  const applyBalanceUpdate = useWalletStore((s) => s.applyBalanceUpdate);
  const location = useLocation();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sseFailuresRef = useRef(0);

  const enabled = isAuthenticated && user?.role !== 'affiliate';
  const isPlaying =
    /\/games\/\d+\/play$/.test(location.pathname) || location.pathname.endsWith('/play');

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const abortController = new AbortController();
    let cancelled = false;

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

      fetchBalance();
      const intervalMs = isPlaying ? POLL_INTERVAL_PLAYING_MS : POLL_INTERVAL_DEFAULT_MS;
      pollRef.current = setInterval(() => {
        void fetchBalance();
      }, intervalMs);
    };

    const connectSse = async () => {
      try {
        await connectWalletBalanceStream({
          signal: abortController.signal,
          onBalance: (update) => {
            applyBalanceUpdate(update);
            sseFailuresRef.current = 0;
            stopPolling();
          },
          onError: () => {
            sseFailuresRef.current += 1;
            if (sseFailuresRef.current >= SSE_RETRY_LIMIT) {
              startPolling();
            }
          },
        });

        if (!cancelled && sseFailuresRef.current >= SSE_RETRY_LIMIT) {
          startPolling();
        }
      } catch {
        if (cancelled || abortController.signal.aborted) {
          return;
        }

        sseFailuresRef.current += 1;
        startPolling();
      }
    };

    sseFailuresRef.current = 0;
    void connectSse();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void fetchBalance();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      abortController.abort();
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [enabled, isPlaying, fetchBalance, applyBalanceUpdate]);
}
