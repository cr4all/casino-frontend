import { pickVisitorCountry, resolveVisitorLanguage, type VisitorCountryPayload } from '@/i18n/visitorLanguage';
import { LANGUAGE_STORAGE_KEY, useLanguageStore } from '@/stores/languageStore';

const VISITOR_COUNTRY_URL = '/geo/country';
const COUNTRY_TIMEOUT_MS = 2000;

let started = false;
let explicitChoice = false;

export function noteExplicitLanguageChoice(): void {
  explicitChoice = true;
}

function hasStoredLanguage(): boolean {
  try {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) != null;
  } catch {
    return false;
  }
}

function readBrowserLocales(): string[] {
  if (typeof navigator === 'undefined') return [];
  const locales = navigator.languages?.length ? [...navigator.languages] : [];
  if (navigator.language) locales.push(navigator.language);
  return locales;
}

async function fetchVisitorCountry(): Promise<string | null> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), COUNTRY_TIMEOUT_MS);

  try {
    const response = await fetch(VISITOR_COUNTRY_URL, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as VisitorCountryPayload;
    return pickVisitorCountry(payload);
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

async function detectAndApplyVisitorLanguage(): Promise<void> {
  const locales = readBrowserLocales();
  const fromBrowser = resolveVisitorLanguage(null, locales);

  if (!explicitChoice && fromBrowser !== 'en') {
    useLanguageStore.getState().setLanguage(fromBrowser);
  }

  const country = await fetchVisitorCountry();
  if (explicitChoice) return;

  const resolved = resolveVisitorLanguage(country, locales);
  if (explicitChoice) return;
  if (country == null && resolved === 'en') return;

  useLanguageStore.getState().setLanguage(resolved);
}

/** Applies a language once, only when this browser has no saved language yet. */
export function startVisitorLanguageDetection(): void {
  if (started || typeof window === 'undefined') return;
  if (hasStoredLanguage()) return;
  started = true;
  void detectAndApplyVisitorLanguage();
}
