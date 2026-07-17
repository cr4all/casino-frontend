import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSessionPolicy } from '@/hooks/useSessionPolicy';
import { AuthService } from '@/services/AuthService';
import { subscribeUserActivity } from '@/utils/userActivity';

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click'] as const;

export function useIdleLogout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const { idleTimeoutMinutes, isLoaded } = useSessionPolicy();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enabled =
    isAuthenticated && user?.role !== 'affiliate' && isLoaded && idleTimeoutMinutes > 0;

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const timeoutMs = idleTimeoutMinutes * 60 * 1000;

    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        AuthService.logout();
      }, timeoutMs);
    };

    const onDomActivity = () => {
      resetTimer();
    };

    for (const event of ACTIVITY_EVENTS) {
      document.addEventListener(event, onDomActivity, { passive: true });
    }

    const unsubscribeActivity = subscribeUserActivity(resetTimer);

    resetTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      for (const event of ACTIVITY_EVENTS) {
        document.removeEventListener(event, onDomActivity);
      }
      unsubscribeActivity();
    };
  }, [enabled, idleTimeoutMinutes]);
}
