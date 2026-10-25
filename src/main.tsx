import './instrument';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto-condensed/400.css';
import '@fontsource/roboto-condensed/700.css';
import { App } from '@/App';
import { AnalyticsProvider } from '@/modules/analytics';
import { isNativeApp } from '@/utils/capacitor';
import { resolveMobileEndpoints } from '@/utils/mobileEndpoints';
import '@/index.css';

async function start(): Promise<void> {
  if (isNativeApp()) {
    await resolveMobileEndpoints();
  }

  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Root element #root not found');
  }

  createRoot(rootElement, {
    onUncaughtError: Sentry.reactErrorHandler(),
    onCaughtError: Sentry.reactErrorHandler(),
    onRecoverableError: Sentry.reactErrorHandler(),
  }).render(
    <StrictMode>
      <AnalyticsProvider>
        <App />
      </AnalyticsProvider>
    </StrictMode>,
  );
}

void start();
