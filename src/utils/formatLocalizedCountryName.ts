import type { Language } from '@/i18n';

const DISPLAY_LOCALE: Partial<Record<Language, string>> = {
  'zh-tw': 'zh-TW',
  'pt-br': 'pt-BR',
  fil: 'fil',
};

export function formatLocalizedCountryName(
  countryCode: string,
  language: Language,
  fallbackName?: string | null,
): string {
  const locale = DISPLAY_LOCALE[language] ?? language;

  try {
    const displayNames = new Intl.DisplayNames([locale], { type: 'region' });
    const localized = displayNames.of(countryCode.toUpperCase());
    if (localized) return localized;
  } catch {
    // Intl may be unavailable for some locale codes.
  }

  return fallbackName ?? countryCode.toUpperCase();
}
