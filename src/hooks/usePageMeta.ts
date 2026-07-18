import { useEffect } from 'react';
import { getCanonicalHref, getPageMeta } from '@/seo/pageMeta';

function ensureMetaDescription(): HTMLMetaElement {
  let el = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', 'description');
    document.head.appendChild(el);
  }
  return el;
}

function ensureCanonicalLink(): HTMLLinkElement {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  return el;
}

/** Apply document title, meta description, and canonical for the current route. */
export function usePageMeta(pathname: string): void {
  useEffect(() => {
    const meta = getPageMeta(pathname);
    document.title = meta.title;
    ensureMetaDescription().setAttribute('content', meta.description);
    ensureCanonicalLink().setAttribute('href', getCanonicalHref(meta));
  }, [pathname]);
}
