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

  const base = (import.meta.env.VITE_ASSETS_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return base ? `${base}${path}` : path;
}

export function resolveAssetUrlRequired(pathOrUrl: string): string {
  return resolveAssetUrl(pathOrUrl) ?? pathOrUrl;
}
