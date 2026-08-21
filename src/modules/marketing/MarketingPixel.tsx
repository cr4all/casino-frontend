import { useEffect } from 'react';
import {
  canLoadMarketing,
  useCookieConsentStore,
} from '@/stores/cookieConsentStore';

/**
 * Third-party marketing / affiliate conversion pixel (prdredir).
 *
 * The affiliate partner ships this as a plain <script> snippet and asks for it
 * to live in Google Tag Manager. This project has no GTM container, so instead
 * of embedding the tag unconditionally in index.html we inject it at runtime and
 * gate it behind the site's cookie-consent "marketing" category. That keeps the
 * behaviour GDPR-compliant: the pixel only ever loads after the visitor opts in.
 *
 * The script id/src default to the values the partner provided, but can be
 * overridden (or the src emptied to disable the pixel) via Vite env vars so ops
 * can swap the tag without a code change.
 */
const DEFAULT_PIXEL_ID = 'pix_ibets24';
const DEFAULT_PIXEL_SRC = 'https://scripts.prdredir.com/scripts/pix_ibets24.js';

const pixelId = (import.meta.env.VITE_MARKETING_PIXEL_ID ?? DEFAULT_PIXEL_ID).trim() || DEFAULT_PIXEL_ID;
const pixelSrc = (import.meta.env.VITE_MARKETING_PIXEL_SRC ?? DEFAULT_PIXEL_SRC).trim();

function isConfigured(): boolean {
  return Boolean(pixelSrc);
}

function loadPixel(): void {
  if (!isConfigured()) return;
  if (document.getElementById(pixelId)) return;

  const script = document.createElement('script');
  script.id = pixelId;
  script.src = pixelSrc;
  script.async = true;
  document.head.appendChild(script);
}

function removePixel(): void {
  document.getElementById(pixelId)?.remove();
}

export function MarketingPixel() {
  const level = useCookieConsentStore((s) => s.level);
  const preferences = useCookieConsentStore((s) => s.preferences);
  const hasHydrated = useCookieConsentStore((s) => s.hasHydrated);
  const marketingAllowed = canLoadMarketing(level, preferences);

  useEffect(() => {
    if (!hasHydrated || !isConfigured()) return;

    if (marketingAllowed) {
      loadPixel();
    } else {
      // Consent was withdrawn (or never given). Best-effort remove the tag; a
      // full teardown of an already-executed third-party script only happens on
      // the next page load, which is standard for consent-gated pixels.
      removePixel();
    }
  }, [hasHydrated, marketingAllowed]);

  return null;
}
