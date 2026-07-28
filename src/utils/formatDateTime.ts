import type { Language } from '@/i18n';

const LOCALE_TAGS: Record<Language, string> = {
  en: 'en-US',
  af: 'af-ZA',
  am: 'am-ET',
  ar: 'ar-SA',
  'ar-ma': 'ar-MA',
  'ar-dz': 'ar-DZ',
  'ar-tn': 'ar-TN',
  az: 'az-AZ',
  be: 'be-BY',
  bg: 'bg-BG',
  bn: 'bn-BD',
  cs: 'cs-CZ',
  cy: 'cy-GB',
  da: 'da-DK',
  de: 'de-DE',
  'de-be': 'de-BE',
  el: 'el-GR',
  es: 'es-ES',
  et: 'et-EE',
  fa: 'fa-IR',
  fi: 'fi-FI',
  fil: 'fil-PH',
  fr: 'fr-FR',
  'fr-be': 'fr-BE',
  ga: 'ga-IE',
  gu: 'gu-IN',
  ha: 'ha-NG',
  he: 'he-IL',
  hi: 'hi-IN',
  hr: 'hr-HR',
  hu: 'hu-HU',
  hy: 'hy-AM',
  id: 'id-ID',
  ig: 'ig-NG',
  is: 'is-IS',
  it: 'it-IT',
  ja: 'ja-JP',
  ka: 'ka-GE',
  kk: 'kk-KZ',
  km: 'km-KH',
  kn: 'kn-IN',
  ko: 'ko-KR',
  lb: 'lb-LU',
  lo: 'lo-LA',
  lt: 'lt-LT',
  lv: 'lv-LV',
  mk: 'mk-MK',
  ml: 'ml-IN',
  mn: 'mn-MN',
  mr: 'mr-IN',
  ms: 'ms-MY',
  mt: 'mt-MT',
  my: 'my-MM',
  ne: 'ne-NP',
  nl: 'nl-NL',
  'nl-be': 'nl-BE',
  no: 'nb-NO',
  pa: 'pa-IN',
  pl: 'pl-PL',
  pt: 'pt-PT',
  'pt-br': 'pt-BR',
  ro: 'ro-RO',
  si: 'si-LK',
  sk: 'sk-SK',
  sl: 'sl-SI',
  so: 'so-SO',
  sq: 'sq-AL',
  sr: 'sr-RS',
  sv: 'sv-SE',
  sw: 'sw-KE',
  ta: 'ta-IN',
  te: 'te-IN',
  tg: 'tg-TJ',
  th: 'th-TH',
  tr: 'tr-TR',
  ur: 'ur-PK',
  uz: 'uz-UZ',
  vi: 'vi-VN',
  yo: 'yo-NG',
  zh: 'zh-CN',
  'zh-tw': 'zh-TW',
  zu: 'zu-ZA',
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
