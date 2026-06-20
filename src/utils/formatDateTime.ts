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

export function getChatDateKey(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function formatChatDateLabel(
  value: string | null | undefined,
  language: Language,
): string {
  if (!value) return '';
  const date = new Date(value);
  const locale = LOCALE_TAGS[language] ?? language;
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const messageDay = startOfDay(date);
  const today = startOfDay(now);
  const diffDays = Math.round((today.getTime() - messageDay.getTime()) / 86400000);

  if (diffDays === 0) {
    try {
      return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(0, 'day');
    } catch {
      return 'Today';
    }
  }

  if (diffDays === 1) {
    try {
      return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-1, 'day');
    } catch {
      return 'Yesterday';
    }
  }

  const options: Intl.DateTimeFormatOptions =
    date.getFullYear() !== now.getFullYear()
      ? { month: 'long', day: 'numeric', year: 'numeric' }
      : { month: 'long', day: 'numeric' };

  return date.toLocaleDateString(locale, options);
}
