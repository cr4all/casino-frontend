import type { Language } from '@/i18n';

const LOCALE_TAGS: Record<Language, string> = {
  en: 'en-US',
  ar: 'ar-SA',
  cs: 'cs-CZ',
  da: 'da-DK',
  de: 'de-DE',
  el: 'el-GR',
  es: 'es-ES',
  et: 'et-EE',
  fi: 'fi-FI',
  fil: 'fil-PH',
  fr: 'fr-FR',
  hi: 'hi-IN',
  hr: 'hr-HR',
  hu: 'hu-HU',
  id: 'id-ID',
  it: 'it-IT',
  ja: 'ja-JP',
  ko: 'ko-KR',
  lv: 'lv-LV',
  mk: 'mk-MK',
  no: 'nb-NO',
  pl: 'pl-PL',
  pt: 'pt-PT',
  'pt-br': 'pt-BR',
  ru: 'ru-RU',
  sk: 'sk-SK',
  sl: 'sl-SI',
  sq: 'sq-AL',
  sr: 'sr-RS',
  tr: 'tr-TR',
  ur: 'ur-PK',
  zh: 'zh-CN',
};

export function formatDateTime(
  value: string | null | undefined,
  language: Language,
): string {
  if (!value) return '—';
  return new Date(value).toLocaleString(LOCALE_TAGS[language] ?? language);
}
