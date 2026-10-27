/**
 * Native builds read Firebase Realtime Database JSON and use it as the
 * API / Reverb / assets configuration. Any failure keeps the build-time env.
 */

export interface MobileEndpointConfig {
  apiUrl: string;
  reverbHost?: string;
  reverbPort?: number;
  reverbScheme?: 'http' | 'https';
  reverbAppKey?: string;
  assetsBaseUrl?: string;
}

const ENDPOINT_PATH = 'mobile/endpoints.json';
const CAPACITOR_HTTP_INTERCEPTOR = '/_capacitor_http_interceptor_';
const DEFAULT_TIMEOUT_MS = 5000;

let resolved: MobileEndpointConfig | null = null;

export function getResolvedMobileEndpoints(): MobileEndpointConfig | null {
  return resolved;
}

export function clearResolvedMobileEndpoints(): void {
  resolved = null;
}

export function firebaseEndpointUrl(databaseUrl: string): string | null {
  const trimmed = databaseUrl.trim().replace(/\/+$/, '');
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.protocol !== 'https:') return null;
  if (url.username || url.password || url.search || url.hash) return null;
  if (url.pathname !== '/' && url.pathname !== '') return null;
  if (!isFirebaseHost(url.hostname)) return null;

  return `${url.origin}/${ENDPOINT_PATH}`;
}

export function parseEndpointDocument(body: string): MobileEndpointConfig | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null;
  }

  const record = parsed as Record<string, unknown>;
  const apiUrl = httpUrl(record.apiUrl);
  if (!apiUrl) return null;

  const config: MobileEndpointConfig = { apiUrl };
  const reverbHost = typeof record.reverbHost === 'string' ? record.reverbHost.trim() : '';
  if (reverbHost) config.reverbHost = reverbHost;

  const reverbPort = Number(record.reverbPort);
  if (Number.isInteger(reverbPort) && reverbPort >= 1 && reverbPort <= 65535) {
    config.reverbPort = reverbPort;
  }

  if (record.reverbScheme === 'http' || record.reverbScheme === 'https') {
    config.reverbScheme = record.reverbScheme;
  }

  const reverbAppKey = typeof record.reverbAppKey === 'string' ? record.reverbAppKey.trim() : '';
  if (reverbAppKey) config.reverbAppKey = reverbAppKey;

  const assetsBaseUrl = httpUrl(record.assetsBaseUrl);
  if (assetsBaseUrl) config.assetsBaseUrl = assetsBaseUrl;

  return config;
}

export async function resolveMobileEndpoints(options?: {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  databaseUrl?: string;
}): Promise<MobileEndpointConfig | null> {
  const databaseUrl = (options?.databaseUrl ?? import.meta.env.VITE_FIREBASE_DATABASE_URL ?? '').trim();
  const endpointUrl = firebaseEndpointUrl(databaseUrl);

  if (!endpointUrl) {
    resolved = null;
    console.warn('[mobile-endpoints]', 'missing-database-url');
    return null;
  }

  const fetchImpl = options?.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options?.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetchImpl(endpointUrl, { method: 'GET', signal: controller.signal });
    const text = (await response.text()).trim();
    if (!response.ok || !text || text === 'null' || !responseStayedOnFirebase(response)) {
      resolved = null;
      console.warn('[mobile-endpoints]', 'request-failed');
      return null;
    }

    const config = parseEndpointDocument(text);
    resolved = config;
    console.warn('[mobile-endpoints]', config?.apiUrl ?? 'parse-failed');
    return config;
  } catch {
    resolved = null;
    console.warn('[mobile-endpoints]', 'request-failed');
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function isFirebaseHost(hostname: string): boolean {
  const host = hostname.toLowerCase();

  return host.endsWith('.firebasedatabase.app') || host.endsWith('.firebaseio.com');
}

function responseStayedOnFirebase(response: Response): boolean {
  if (!response.url) return true;

  try {
    const url = new URL(response.url);
    if (url.pathname === CAPACITOR_HTTP_INTERCEPTOR) {
      const target = url.searchParams.get('u');
      if (!target) return false;
      return isFirebaseHost(new URL(target).hostname);
    }

    return isFirebaseHost(url.hostname);
  } catch {
    return false;
  }
}

function httpUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().replace(/\/+$/, '');
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return trimmed;
  } catch {
    return null;
  }
}
