import './instrument';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PostHogProvider } from '@posthog/react';
import * as Sentry from '@sentry/react';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto-condensed/400.css';
import '@fontsource/roboto-condensed/700.css';
import { App } from '@/App';
import { getPostHogClient, isPostHogConfigured } from '@/lib/posthog';
import '@/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found');
}

const app = isPostHogConfigured() ? (
  <PostHogProvider client={getPostHogClient()}>
    <App />
  </PostHogProvider>
) : (
  <App />
);

createRoot(rootElement, {
  onUncaughtError: Sentry.reactErrorHandler(),
  onCaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
}).render(<StrictMode>{app}</StrictMode>);
