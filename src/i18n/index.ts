import { en, type TranslationTree } from './locales/en';
import { de } from './locales/de';
import { es } from './locales/es';
import { sq } from './locales/sq';

export type Language = 'en' | 'de' | 'es' | 'sq';

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'sq', label: 'Shqip' },
];

const translations: Record<Language, TranslationTree> = { en, de, es, sq };

const LANGUAGE_CODES: Language[] = ['en', 'de', 'es', 'sq'];

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
