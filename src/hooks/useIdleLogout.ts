import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { subscribeUserActivity } from '@/utils/userActivity';
import { useSessionPolicy } from '@/hooks/useSessionPolicy';

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const;

export function useIdleLogout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const { idleTimeoutMinutes, isLoaded } = useSessionPolicy();

  useEffect(() => {
    if (!isAuthenticated || !isLoaded || idleTimeoutMinutes <= 0) {
      return;
    }

    const idleTimeoutMs = idleTimeoutMinutes * 60 * 1000;
    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => logout(), idleTimeoutMs);
    };

    const handleActivity = () => resetTimer();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        resetTimer();
      }
    };

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });
    document.addEventListener('visibilitychange', handleVisibility);

    const unsubscribeActivity = subscribeUserActivity(handleActivity);

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibility);
      unsubscribeActivity();
    };
  }, [isAuthenticated, isLoaded, idleTimeoutMinutes, logout]);
}
