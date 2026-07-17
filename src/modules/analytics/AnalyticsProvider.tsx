import { useEffect, useRef, type ReactNode } from 'react';
import { PostHogProvider } from '@posthog/react';
import { router } from '@/router';
import {
  canLoadAnalytics,
  useCookieConsentStore,
} from '@/stores/cookieConsentStore';
import { useAuthStore } from '@/stores/authStore';
import { usePlayerStore } from '@/stores/playerStore';
import { AnalyticsService } from './AnalyticsService';

function AnalyticsLifecycle() {
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
      AnalyticsService.enable();
    } else {
      AnalyticsService.disable();
    }
  }, [analyticsAllowed, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated || !analyticsAllowed) return;

    const captureCurrent = () => {
      const { pathname, search } = window.location;
      const pathKey = `${pathname}${search}`;
      if (lastPathRef.current === pathKey) return;
      lastPathRef.current = pathKey;
      AnalyticsService.capturePageview(pathname, search);
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
        AnalyticsService.reset();
        wasAuthenticatedRef.current = false;
      }
      return;
    }

    wasAuthenticatedRef.current = true;

    if (playerId == null) return;

    AnalyticsService.identify(playerId, userEmail ? { email: userEmail } : undefined);
  }, [analyticsAllowed, hasHydrated, isAuthenticated, playerId, userEmail]);

  return null;
}

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  if (!AnalyticsService.isConfigured()) {
    return <>{children}</>;
  }

  return (
    <PostHogProvider client={AnalyticsService.getClient()}>
      {children}
      <AnalyticsLifecycle />
    </PostHogProvider>
  );
}
