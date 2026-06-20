import type { Language } from '@/i18n';

const LOCALE_TAGS: Record<Language, string> = {
  en: 'en-US',
  ar: 'ar-SA',
  az: 'az-AZ',
  be: 'be-BY',
  bg: 'bg-BG',
  bn: 'bn-BD',
  cs: 'cs-CZ',
  da: 'da-DK',
  de: 'de-DE',
  el: 'el-GR',
  es: 'es-ES',
  et: 'et-EE',
  fa: 'fa-IR',
  fi: 'fi-FI',
  fil: 'fil-PH',
  fr: 'fr-FR',
  he: 'he-IL',
  hi: 'hi-IN',
  hr: 'hr-HR',
  hu: 'hu-HU',
  hy: 'hy-AM',
  id: 'id-ID',
  it: 'it-IT',
  ja: 'ja-JP',
  ka: 'ka-GE',
  kk: 'kk-KZ',
  km: 'km-KH',
  ko: 'ko-KR',
  lt: 'lt-LT',
  lv: 'lv-LV',
  mk: 'mk-MK',
  mn: 'mn-MN',
  ms: 'ms-MY',
  nl: 'nl-NL',
  no: 'nb-NO',
  pl: 'pl-PL',
  pt: 'pt-PT',
  'pt-br': 'pt-BR',
  ro: 'ro-RO',
  ru: 'ru-RU',
  sk: 'sk-SK',
  sl: 'sl-SI',
  sq: 'sq-AL',
  sr: 'sr-RS',
  sv: 'sv-SE',
  sw: 'sw-KE',
  tg: 'tg-TJ',
  th: 'th-TH',
  tr: 'tr-TR',
  uk: 'uk-UA',
  ur: 'ur-PK',
  uz: 'uz-UZ',
  vi: 'vi-VN',
  zh: 'zh-CN',
  'zh-tw': 'zh-TW',
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
