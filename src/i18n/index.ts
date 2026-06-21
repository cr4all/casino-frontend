import { en, type LocaleTree, type TranslationTree } from './locales/en';
import { ar } from './locales/ar';
import { az } from './locales/az';
import { be } from './locales/be';
import { bg } from './locales/bg';
import { bn } from './locales/bn';
import { cs } from './locales/cs';
import { da } from './locales/da';
import { de } from './locales/de';
import { el } from './locales/el';
import { es } from './locales/es';
import { et } from './locales/et';
import { fa } from './locales/fa';
import { fi } from './locales/fi';
import { fil } from './locales/fil';
import { fr } from './locales/fr';
import { he } from './locales/he';
import { hi } from './locales/hi';
import { hr } from './locales/hr';
import { hu } from './locales/hu';
import { hy } from './locales/hy';
import { id } from './locales/id';
import { it } from './locales/it';
import { ja } from './locales/ja';
import { ka } from './locales/ka';
import { kk } from './locales/kk';
import { km } from './locales/km';
import { ko } from './locales/ko';
import { lt } from './locales/lt';
import { lv } from './locales/lv';
import { mk } from './locales/mk';
import { mn } from './locales/mn';
import { ms } from './locales/ms';
import { nl } from './locales/nl';
import { no } from './locales/no';
import { pl } from './locales/pl';
import { pt } from './locales/pt';
import { ptBr } from './locales/pt-br';
import { ro } from './locales/ro';
import { ru } from './locales/ru';
import { sk } from './locales/sk';
import { sl } from './locales/sl';
import { sq } from './locales/sq';
import { sr } from './locales/sr';
import { sv } from './locales/sv';
import { sw } from './locales/sw';
import { tg } from './locales/tg';
import { th } from './locales/th';
import { tr } from './locales/tr';
import { uk } from './locales/uk';
import { ur } from './locales/ur';
import { uz } from './locales/uz';
import { vi } from './locales/vi';
import { zh } from './locales/zh';
import { zhTw } from './locales/zh-tw';
import { applyPhraseMapToValues, mergePhraseMaps } from './phraseMapUtils';
import { PRIORITY_LANGUAGE_CODES } from './priorityLanguages';

const LANGUAGE_DEFINITIONS = [
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'ar', label: 'العربية', shortLabel: 'AR' },
  { code: 'az', label: 'Azərbaycan', shortLabel: 'AZ' },
  { code: 'be', label: 'Беларуская', shortLabel: 'BY' },
  { code: 'bg', label: 'Български', shortLabel: 'BG' },
  { code: 'bn', label: 'বাংলা', shortLabel: 'BN' },
  { code: 'cs', label: 'Čeština', shortLabel: 'CS' },
  { code: 'da', label: 'Dansk', shortLabel: 'DA' },
  { code: 'de', label: 'Deutsch', shortLabel: 'DE' },
  { code: 'el', label: 'Ελληνικά', shortLabel: 'EL' },
  { code: 'es', label: 'Español', shortLabel: 'ES' },
  { code: 'et', label: 'Eesti', shortLabel: 'ET' },
  { code: 'fa', label: 'فارسی', shortLabel: 'FA' },
  { code: 'fi', label: 'Suomi', shortLabel: 'FI' },
  { code: 'fil', label: 'Filipino', shortLabel: 'FIL' },
  { code: 'fr', label: 'Français', shortLabel: 'FR' },
  { code: 'he', label: 'עברית', shortLabel: 'HE' },
  { code: 'hi', label: 'हिन्दी', shortLabel: 'HI' },
  { code: 'hr', label: 'Hrvatski', shortLabel: 'HR' },
  { code: 'hu', label: 'Magyar', shortLabel: 'HU' },
  { code: 'hy', label: 'Հայերեն', shortLabel: 'HY' },
  { code: 'id', label: 'Bahasa Indonesia', shortLabel: 'ID' },
  { code: 'it', label: 'Italiano', shortLabel: 'IT' },
  { code: 'ja', label: '日本語', shortLabel: 'JA' },
  { code: 'ka', label: 'ქართული', shortLabel: 'KA' },
  { code: 'kk', label: 'Қазақша', shortLabel: 'KK' },
  { code: 'km', label: 'ភាសាខ្មែរ', shortLabel: 'KM' },
  { code: 'ko', label: '한국어', shortLabel: 'KO' },
  { code: 'lt', label: 'Lietuvių', shortLabel: 'LT' },
  { code: 'lv', label: 'Latviešu', shortLabel: 'LV' },
  { code: 'mk', label: 'Македонски', shortLabel: 'MK' },
  { code: 'mn', label: 'Монгол', shortLabel: 'MN' },
  { code: 'ms', label: 'Bahasa Melayu', shortLabel: 'MS' },
  { code: 'nl', label: 'Nederlands', shortLabel: 'NL' },
  { code: 'no', label: 'Norsk', shortLabel: 'NO' },
  { code: 'pl', label: 'Polski', shortLabel: 'PL' },
  { code: 'pt', label: 'Português (PT)', shortLabel: 'PT' },
  { code: 'pt-br', label: 'Português (Brasil)', shortLabel: 'BR' },
  { code: 'ro', label: 'Română', shortLabel: 'RO' },
  { code: 'ru', label: 'Русский', shortLabel: 'RU' },
  { code: 'sk', label: 'Slovenčina', shortLabel: 'SK' },
  { code: 'sl', label: 'Slovenščina', shortLabel: 'SL' },
  { code: 'sq', label: 'Shqip', shortLabel: 'SQ' },
  { code: 'sr', label: 'Српски', shortLabel: 'SR' },
  { code: 'sv', label: 'Svenska', shortLabel: 'SV' },
  { code: 'sw', label: 'Kiswahili', shortLabel: 'SW' },
  { code: 'tg', label: 'Тоҷикӣ', shortLabel: 'TG' },
  { code: 'th', label: 'ไทย', shortLabel: 'TH' },
  { code: 'tr', label: 'Türkçe', shortLabel: 'TR' },
  { code: 'uk', label: 'Українська', shortLabel: 'UK' },
  { code: 'ur', label: 'اردو', shortLabel: 'UR' },
  { code: 'uz', label: 'Oʻzbekcha', shortLabel: 'UZ' },
  { code: 'vi', label: 'Tiếng Việt', shortLabel: 'VI' },
  { code: 'zh', label: '中文 (简体)', shortLabel: 'ZH' },
  { code: 'zh-tw', label: '中文 (繁體)', shortLabel: 'TW' },
] as const;

export type Language = (typeof LANGUAGE_DEFINITIONS)[number]['code'];

function buildLanguageList(): { code: Language; label: string; shortLabel: string }[] {
  const byCode = new Map(LANGUAGE_DEFINITIONS.map((lang) => [lang.code, lang]));
  const prioritySet = new Set<string>(PRIORITY_LANGUAGE_CODES);

  const priority = PRIORITY_LANGUAGE_CODES.flatMap((code) => {
    const lang = byCode.get(code);
    return lang ? [lang] : [];
  });

  const rest = LANGUAGE_DEFINITIONS.filter((lang) => !prioritySet.has(lang.code));

  return [...priority, ...rest];
}

export const LANGUAGES = buildLanguageList();

export function getLanguageShortLabel(code: Language): string {
  return LANGUAGES.find((lang) => lang.code === code)?.shortLabel ?? code.toUpperCase();
}

const translations: Record<Language, LocaleTree> = {
  en,
  ar,
  az,
  be,
  bg,
  bn,
  cs,
  da,
  de,
  el,
  es,
  et,
  fa,
  fi,
  fil,
  fr,
  he,
  hi,
  hr,
  hu,
  hy,
  id,
  it,
  ja,
  ka,
  kk,
  km,
  ko,
  lt,
  lv,
  mk,
  mn,
  ms,
  nl,
  no,
  pl,
  pt,
  'pt-br': ptBr,
  ro,
  ru,
  sk,
  sl,
  sq,
  sr,
  sv,
  sw,
  tg,
  th,
  tr,
  uk,
  ur,
  uz,
  vi,
  zh,
  'zh-tw': zhTw,
};

const i18nPhraseMaps = import.meta.glob('./phraseMaps/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, Record<string, string>>;

const i18nOverrideMaps = import.meta.glob('./overrides/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, Record<string, string>>;

const LANGUAGE_CODES: Language[] = LANGUAGES.map((lang) => lang.code);

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

const phraseMapsByLanguage: Partial<Record<Language, Record<string, string>>> = {};

for (const [path, map] of Object.entries(i18nPhraseMaps)) {
  const code = path.match(/\/([^/]+)\.json$/)?.[1];
  if (!code || !isLanguage(code)) continue;

  const overridePath = `./overrides/${code}.json`;
  const mergedMap = mergePhraseMaps(map, i18nOverrideMaps[overridePath]);
  phraseMapsByLanguage[code] = mergedMap;

  const translatedCount = Object.entries(mergedMap).filter(
    ([english, localized]) => english !== localized,
  ).length;
  if (translatedCount === 0) continue;

  translations[code] = applyPhraseMapToValues(en, mergedMap);
}

for (const [path, overrides] of Object.entries(i18nOverrideMaps)) {
  const code = path.match(/\/([^/]+)\.json$/)?.[1];
  if (!code || !isLanguage(code) || phraseMapsByLanguage[code]) continue;

  phraseMapsByLanguage[code] = overrides;

  const translatedCount = Object.entries(overrides).filter(
    ([english, localized]) => english !== localized,
  ).length;
  if (translatedCount === 0) continue;

  translations[code] = applyPhraseMapToValues(en, overrides);
}

export function translate(
  language: Language,
  key: string,
  params?: Record<string, string | number>,
): string {
  const englishValue = getNestedValue(en, key);
  let value = getNestedValue(translations[language], key);

  if (!value) {
    value = englishValue;
  }

  if (
    language !== 'en' &&
    englishValue &&
    value === englishValue &&
    phraseMapsByLanguage[language]?.[englishValue]
  ) {
    value = phraseMapsByLanguage[language]![englishValue];
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
