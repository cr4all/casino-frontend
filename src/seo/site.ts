export const SITE_ORIGIN = 'https://ibets24.com';

export function absoluteUrl(pathname: string): string {
  if (pathname === '/' || pathname === '') {
    return `${SITE_ORIGIN}/`;
  }
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${SITE_ORIGIN}${path}`;
}
