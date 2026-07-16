import posthog from 'posthog-js';

const key = import.meta.env.VITE_POSTHOG_KEY?.trim() ?? '';
const host = import.meta.env.VITE_POSTHOG_HOST?.trim() || 'https://us.i.posthog.com';

let initialized = false;

export function isPostHogConfigured(): boolean {
  return Boolean(key);
}

export function getPostHogClient() {
  return posthog;
}

export function enablePostHog(): void {
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
}

export function disablePostHog(): void {
  if (!initialized) return;
  posthog.opt_out_capturing();
}

export function identifyPlayer(playerId: number, properties?: { email?: string }): void {
  if (!initialized || !key) return;
  posthog.identify(String(playerId), properties);
}

export function resetPostHog(): void {
  if (!initialized) return;
  posthog.reset();
}

export function capturePageview(pathname: string, search: string = ''): void {
  if (!initialized || !key) return;
  posthog.capture('$pageview', {
    $current_url: `${window.location.origin}${pathname}${search}`,
  });
}
