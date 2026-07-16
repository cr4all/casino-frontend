import { useEffect, useRef } from 'react';
import { router } from '@/router';
import {
  canLoadAnalytics,
  useCookieConsentStore,
} from '@/stores/cookieConsentStore';
import { useAuthStore } from '@/stores/authStore';
import { usePlayerStore } from '@/stores/playerStore';
import {
  capturePageview,
  disablePostHog,
  enablePostHog,
  identifyPlayer,
  isPostHogConfigured,
  resetPostHog,
} from '@/lib/posthog';

export function PostHogAnalytics() {
  if (!isPostHogConfigured()) return null;

  return <PostHogAnalyticsInner />;
}

function PostHogAnalyticsInner() {
  const hasHydrated = useCookieConsentStore((s) => s.hasHydrated);
  const level = useCookieConsentStore((s) => s.level);
  const preferences = useCookieConsentStore((s) => s.preferences);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userEmail = useAuthStore((s) => s.user?.email);
  const playerId = usePlayerStore((s) => s.profile?.id);
  const analyticsAllowed = canLoadAnalytics(level, preferences);
  const wasAuthenticatedRef = useRef(false);
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;

    if (analyticsAllowed) {
      enablePostHog();
    } else {
      disablePostHog();
    }
  }, [analyticsAllowed, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated || !analyticsAllowed) return;

    const captureCurrent = () => {
      const { pathname, search } = window.location;
      const key = `${pathname}${search}`;
      if (lastPathRef.current === key) return;
      lastPathRef.current = key;
      capturePageview(pathname, search);
    };

    captureCurrent();

    return router.subscribe(() => {
      captureCurrent();
    });
  }, [analyticsAllowed, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated || !analyticsAllowed) return;

    if (!isAuthenticated) {
      if (wasAuthenticatedRef.current) {
        resetPostHog();
        wasAuthenticatedRef.current = false;
      }
      return;
    }

    wasAuthenticatedRef.current = true;

    if (playerId == null) return;

    identifyPlayer(playerId, userEmail ? { email: userEmail } : undefined);
  }, [analyticsAllowed, hasHydrated, isAuthenticated, playerId, userEmail]);

  return null;
}
