import { isLanguage, type Language } from '@/i18n';

type CountryLanguage = {
  /** Used when the browser does not name one of this country's languages. */
  primary: Language;
  languages: readonly Language[];
};

const UNKNOWN_COUNTRY_CODES = new Set(['XX', 'T1']);

const LOCALE_BASE_ALIASES: Record<string, Language> = {
  fil: 'fil',
  tl: 'fil',
  nb: 'no',
  nn: 'no',
  no: 'no',
  in: 'id',
  iw: 'he',
};

export type VisitorCountryPayload = {
  cf?: unknown;
  cloudfront?: unknown;
  countryCode?: unknown;
  vercel?: unknown;
};

function only(language: Language): CountryLanguage {
  return { primary: language, languages: [language] };
}

function spoken(primary: Language, languages: readonly Language[]): CountryLanguage {
  return { primary, languages };
}

function assign(
  target: Record<string, CountryLanguage>,
  countries: readonly string[],
  value: CountryLanguage,
) {
  for (const code of countries) {
    target[code] = value;
  }
}

function buildCountryLanguages(): Record<string, CountryLanguage> {
  const countries: Record<string, CountryLanguage> = {};

  assign(countries, ['KR', 'KP'], only('ko'));
  assign(countries, ['JP'], only('ja'));
  assign(countries, ['CN'], only('zh'));
  assign(countries, ['TW'], only('zh-tw'));
  assign(countries, ['HK'], spoken('zh-tw', ['zh-tw', 'en', 'zh']));
  assign(countries, ['MO'], spoken('zh-tw', ['zh-tw', 'pt']));
  assign(countries, ['MN'], only('mn'));

  assign(countries, ['TH'], only('th'));
  assign(countries, ['VN'], only('vi'));
  assign(countries, ['ID'], only('id'));
  assign(countries, ['MY', 'BN'], spoken('ms', ['ms', 'en', 'zh', 'ta']));
  assign(countries, ['SG'], spoken('en', ['en', 'zh', 'ms', 'ta']));
  assign(countries, ['PH'], spoken('fil', ['fil', 'en']));
  assign(countries, ['KH'], only('km'));
  assign(countries, ['LA'], only('lo'));
  assign(countries, ['MM'], only('my'));

  assign(
    countries,
    ['IN'],
    spoken('hi', ['hi', 'en', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur']),
  );
  assign(countries, ['PK'], spoken('ur', ['ur', 'en']));
  assign(countries, ['BD'], only('bn'));
  assign(countries, ['LK'], spoken('si', ['si', 'ta', 'en']));
  assign(countries, ['NP'], only('ne'));

  assign(countries, ['KZ'], only('kk'));
  assign(countries, ['UZ'], only('uz'));
  assign(countries, ['TJ'], only('tg'));
  assign(countries, ['AZ'], only('az'));
  assign(countries, ['GE'], only('ka'));
  assign(countries, ['AM'], only('hy'));

  assign(countries, ['TR'], only('tr'));
  assign(countries, ['IR'], only('fa'));
  assign(countries, ['IL'], spoken('he', ['he', 'ar', 'en']));
  assign(
    countries,
    ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB', 'IQ', 'SY', 'YE', 'PS', 'EG', 'LY', 'SD', 'MR', 'DJ'],
    only('ar'),
  );
  assign(countries, ['MA'], spoken('ar-ma', ['ar-ma', 'fr', 'ar']));
  assign(countries, ['DZ'], spoken('ar-dz', ['ar-dz', 'fr', 'ar']));
  assign(countries, ['TN'], spoken('ar-tn', ['ar-tn', 'fr', 'ar']));

  assign(countries, ['ZA'], spoken('en', ['en', 'af', 'zu']));
  assign(countries, ['NA'], spoken('en', ['en', 'af']));
  assign(countries, ['NG'], spoken('en', ['en', 'ha', 'ig', 'yo']));
  assign(countries, ['KE', 'TZ'], spoken('sw', ['sw', 'en']));
  assign(countries, ['ET'], only('am'));
  assign(countries, ['SO'], only('so'));
  assign(countries, ['GH', 'UG'], only('en'));
  assign(countries, ['SN', 'CI', 'CM', 'CD', 'MG', 'ML', 'NE', 'BF', 'TG', 'BJ', 'HT'], only('fr'));
  assign(countries, ['RW'], spoken('en', ['en', 'fr', 'sw']));

  assign(countries, ['DE', 'AT', 'LI'], only('de'));
  assign(countries, ['CH'], spoken('de', ['de', 'fr', 'it']));
  assign(countries, ['BE'], spoken('nl-be', ['nl-be', 'fr-be', 'de-be']));
  assign(countries, ['NL'], only('nl'));
  assign(countries, ['FR', 'MC'], only('fr'));
  assign(countries, ['LU'], spoken('fr', ['fr', 'de', 'lb']));
  assign(countries, ['IT'], only('it'));
  assign(
    countries,
    ['ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'PR', 'GQ', 'AD'],
    only('es'),
  );
  assign(countries, ['PT'], only('pt'));
  assign(countries, ['BR'], only('pt-br'));
  assign(countries, ['PL'], only('pl'));
  assign(countries, ['CZ'], only('cs'));
  assign(countries, ['SK'], only('sk'));
  assign(countries, ['HU'], only('hu'));
  assign(countries, ['RO', 'MD'], only('ro'));
  assign(countries, ['BG'], only('bg'));
  assign(countries, ['GR'], only('el'));
  assign(countries, ['CY'], spoken('el', ['el', 'tr']));
  assign(countries, ['SE'], only('sv'));
  assign(countries, ['NO'], only('no'));
  assign(countries, ['DK'], only('da'));
  assign(countries, ['FI'], spoken('fi', ['fi', 'sv']));
  assign(countries, ['IS'], only('is'));
  assign(countries, ['EE'], only('et'));
  assign(countries, ['LV'], only('lv'));
  assign(countries, ['LT'], only('lt'));
  assign(countries, ['IE'], spoken('en', ['en', 'ga']));
  assign(countries, ['GB'], spoken('en', ['en', 'cy']));
  assign(countries, ['MT'], only('mt'));
  assign(countries, ['AL', 'XK'], only('sq'));
  assign(countries, ['MK'], only('mk'));
  assign(countries, ['RS', 'ME'], only('sr'));
  assign(countries, ['BA'], spoken('hr', ['hr', 'sr']));
  assign(countries, ['HR'], only('hr'));
  assign(countries, ['SI'], only('sl'));
  assign(countries, ['BY'], only('be'));

  assign(countries, ['US'], spoken('en', ['en', 'es']));
  assign(countries, ['AU', 'NZ'], only('en'));
  assign(countries, ['CA'], spoken('en', ['en', 'fr']));

  return countries;
}

const COUNTRY_LANGUAGES = buildCountryLanguages();

function normalizeCountryCode(value: string | null | undefined): string | null {
  if (!value) return null;
  const code = value.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code) || UNKNOWN_COUNTRY_CODES.has(code)) return null;
  return code;
}

export function pickVisitorCountry(payload: VisitorCountryPayload | null | undefined): string | null {
  if (!payload) return null;

  for (const value of [payload.cf, payload.cloudfront, payload.countryCode, payload.vercel]) {
    if (typeof value !== 'string') continue;
    const code = normalizeCountryCode(value);
    if (code) return code;
  }

  return null;
}

function languageFromLocaleTag(tag: string): Language | null {
  const normalized = tag.trim().toLowerCase().replace(/_/g, '-');
  if (!normalized) return null;

  if (
    normalized.startsWith('zh-hant') ||
    normalized.startsWith('zh-tw') ||
    normalized.startsWith('zh-hk') ||
    normalized.startsWith('zh-mo')
  ) {
    return 'zh-tw';
  }
  if (normalized.startsWith('zh')) return 'zh';
  if (normalized.startsWith('pt-br')) return 'pt-br';
  if (normalized.startsWith('fr-be')) return 'fr-be';
  if (normalized.startsWith('nl-be')) return 'nl-be';
  if (normalized.startsWith('de-be')) return 'de-be';
  if (normalized.startsWith('ar-ma')) return 'ar-ma';
  if (normalized.startsWith('ar-dz')) return 'ar-dz';
  if (normalized.startsWith('ar-tn')) return 'ar-tn';
  if (isLanguage(normalized)) return normalized;

  const base = normalized.split('-')[0];
  if (!base) return null;
  return LOCALE_BASE_ALIASES[base] ?? (isLanguage(base) ? base : null);
}

function languageFamily(language: Language): string {
  if (language === 'pt' || language === 'pt-br') return 'pt';
  if (language === 'zh' || language === 'zh-tw') return 'zh';
  if (language === 'ar' || language.startsWith('ar-')) return 'ar';
  if (language === 'fr' || language === 'fr-be') return 'fr';
  if (language === 'nl' || language === 'nl-be') return 'nl';
  if (language === 'de' || language === 'de-be') return 'de';
  return language;
}

function preferCountryVariant(language: Language, country: CountryLanguage | undefined): Language {
  if (!country) return language;
  const family = languageFamily(language);
  return country.languages.find((code) => languageFamily(code) === family) ?? language;
}

/**
 * First visit language.
 * A non-English browser language wins, mapped onto the country's regional variant when they match.
 * An English browser uses the country language, unless English is spoken there.
 */
export function resolveVisitorLanguage(
  countryCode: string | null | undefined,
  browserLocales: readonly string[],
): Language {
  const country = COUNTRY_LANGUAGES[normalizeCountryCode(countryCode) ?? ''];
  const browserLanguages: Language[] = [];

  for (const tag of browserLocales) {
    const language = languageFromLocaleTag(tag);
    if (language && !browserLanguages.includes(language)) {
      browserLanguages.push(language);
    }
  }

  // navigator.languages is a preference order. English earlier in the list
  // means the player prefers English; later entries are fallbacks, not a choice.
  let prefersEnglish = false;
  for (const language of browserLanguages) {
    if (language === 'en') {
      prefersEnglish = true;
      break;
    }
    return preferCountryVariant(language, country);
  }

  if (country) {
    if (prefersEnglish && country.languages.includes('en')) return 'en';
    return country.primary;
  }

  return 'en';
}
