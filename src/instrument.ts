import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN;

function getTracePropagationTargets(): (string | RegExp)[] {
  const targets: (string | RegExp)[] = [/^\//, /^https?:\/\/api\./];

  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    return targets;
  }

  try {
    const origin = new URL(apiUrl).origin;
    const escapedOrigin = origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    targets.push(new RegExp(`^${escapedOrigin}`));
  } catch {
    // Ignore invalid API URL during local setup.
  }

  return targets;
}

function getTracesSampleRate(): number {
  const raw = import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE;
  if (!raw) {
    return 0.1;
  }

  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0.1;
}

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: getTracesSampleRate(),
    tracePropagationTargets: getTracePropagationTargets(),
  });
}
