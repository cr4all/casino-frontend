const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

export function resolveAttachmentRequestUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith('/api/v1/')) {
    const origin = new URL(API_BASE).origin;
    return `${origin}${url}`;
  }

  const base = API_BASE.replace(/\/$/, '');
  return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
}
