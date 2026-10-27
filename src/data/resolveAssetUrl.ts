import { getResolvedMobileEndpoints } from '@/utils/mobileEndpoints';

/**
 * Game thumbnails live on the assets host, not in the native app bundle.
 * Used when a mobile build omits VITE_ASSETS_BASE_URL. The WebView origin is
 * https://localhost, so a relative `/providers/...` path would 404.
 */
const MOBILE_ASSETS_BASE_URL = 'https://image.ibets24.com';

function assetsBaseUrl(): string {
  const remote = getResolvedMobileEndpoints()?.assetsBaseUrl?.replace(/\/$/, '') ?? '';
  if (remote) return remote;

  const configured = (import.meta.env.VITE_ASSETS_BASE_URL as string | undefined)?.trim().replace(/\/$/, '') ?? '';
  if (configured) return configured;
  if (import.meta.env.MODE === 'mobile') return MOBILE_ASSETS_BASE_URL;
  return '';
}

/**
 * Prefix relative `/providers/...` paths with the assets host.
 * Absolute http(s) URLs are returned unchanged.
 * When VITE_ASSETS_BASE_URL is unset, relative paths stay relative (FE public fallback).
 */
export function resolveAssetUrl(pathOrUrl: string | null | undefined): string | undefined {
  if (!pathOrUrl) return undefined;

  const trimmed = pathOrUrl.trim();
  if (!trimmed) return undefined;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const base = assetsBaseUrl();
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return base ? `${base}${path}` : path;
}

export function resolveAssetUrlRequired(pathOrUrl: string): string {
  return resolveAssetUrl(pathOrUrl) ?? pathOrUrl;
}
