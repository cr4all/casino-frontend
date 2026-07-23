/**
 * Resolves player API / Reverb endpoints from the browser host.
 *
 * Production (Cloudflare multi-domain):
 *   ibets24.eu       → https://api.ibets24.eu/api/v1
 *   www.ibets24.eu   → https://api.ibets24.eu/api/v1
 *   dev.ibets24.com  → https://api-dev.ibets24.com/api/v1  (avoids nested *.*.TLD CF SSL gap)
 *
 * Local Vite DEV / IP / localhost keeps VITE_* overrides.
 */

export function isLocalOrIpHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)
  );
}

export function apexHostname(hostname: string): string {
  return hostname.replace(/^www\./i, '');
}

export function apiHostname(hostname: string): string {
  const apex = apexHostname(hostname);

  // Already on the API host.
  if (apex.startsWith('api.') || apex.startsWith('api-')) {
    return apex;
  }

  // dev.example.com → api-dev.example.com (single-label subdomain for CF Universal SSL)
  if (apex.startsWith('dev.')) {
    return `api-${apex}`;
  }

  return `api.${apex}`;
}

export function resolveApiBaseUrl(options: {
  hostname: string;
  protocol: string;
  isDev: boolean;
  override?: string;
}): string {
  const { hostname, protocol, isDev, override } = options;
  const trimmed = override?.trim();

  if (isDev || isLocalOrIpHost(hostname)) {
    return trimmed || 'http://localhost:8000/api/v1';
  }

  return `${protocol}//${apiHostname(hostname)}/api/v1`;
}

export function resolveReverbHost(options: {
  hostname: string;
  isDev: boolean;
  override?: string;
}): string {
  const { hostname, isDev, override } = options;
  const trimmed = override?.trim();

  if (isDev || isLocalOrIpHost(hostname)) {
    return trimmed || 'localhost';
  }

  return apiHostname(hostname);
}

export function resolveReverbScheme(options: {
  hostname: string;
  protocol: string;
  isDev: boolean;
  override?: string;
}): string {
  const { hostname, protocol, isDev, override } = options;
  const trimmed = override?.trim();

  if (isDev || isLocalOrIpHost(hostname)) {
    return trimmed || 'http';
  }

  return protocol === 'https:' ? 'https' : 'http';
}

export function resolveReverbPort(options: {
  hostname: string;
  protocol: string;
  isDev: boolean;
  override?: string;
}): number {
  const { hostname, protocol, isDev, override } = options;
  const raw = override?.trim();

  if (isDev || isLocalOrIpHost(hostname)) {
    return Number(raw || 8080);
  }

  return protocol === 'https:' ? 443 : 80;
}

/** API base including `/api/v1` (no trailing slash). */
export function getApiBaseUrl(): string {
  const override = import.meta.env.VITE_API_URL;

  if (typeof window === 'undefined' || !window.location?.hostname) {
    return override?.trim() || 'http://localhost:8000/api/v1';
  }

  return resolveApiBaseUrl({
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    isDev: import.meta.env.DEV,
    override,
  });
}

export function getReverbHost(): string {
  return resolveReverbHost({
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
    isDev: import.meta.env.DEV,
    override: import.meta.env.VITE_REVERB_HOST,
  });
}

export function getReverbScheme(): string {
  return resolveReverbScheme({
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
    protocol: typeof window !== 'undefined' ? window.location.protocol : 'http:',
    isDev: import.meta.env.DEV,
    override: import.meta.env.VITE_REVERB_SCHEME,
  });
}

export function getReverbPort(): number {
  return resolveReverbPort({
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
    protocol: typeof window !== 'undefined' ? window.location.protocol : 'http:',
    isDev: import.meta.env.DEV,
    override: import.meta.env.VITE_REVERB_PORT,
  });
}
