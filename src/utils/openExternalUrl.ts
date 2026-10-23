import { Browser } from '@capacitor/browser';
import { isNativeApp } from '@/utils/capacitor';

/**
 * Opens an http(s) URL outside the app WebView on native platforms,
 * and in a new tab on the website.
 */
export async function openExternalUrl(url: string): Promise<void> {
  if (!url) return;

  if (isNativeApp()) {
    await Browser.open({ url });
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}

/** Click handler for external anchor tags that must not navigate the WebView. */
export function handleExternalLinkClick(
  event: { preventDefault: () => void; currentTarget: HTMLAnchorElement },
): void {
  const href = event.currentTarget.href;
  if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return;
  }

  if (!isNativeApp()) return;

  event.preventDefault();
  void openExternalUrl(href);
}
