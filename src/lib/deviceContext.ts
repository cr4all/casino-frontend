import FingerprintJS from '@fingerprintjs/fingerprintjs';

export interface ClientRiskContext {
  fingerprint?: string | null;
  fingerprint_version?: string | null;
  user_agent?: string | null;
  browser_language?: string | null;
  timezone?: string | null;
  platform?: string | null;
  screen_resolution?: string | null;
}

let cached: ClientRiskContext | null = null;
let loadPromise: Promise<ClientRiskContext> | null = null;

function collectBrowserSignals(): ClientRiskContext {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const screenResolution =
    typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : null;

  return {
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    browser_language: typeof navigator !== 'undefined' ? navigator.language : null,
    timezone: timezone || null,
    platform: typeof navigator !== 'undefined' ? navigator.platform : null,
    screen_resolution: screenResolution,
  };
}

async function collectDeviceContext(): Promise<ClientRiskContext> {
  const browser = collectBrowserSignals();

  try {
    const agent = await FingerprintJS.load();
    const result = await agent.get();

    return {
      ...browser,
      fingerprint: result.visitorId,
      fingerprint_version: result.version,
    };
  } catch {
    return browser;
  }
}

export function prefetchDeviceContext(): void {
  if (cached !== null || loadPromise !== null) {
    return;
  }

  loadPromise = collectDeviceContext()
    .then((context) => {
      cached = context;
      return context;
    })
    .finally(() => {
      loadPromise = null;
    });
}

export async function getDeviceContext(): Promise<ClientRiskContext> {
  if (cached !== null) {
    return cached;
  }

  if (loadPromise !== null) {
    return loadPromise;
  }

  const context = await collectDeviceContext();
  cached = context;

  return context;
}
