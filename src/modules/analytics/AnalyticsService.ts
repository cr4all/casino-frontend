import posthog from 'posthog-js';
import {
  canLoadAnalytics,
  useCookieConsentStore,
} from '@/stores/cookieConsentStore';
import {
  CasinoAnalyticsEvent,
  type CasinoAnalyticsEventProperties,
} from './events';

const key = import.meta.env.VITE_POSTHOG_KEY?.trim() ?? '';
const host = import.meta.env.VITE_POSTHOG_HOST?.trim() || 'https://us.i.posthog.com';

let initialized = false;

function isConfigured(): boolean {
  return Boolean(key);
}

function isCapturingAllowed(): boolean {
  if (!initialized || !key) return false;
  const { level, preferences } = useCookieConsentStore.getState();
  return canLoadAnalytics(level, preferences);
}

export const AnalyticsService = {
  isConfigured,

  getClient() {
    return posthog;
  },

  enable(): void {
    if (!key) return;

    if (!initialized) {
      posthog.init(key, {
        api_host: host,
        defaults: '2026-05-30',
        capture_pageview: false,
        persistence: 'localStorage+cookie',
      });
      initialized = true;
      return;
    }

    posthog.opt_in_capturing();
  },

  disable(): void {
    if (!initialized) return;
    posthog.opt_out_capturing();
  },

  identify(playerId: number, properties?: { email?: string }): void {
    if (!isCapturingAllowed()) return;
    posthog.identify(String(playerId), properties);
  },

  reset(): void {
    if (!initialized) return;
    posthog.reset();
  },

  capturePageview(pathname: string, search: string = ''): void {
    if (!isCapturingAllowed()) return;
    posthog.capture(CasinoAnalyticsEvent.PageView, {
      $current_url: `${window.location.origin}${pathname}${search}`,
    });
  },

  track<E extends CasinoAnalyticsEvent>(
    event: E,
    properties: CasinoAnalyticsEventProperties[E],
  ): void {
    if (!isCapturingAllowed()) return;
    posthog.capture(event, properties as Record<string, unknown>);
  },
};
