import { en, type LocaleTree, type TranslationTree } from './locales/en';
import { ar } from './locales/ar';
import { cs } from './locales/cs';
import { da } from './locales/da';
import { de } from './locales/de';
import { el } from './locales/el';
import { es } from './locales/es';
import { et } from './locales/et';
import { fi } from './locales/fi';
import { fil } from './locales/fil';
import { fr } from './locales/fr';
import { hi } from './locales/hi';
import { hr } from './locales/hr';
import { hu } from './locales/hu';
import { id } from './locales/id';
import { it } from './locales/it';
import { ja } from './locales/ja';
import { ko } from './locales/ko';
import { lv } from './locales/lv';
import { mk } from './locales/mk';
import { no } from './locales/no';
import { pl } from './locales/pl';
import { pt } from './locales/pt';
import { ptBr } from './locales/pt-br';
import { ru } from './locales/ru';
import { sk } from './locales/sk';
import { sl } from './locales/sl';
import { sq } from './locales/sq';
import { sr } from './locales/sr';
import { tr } from './locales/tr';
import { ur } from './locales/ur';
import { zh } from './locales/zh';

export type Language =
  | 'en'
  | 'ar'
  | 'cs'
  | 'da'
  | 'de'
  | 'el'
  | 'es'
  | 'et'
  | 'fi'
  | 'fil'
  | 'fr'
  | 'hi'
  | 'hr'
  | 'hu'
  | 'id'
  | 'it'
  | 'ja'
  | 'ko'
  | 'lv'
  | 'mk'
  | 'no'
  | 'pl'
  | 'pt'
  | 'pt-br'
  | 'ru'
  | 'sk'
  | 'sl'
  | 'sq'
  | 'sr'
  | 'tr'
  | 'ur'
  | 'zh';

export const LANGUAGES: { code: Language; label: string; shortLabel: string }[] = [
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'ar', label: 'العربية', shortLabel: 'AR' },
  { code: 'cs', label: 'Čeština', shortLabel: 'CS' },
  { code: 'da', label: 'Dansk', shortLabel: 'DA' },
  { code: 'de', label: 'Deutsch', shortLabel: 'DE' },
  { code: 'el', label: 'Ελληνικά', shortLabel: 'EL' },
  { code: 'es', label: 'Español', shortLabel: 'ES' },
  { code: 'et', label: 'Eesti', shortLabel: 'ET' },
  { code: 'fi', label: 'Suomi', shortLabel: 'FI' },
  { code: 'fil', label: 'Filipino', shortLabel: 'FIL' },
  { code: 'fr', label: 'Français', shortLabel: 'FR' },
  { code: 'hi', label: 'हिन्दी', shortLabel: 'HI' },
  { code: 'hr', label: 'Hrvatski', shortLabel: 'HR' },
  { code: 'hu', label: 'Magyar', shortLabel: 'HU' },
  { code: 'id', label: 'Bahasa Indonesia', shortLabel: 'ID' },
  { code: 'it', label: 'Italiano', shortLabel: 'IT' },
  { code: 'ja', label: '日本語', shortLabel: 'JA' },
  { code: 'ko', label: '한국어', shortLabel: 'KO' },
  { code: 'lv', label: 'Latviešu', shortLabel: 'LV' },
  { code: 'mk', label: 'Македонски', shortLabel: 'MK' },
  { code: 'no', label: 'Norsk', shortLabel: 'NO' },
  { code: 'pl', label: 'Polski', shortLabel: 'PL' },
  { code: 'pt', label: 'Português (PT)', shortLabel: 'PT' },
  { code: 'pt-br', label: 'Português (Brasil)', shortLabel: 'BR' },
  { code: 'ru', label: 'Русский', shortLabel: 'RU' },
  { code: 'sk', label: 'Slovenčina', shortLabel: 'SK' },
  { code: 'sl', label: 'Slovenščina', shortLabel: 'SL' },
  { code: 'sq', label: 'Shqip', shortLabel: 'SQ' },
  { code: 'sr', label: 'Српски', shortLabel: 'SR' },
  { code: 'tr', label: 'Türkçe', shortLabel: 'TR' },
  { code: 'ur', label: 'اردو', shortLabel: 'UR' },
  { code: 'zh', label: '中文', shortLabel: 'ZH' },
];

export function getLanguageShortLabel(code: Language): string {
  return LANGUAGES.find((lang) => lang.code === code)?.shortLabel ?? code.toUpperCase();
}

const translations: Record<Language, LocaleTree> = {
  en,
  ar,
  cs,
  da,
  de,
  el,
  es,
  et,
  fi,
  fil,
  fr,
  hi,
  hr,
  hu,
  id,
  it,
  ja,
  ko,
  lv,
  mk,
  no,
  pl,
  pt,
  'pt-br': ptBr,
  ru,
  sk,
  sl,
  sq,
  sr,
  tr,
  ur,
  zh,
};

const LANGUAGE_CODES: Language[] = [
  'en',
  'ar',
  'cs',
  'da',
  'de',
  'el',
  'es',
  'et',
  'fi',
  'fil',
  'fr',
  'hi',
  'hr',
  'hu',
  'id',
  'it',
  'ja',
  'ko',
  'lv',
  'mk',
  'no',
  'pl',
  'pt',
  'pt-br',
  'ru',
  'sk',
  'sl',
  'sq',
  'sr',
  'tr',
  'ur',
  'zh',
];

export function isLanguage(value: string): value is Language {
  return LANGUAGE_CODES.includes(value as Language);
}

function getNestedValue(tree: LocaleTree | TranslationTree, key: string): string | undefined {
  const parts = key.split('.');
  let current: unknown = tree;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

export function translate(
  language: Language,
  key: string,
  params?: Record<string, string | number>,
): string {
  let value = getNestedValue(translations[language], key);
  if (!value) {
    value = getNestedValue(translations.en, key);
  }
  if (!value) return key;

  if (!params) return value;

  return Object.entries(params).reduce(
    (text, [paramKey, paramValue]) => text.replace(`{{${paramKey}}}`, String(paramValue)),
    value,
  );
}

function normalizeLookupKey(value: string): string {
  return value.toLowerCase().trim().replace(/[\s-]+/g, '_');
}

function gameTypeTranslationKeys(slug: string): string[] {
  const normalized = normalizeLookupKey(slug);
  const keys = new Set<string>([normalized]);

  if (normalized.endsWith('s')) keys.add(normalized.slice(0, -1));
  else keys.add(`${normalized}s`);

  if (normalized.endsWith('_games')) keys.add(normalized.replace(/_games$/, ''));
  else keys.add(`${normalized}_games`);

  return [...keys];
}

export function translateGameType(
  language: Language,
  slug: string,
  fallbackName: string,
): string {
  for (const key of gameTypeTranslationKeys(slug)) {
    const translated = translate(language, `gameTypes.${key}`);
    if (translated !== `gameTypes.${key}`) return translated;
  }

  const fallbackKey = normalizeLookupKey(fallbackName);
  const translatedFallback = translate(language, `gameTypes.${fallbackKey}`);
  if (translatedFallback !== `gameTypes.${fallbackKey}`) return translatedFallback;

  return fallbackName;
}

export function translatePaymentMethod(language: Language, name: string | null | undefined): string {
  if (!name) return '—';

  const candidates = new Set<string>([
    normalizeLookupKey(name),
    normalizeLookupKey(name).replace(/_payment$/, ''),
  ]);

  for (const key of candidates) {
    const translated = translate(language, `paymentMethods.${key}`);
    if (translated !== `paymentMethods.${key}`) return translated;
  }

  return name;
}

export function translatePaymentType(language: Language, type: string | null | undefined): string {
  if (!type) return '';

  const key = normalizeLookupKey(type);
  const translated = translate(language, `paymentTypes.${key}`);
  return translated === `paymentTypes.${key}` ? type : translated;
}

export function translateTxType(language: Language, type: string): string {
  const key = normalizeLookupKey(type);
  const translated = translate(language, `txTypes.${key}`);
  return translated === `txTypes.${key}` ? type : translated;
}

export function translateBonusType(language: Language, type: string): string {
  const key = normalizeLookupKey(type);
  const translated = translate(language, `bonusTypes.${key}`);
  return translated === `bonusTypes.${key}` ? type.replace(/_/g, ' ') : translated;
}

export function translateCollectionSlug(language: Language, slug: string): string {
  const key = `collections.${slug}`;
  const translated = translate(language, key);
  return translated === key ? slug : translated;
}

export function translateStatus(language: Language, status: string): string {
  const normalized = status.toLowerCase().replace(/\s+/g, '_');
  const key = `status.${normalized}`;
  const translated = translate(language, key);
  return translated === key ? status.replace(/_/g, ' ') : translated;
}
