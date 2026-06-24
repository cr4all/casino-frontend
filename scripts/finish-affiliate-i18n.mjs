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
  af: 'af', am: 'am', ar: 'ar', 'ar-ma': 'ar', 'ar-dz': 'ar', 'ar-tn': 'ar', az: 'az', be: 'be',
  bg: 'bg', bn: 'bn', cs: 'cs', cy: 'cy', da: 'da', de: 'de', 'de-be': 'de', el: 'el', es: 'es',
  et: 'et', fa: 'fa', fi: 'fi', fil: 'tl', fr: 'fr', 'fr-be': 'fr', ga: 'ga', gu: 'gu', ha: 'ha',
  he: 'he', hi: 'hi', hr: 'hr', hu: 'hu', hy: 'hy', id: 'id', ig: 'ig', is: 'is', it: 'it', ja: 'ja',
  ka: 'ka', kk: 'kk', km: 'km', kn: 'kn', ko: 'ko', lb: 'lb', lo: 'lo', lt: 'lt', lv: 'lv', mk: 'mk',
  ml: 'ml', mn: 'mn', mr: 'mr', ms: 'ms', mt: 'mt', my: 'my', ne: 'ne', nl: 'nl', 'nl-be': 'nl',
  no: 'no', pa: 'pa', pl: 'pl', pt: 'pt', 'pt-br': 'pt', ro: 'ro', ru: 'ru', si: 'si', sk: 'sk',
  sl: 'sl', so: 'so', sq: 'sq', sr: 'sr', sv: 'sv', sw: 'sw', ta: 'ta', te: 'te', tg: 'tg', th: 'th',
  tr: 'tr', uk: 'uk', ur: 'ur', uz: 'uz', vi: 'vi', yo: 'yo', zh: 'zh-CN', 'zh-tw': 'zh-TW', zu: 'zu',
};

const EXPORT_NAMES = {
  'ar-ma': 'arMa', 'ar-dz': 'arDz', 'ar-tn': 'arTn', 'de-be': 'deBe', 'fr-be': 'frBe',
  'nl-be': 'nlBe', 'pt-br': 'ptBr', 'zh-tw': 'zhTw',
};

const LOCALE_VARIANT_PARENT = {
  'ar-dz': 'ar', 'ar-ma': 'ar', 'ar-tn': 'ar', 'de-be': 'de', 'fr-be': 'fr', 'nl-be': 'nl',
};

const SKIP_ENGLISH_VALUES = new Set(['CPA', 'override']);

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

async function translatePhrase(text, targetLang, attempt = 1) {
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text.slice(0, 500));
  url.searchParams.set('langpair', `en|${targetLang}`);

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const details = String(data?.responseDetails ?? '');
    if (details.includes('MYMEMORY WARNING')) {
      if (attempt < 5) {
        await new Promise((r) => setTimeout(r, 2000 * attempt));
        return translatePhrase(text, targetLang, attempt + 1);
      }
      return null;
    }
    const translated = data?.responseData?.translatedText?.trim();
    if (!translated || translated === text) return null;
    return translated;
  } catch {
    if (attempt < 5) {
      await new Promise((r) => setTimeout(r, 2000 * attempt));
      return translatePhrase(text, targetLang, attempt + 1);
    }
    return null;
  }
}

function writeLocaleFile(langCode, tree) {
  const exportName = EXPORT_NAMES[langCode] ?? langCode.replace(/-/g, '');
  writeFileSync(
    join(localesDir, `${langCode}.ts`),
    `import type { LocaleTree } from './en';\n\nexport const ${exportName}: LocaleTree = ${JSON.stringify(tree, null, 2)};\n`,
  );
}

async function loadLocale(langCode) {
  const exportName = EXPORT_NAMES[langCode] ?? langCode.replace(/-/g, '');
  const mod = await import(pathToFileURL(join(localesDir, `${langCode}.ts`)).href);
  return mod[exportName];
}

function buildResolvedAffiliate(langCode, locale, parentAffiliate, phraseMap) {
  const mapped = phraseMap ? applyPhraseMapToValues(en.affiliate, phraseMap) : {};
  const affiliate = {};
  for (const key of Object.keys(en.affiliate)) {
    const english = en.affiliate[key];
    const existing = locale?.affiliate?.[key];
    const parent = parentAffiliate?.[key];
    const mappedValue = mapped[key];
    if (existing && existing !== english) affiliate[key] = existing;
    else if (parent && parent !== english) affiliate[key] = parent;
    else if (mappedValue && mappedValue !== english) affiliate[key] = mappedValue;
    else affiliate[key] = existing ?? mappedValue ?? parent ?? english;
  }
  return affiliate;
}

function listMissingKeys(affiliate) {
  return Object.entries(en.affiliate).filter(([key, english]) => {
    if (SKIP_ENGLISH_VALUES.has(english)) return false;
    return affiliate[key] === english;
  });
}

async function finishLanguage(langCode, localeCache) {
  const targetLang = LANG_TARGETS[langCode] ?? langCode;
  const locale = localeCache.get(langCode);
  const parentCode = LOCALE_VARIANT_PARENT[langCode];
  const parentAffiliate = parentCode ? localeCache.get(parentCode)?.affiliate : undefined;
  const { map, merged, mapPath } = loadMergedMap(langCode);
  const affiliate = buildResolvedAffiliate(langCode, locale, parentAffiliate, merged);
  const missing = listMissingKeys(affiliate);

  if (missing.length === 0) {
    console.log(`${langCode}: complete`);
    return;
  }

  console.log(`${langCode}: translating ${missing.length} missing affiliate keys`);
  let mapUpdated = false;

  const toTranslate = [];
  for (const [key, english] of missing) {
    if (merged[english] && merged[english] !== english) {
      affiliate[key] = merged[english];
      continue;
    }
    toTranslate.push([key, english]);
  }

  for (let i = 0; i < toTranslate.length; i += 4) {
    const batch = toTranslate.slice(i, i + 4);
    const results = await Promise.all(
      batch.map(([, english]) => translatePhrase(english, targetLang)),
    );

    batch.forEach(([key, english], index) => {
      const translated = results[index];
      if (!translated || translated === english) {
        return;
      }
      affiliate[key] = translated;
      map[english] = translated;
      merged[english] = translated;
      mapUpdated = true;
    });

    if (i + 4 < toTranslate.length) {
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  if (mapUpdated && existsSync(mapPath)) {
    writeFileSync(mapPath, JSON.stringify(map, null, 2));
  }

  if (existsSync(mapPath)) {
    const tree = applyPhraseMapToValues(en, merged);
    writeLocaleFile(langCode, { ...tree, affiliate });
  } else {
    writeLocaleFile(langCode, { ...locale, affiliate });
  }

  console.log(`${langCode}: updated`);
}

const args = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const onlyArg = args[0];
const langs = onlyArg
  ? onlyArg.split(',').map((s) => s.trim())
  : readdirSync(localesDir)
      .filter((name) => name.endsWith('.ts') && name !== 'en.ts')
      .map((name) => name.replace(/\.ts$/, ''));

mkdirSync(phraseMapsDir, { recursive: true });

const localeCache = new Map();
for (const code of langs) {
  localeCache.set(code, await loadLocale(code));
}

for (const langCode of langs) {
  await finishLanguage(langCode, localeCache);
}

console.log('done');
