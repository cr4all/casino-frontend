import { en, type TranslationTree } from './locales/en';
import { de } from './locales/de';
import { es } from './locales/es';
import { sq } from './locales/sq';
import { fr } from './locales/fr';
import { ru } from './locales/ru';
import { zh } from './locales/zh';
import { ja } from './locales/ja';
import { pt } from './locales/pt';
import { mk } from './locales/mk';
import { el } from './locales/el';
import { it } from './locales/it';
import { tr } from './locales/tr';
import { ko } from './locales/ko';
import { sr } from './locales/sr';
import { hr } from './locales/hr';
import { sl } from './locales/sl';
import { fil } from './locales/fil';
import { id } from './locales/id';
import { hi } from './locales/hi';
import { ur } from './locales/ur';

export type Language =
  | 'en'
  | 'de'
  | 'es'
  | 'sq'
  | 'fr'
  | 'ru'
  | 'zh'
  | 'ja'
  | 'pt'
  | 'mk'
  | 'el'
  | 'it'
  | 'tr'
  | 'ko'
  | 'sr'
  | 'hr'
  | 'sl'
  | 'fil'
  | 'id'
  | 'hi'
  | 'ur';

export const LANGUAGES: { code: Language; label: string; shortLabel: string }[] = [
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'de', label: 'Deutsch', shortLabel: 'DE' },
  { code: 'es', label: 'Español', shortLabel: 'ES' },
  { code: 'fr', label: 'Français', shortLabel: 'FR' },
  { code: 'ru', label: 'Русский', shortLabel: 'RU' },
  { code: 'zh', label: '中文', shortLabel: 'ZH' },
  { code: 'ja', label: '日本語', shortLabel: 'JA' },
  { code: 'sq', label: 'Shqip', shortLabel: 'SQ' },
  { code: 'pt', label: 'Português', shortLabel: 'PT' },
  { code: 'mk', label: 'Македонски', shortLabel: 'MK' },
  { code: 'el', label: 'Ελληνικά', shortLabel: 'EL' },
  { code: 'it', label: 'Italiano', shortLabel: 'IT' },
  { code: 'tr', label: 'Türkçe', shortLabel: 'TR' },
  { code: 'ko', label: '한국어', shortLabel: 'KO' },
  { code: 'sr', label: 'Српски', shortLabel: 'SR' },
  { code: 'hr', label: 'Hrvatski', shortLabel: 'HR' },
  { code: 'sl', label: 'Slovenščina', shortLabel: 'SL' },
  { code: 'fil', label: 'Filipino', shortLabel: 'FIL' },
  { code: 'id', label: 'Bahasa Indonesia', shortLabel: 'ID' },
  { code: 'hi', label: 'हिन्दी', shortLabel: 'HI' },
  { code: 'ur', label: 'اردو', shortLabel: 'UR' },
];

export function getLanguageShortLabel(code: Language): string {
  return LANGUAGES.find((lang) => lang.code === code)?.shortLabel ?? code.toUpperCase();
}

const translations: Record<Language, TranslationTree> = {
  en,
  de,
  es,
  sq,
  fr,
  ru,
  zh,
  ja,
  pt,
  mk,
  el,
  it,
  tr,
  ko,
  sr,
  hr,
  sl,
  fil,
  id,
  hi,
  ur,
};

const LANGUAGE_CODES: Language[] = [
  'en',
  'de',
  'es',
  'sq',
  'fr',
  'ru',
  'zh',
  'ja',
  'pt',
  'mk',
  'el',
  'it',
  'tr',
  'ko',
  'sr',
  'hr',
  'sl',
  'fil',
  'id',
  'hi',
  'ur',
];

export function isLanguage(value: string): value is Language {
  return LANGUAGE_CODES.includes(value as Language);
}

function getNestedValue(tree: TranslationTree, key: string): string | undefined {
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

export function translateGameType(
  language: Language,
  slug: string,
  fallbackName: string,
): string {
  const key = `gameTypes.${slug}`;
  const translated = translate(language, key);
  return translated === key ? fallbackName : translated;
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
