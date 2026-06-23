import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';
import { applyPhraseMapToValues, mergePhraseMaps } from '../src/i18n/phraseMapUtils.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src/i18n/locales');
const phraseMapsDir = join(root, 'src/i18n/phraseMaps');
const overridesDir = join(root, 'src/i18n/overrides');

const LANG_TARGETS = {
  af: 'af',
  am: 'am',
  ar: 'ar',
  'ar-ma': 'ar',
  'ar-dz': 'ar',
  'ar-tn': 'ar',
  az: 'az',
  be: 'be',
  bg: 'bg',
  bn: 'bn',
  cs: 'cs',
  cy: 'cy',
  da: 'da',
  de: 'de',
  'de-be': 'de',
  el: 'el',
  es: 'es',
  et: 'et',
  fa: 'fa',
  fi: 'fi',
  fil: 'tl',
  fr: 'fr',
  'fr-be': 'fr',
  ga: 'ga',
  gu: 'gu',
  ha: 'ha',
  he: 'he',
  hi: 'hi',
  hr: 'hr',
  hu: 'hu',
  hy: 'hy',
  id: 'id',
  ig: 'ig',
  is: 'is',
  it: 'it',
  ja: 'ja',
  ka: 'ka',
  kk: 'kk',
  km: 'km',
  kn: 'kn',
  ko: 'ko',
  lb: 'lb',
  lo: 'lo',
  lt: 'lt',
  lv: 'lv',
  mk: 'mk',
  ml: 'ml',
  mn: 'mn',
  mr: 'mr',
  ms: 'ms',
  mt: 'mt',
  my: 'my',
  ne: 'ne',
  nl: 'nl',
  'nl-be': 'nl',
  no: 'no',
  pa: 'pa',
  pl: 'pl',
  pt: 'pt',
  'pt-br': 'pt',
  ro: 'ro',
  ru: 'ru',
  si: 'si',
  sk: 'sk',
  sl: 'sl',
  so: 'so',
  sq: 'sq',
  sr: 'sr',
  sv: 'sv',
  sw: 'sw',
  ta: 'ta',
  te: 'te',
  tg: 'tg',
  th: 'th',
  tr: 'tr',
  uk: 'uk',
  ur: 'ur',
  uz: 'uz',
  vi: 'vi',
  yo: 'yo',
  zh: 'zh-CN',
  'zh-tw': 'zh-TW',
  zu: 'zu',
};

const EXPORT_NAMES = {
  'ar-ma': 'arMa',
  'ar-dz': 'arDz',
  'ar-tn': 'arTn',
  'de-be': 'deBe',
  'fr-be': 'frBe',
  'nl-be': 'nlBe',
  'pt-br': 'ptBr',
  'zh-tw': 'zhTw',
};

const PRESERVE_LOCALE_AFFILIATE = new Set([
  'ko',
  'de',
  'es',
  'it',
  'pt',
  'pt-br',
  'ar',
  'sq',
  'tr',
]);

function collectAffiliatePhrases() {
  return [...new Set(Object.values(en.affiliate))];
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function loadMergedMap(langCode) {
  const mapPath = join(phraseMapsDir, `${langCode}.json`);
  const overridePath = join(overridesDir, `${langCode}.json`);
  const map = existsSync(mapPath) ? loadJson(mapPath) : {};
  const overrides = existsSync(overridePath) ? loadJson(overridePath) : {};
  return { map, merged: mergePhraseMaps(map, overrides), mapPath };
}

async function translatePhraseGoogle(text, targetLang) {
  try {
    const { translate: googleTranslate } = await import('@vitalets/google-translate-api');
    const result = await googleTranslate(text, { from: 'en', to: targetLang, requestOptions: { timeout: 8000 } });
    const translated = result?.text?.trim();
    if (!translated || translated === text) return null;
    return translated;
  } catch {
    return null;
  }
}

async function translatePhrase(text, targetLang, attempt = 1) {
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text.slice(0, 500));
  url.searchParams.set('langpair', `en|${targetLang}`);

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const details = String(data?.responseDetails ?? '');
    if (details.includes('MYMEMORY WARNING')) {
      if (attempt < 4) {
        await new Promise((r) => setTimeout(r, 1500 * attempt));
        return translatePhrase(text, targetLang, attempt + 1);
      }
      return null;
    }
    const translated = data?.responseData?.translatedText?.trim();
    if (!translated || translated === text) return null;
    return translated;
  } catch {
    if (attempt < 4) {
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      return translatePhrase(text, targetLang, attempt + 1);
    }
    return null;
  }
}

function writeLocaleFile(langCode, tree) {
  const exportName = EXPORT_NAMES[langCode] ?? langCode.replace(/-/g, '');
  const filePath = join(localesDir, `${langCode}.ts`);
  const body = JSON.stringify(tree, null, 2);
  const content = `import type { LocaleTree } from './en';

export const ${exportName}: LocaleTree = ${body};
`;
  writeFileSync(filePath, content);
}

async function loadLocale(langCode) {
  const exportName = EXPORT_NAMES[langCode] ?? langCode.replace(/-/g, '');
  const mod = await import(pathToFileURL(join(localesDir, `${langCode}.ts`)).href);
  return mod[exportName];
}

function buildAffiliateSection(existingAffiliate, phraseMap) {
  const localized = applyPhraseMapToValues(en.affiliate, phraseMap);
  const result = {};

  for (const key of Object.keys(en.affiliate)) {
    const english = en.affiliate[key];
    const existing = existingAffiliate?.[key];
    if (existing && existing !== english) {
      result[key] = existing;
      continue;
    }
    result[key] = localized[key] ?? english;
  }

  return result;
}

function listLocaleCodes() {
  return readdirSync(localesDir)
    .filter((name) => name.endsWith('.ts') && name !== 'en.ts')
    .map((name) => name.replace(/\.ts$/, ''));
}

async function syncLanguage(langCode, phrases) {
  if (langCode === 'en') return;

  const targetLang = LANG_TARGETS[langCode] ?? langCode;
  const { map, merged, mapPath } = loadMergedMap(langCode);
  const locale = await loadLocale(langCode);
  let mapUpdated = false;

  for (const phrase of phrases) {
    if (merged[phrase] && merged[phrase] !== phrase) continue;

    const preservedValue = Object.entries(locale.affiliate ?? {}).find(
      ([, value]) => value === phrase,
    )?.[1];
    if (preservedValue && preservedValue !== phrase) continue;

    const translated = await translatePhrase(phrase, targetLang);
    if (!translated || translated === phrase) {
      const google = await translatePhraseGoogle(phrase, targetLang);
      if (google && google !== phrase) {
        map[phrase] = google;
        merged[phrase] = google;
        mapUpdated = true;
      }
      continue;
    }

    map[phrase] = translated;
    merged[phrase] = translated;
    mapUpdated = true;
    await new Promise((r) => setTimeout(r, 80));
  }

  if (mapUpdated && existsSync(mapPath)) {
    writeFileSync(mapPath, JSON.stringify(map, null, 2));
  }

  if (PRESERVE_LOCALE_AFFILIATE.has(langCode)) {
    console.log(`${langCode}: preserved manual affiliate translations`);
    return;
  }

  if (existsSync(mapPath)) {
    const tree = applyPhraseMapToValues(en, merged);
    const affiliate = buildAffiliateSection(locale.affiliate, merged);
    writeLocaleFile(langCode, { ...tree, affiliate });
    console.log(`${langCode}: rebuilt locale from phrase map`);
    return;
  }

  const affiliate = buildAffiliateSection(locale.affiliate, merged);
  writeLocaleFile(langCode, { ...locale, affiliate });
  console.log(`${langCode}: updated affiliate section`);
}

const args = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const onlyArg = args.find((arg) => !arg.startsWith('--'));
const langs = onlyArg
  ? onlyArg.split(',').map((s) => s.trim())
  : listLocaleCodes();

mkdirSync(phraseMapsDir, { recursive: true });

const phrases = collectAffiliatePhrases();
console.log(`Syncing ${phrases.length} affiliate phrases across ${langs.length} languages`);

for (const langCode of langs) {
  await syncLanguage(langCode, phrases);
}

console.log('done');
