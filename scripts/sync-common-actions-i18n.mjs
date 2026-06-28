import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';
import { applyPhraseMapToValues, mergePhraseMaps } from '../src/i18n/phraseMapUtils.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src/i18n/locales');
const phraseMapsDir = join(root, 'src/i18n/phraseMaps');
const overridesDir = join(root, 'src/i18n/overrides');

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

function loadMergedMap(langCode) {
  const mapPath = join(phraseMapsDir, `${langCode}.json`);
  const overridePath = join(overridesDir, `${langCode}.json`);
  const map = existsSync(mapPath) ? JSON.parse(readFileSync(mapPath, 'utf8')) : {};
  const overrides = existsSync(overridePath) ? JSON.parse(readFileSync(overridePath, 'utf8')) : {};
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

const english = en.common.actions;
const codes = readdirSync(localesDir)
  .filter((name) => name.endsWith('.ts') && name !== 'en.ts')
  .map((name) => name.replace(/\.ts$/, ''));

for (const langCode of codes) {
  const locale = await loadLocale(langCode);
  if (locale.common?.actions && locale.common.actions !== english) {
    continue;
  }

  const { map, merged, mapPath } = loadMergedMap(langCode);
  let translated = merged[english];
  if (!translated || translated === english) {
    translated = await translatePhrase(english, LANG_TARGETS[langCode] ?? langCode);
  }

  if (!translated || translated === english) {
    console.log(`${langCode}: skipped (no translation)`);
    continue;
  }

  if (existsSync(mapPath)) {
    map[english] = translated;
    writeFileSync(mapPath, JSON.stringify(map, null, 2));
    const tree = applyPhraseMapToValues(en, mergePhraseMaps(map, existsSync(join(overridesDir, `${langCode}.json`)) ? JSON.parse(readFileSync(join(overridesDir, `${langCode}.json`), 'utf8')) : {}));
    writeLocaleFile(langCode, { ...tree, affiliate: locale.affiliate });
  } else {
    writeLocaleFile(langCode, {
      ...locale,
      common: { ...locale.common, actions: translated },
    });
  }

  console.log(`${langCode}: ${translated}`);
  await new Promise((r) => setTimeout(r, 100));
}

console.log('done');
