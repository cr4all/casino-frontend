/**
 * Native builds read the latest Pastebin paste as JSON and use it as the
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

const LIST_URL = 'https://pastebin.com/api/api_post.php';
const RAW_URL = 'https://pastebin.com/api/api_raw.php';
const DEFAULT_TIMEOUT_MS = 5000;

let resolved: MobileEndpointConfig | null = null;

export function getResolvedMobileEndpoints(): MobileEndpointConfig | null {
  return resolved;
}

export function clearResolvedMobileEndpoints(): void {
  resolved = null;
}

export function selectLatestPasteKey(listing: string): string | null {
  const trimmed = listing.trim();
  if (!trimmed || /^no pastes found\.?$/i.test(trimmed) || trimmed.startsWith('Bad API request')) {
    return null;
  }

  let latestKey: string | null = null;
  let latestDate = -1;

  for (const match of listing.matchAll(/<paste>([\s\S]*?)<\/paste>/gi)) {
    const block = match[1] ?? '';
    const key = block.match(/<paste_key>([^<]+)<\/paste_key>/i)?.[1]?.trim() ?? '';
    const date = Number(block.match(/<paste_date>(\d+)<\/paste_date>/i)?.[1]);
    if (!key || !Number.isFinite(date)) continue;
    if (date >= latestDate) {
      latestDate = date;
      latestKey = key;
    }
  }

  return latestKey;
}

export function parseEndpointPaste(body: string): MobileEndpointConfig | null {
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
  devKey?: string;
  userKey?: string;
}): Promise<MobileEndpointConfig | null> {
  const devKey = (options?.devKey ?? import.meta.env.VITE_PASTEBIN_API_DEV_KEY ?? '').trim();
  const userKey = (options?.userKey ?? import.meta.env.VITE_PASTEBIN_API_USER_KEY ?? '').trim();

  if (!devKey || !userKey) {
    resolved = null;
    return null;
  }

  const fetchImpl = options?.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options?.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const listing = await postForm(
      LIST_URL,
      {
        api_option: 'list',
        api_dev_key: devKey,
        api_user_key: userKey,
        api_results_limit: '50',
      },
      fetchImpl,
      controller.signal,
    );
    const pasteKey = selectLatestPasteKey(listing);
    if (!pasteKey) {
      resolved = null;
      return null;
    }

    const raw = await postForm(
      RAW_URL,
      {
        api_option: 'show_paste',
        api_dev_key: devKey,
        api_user_key: userKey,
        api_paste_key: pasteKey,
      },
      fetchImpl,
      controller.signal,
    );
    const config = parseEndpointPaste(raw);
    resolved = config;
    return config;
  } catch {
    resolved = null;
    return null;
  } finally {
    clearTimeout(timer);
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

async function postForm(
  url: string,
  fields: Record<string, string>,
  fetchImpl: typeof fetch,
  signal: AbortSignal,
): Promise<string> {
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields),
    signal,
  });

  const text = await response.text();
  if (!response.ok || text.startsWith('Bad API request')) {
    throw new Error('Pastebin request failed');
  }

  return text;
}
