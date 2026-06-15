import type { Language } from '@/i18n';

const LOCALE_TAGS: Record<Language, string> = {
  en: 'en-US',
  de: 'de-DE',
  es: 'es-ES',
  sq: 'sq-AL',
  fr: 'fr-FR',
  ru: 'ru-RU',
  zh: 'zh-CN',
  ja: 'ja-JP',
  pt: 'pt-PT',
  'pt-br': 'pt-BR',
  mk: 'mk-MK',
  el: 'el-GR',
  it: 'it-IT',
  tr: 'tr-TR',
  ko: 'ko-KR',
  sr: 'sr-RS',
  hr: 'hr-HR',
  sl: 'sl-SI',
  fil: 'fil-PH',
  id: 'id-ID',
  hi: 'hi-IN',
  ur: 'ur-PK',
};

export function formatDateTime(
  value: string | null | undefined,
  language: Language,
): string {
  if (!value) return '—';
  return new Date(value).toLocaleString(LOCALE_TAGS[language] ?? language);
}
