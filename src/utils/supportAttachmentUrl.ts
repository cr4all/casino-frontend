import { getApiBaseUrl } from '@/utils/apiBase';

export function resolveAttachmentRequestUrl(url: string): string {
  const apiBase = getApiBaseUrl();

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith('/api/v1/')) {
    const origin = new URL(apiBase).origin;
    return `${origin}${url}`;
  }

  const base = apiBase.replace(/\/$/, '');
  return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
}
