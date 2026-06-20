import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';
import { applyPhraseMapToValues, mergePhraseMaps } from '../src/i18n/phraseMapUtils.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src/i18n/locales');
const phraseMapsDir = join(root, 'src/i18n/phraseMaps');
const overridesDir = join(root, 'src/i18n/overrides');
const phrasesPath = join(root, 'scripts/i18n-phrases.json');

const LANG_TARGETS = {
  ar: 'ar',
  az: 'az',
  be: 'be',
  bg: 'bg',
  bn: 'bn',
  cs: 'cs',
  da: 'da',
  de: 'de',
  el: 'el',
  es: 'es',
  et: 'et',
  fa: 'fa',
  fi: 'fi',
  fil: 'tl',
  fr: 'fr',
  he: 'he',
  hi: 'hi',
  hr: 'hr',
  hu: 'hu',
  hy: 'hy',
  id: 'id',
  it: 'it',
  ja: 'ja',
  ka: 'ka',
  kk: 'kk',
  km: 'km',
  ko: 'ko',
  lt: 'lt',
  lv: 'lv',
  mk: 'mk',
  mn: 'mn',
  ms: 'ms',
  nl: 'nl',
  no: 'no',
  pl: 'pl',
  pt: 'pt',
  'pt-br': 'pt',
  ro: 'ro',
  ru: 'ru',
  sk: 'sk',
  sl: 'sl',
  sq: 'sq',
  sr: 'sr',
  sv: 'sv',
  sw: 'sw',
  tg: 'tg',
  th: 'th',
  tr: 'tr',
  uk: 'uk',
  ur: 'ur',
  uz: 'uz',
  vi: 'vi',
  zh: 'zh-CN',
  'zh-tw': 'zh-TW',
};

const EXPORT_NAMES = {
  'pt-br': 'ptBr',
  'zh-tw': 'zhTw',
};

const NEW_1XBET_LOCALES = [
  'az',
  'be',
  'bg',
  'bn',
  'fa',
  'he',
  'hy',
  'ka',
  'kk',
  'km',
  'lt',
  'mn',
  'ms',
  'nl',
  'ro',
  'sv',
  'sw',
  'tg',
  'th',
  'uk',
  'uz',
  'vi',
  'zh-tw',
];

function collectStrings(node, set) {
  if (typeof node === 'string') {
    if (node.length > 0) set.add(node);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item) => collectStrings(item, set));
    return;
  }
  if (node && typeof node === 'object') {
    Object.values(node).forEach((value) => collectStrings(value, set));
  }
}

function extractPhrases() {
  const set = new Set();
  collectStrings(en, set);
  const phrases = [...set].sort((a, b) => b.length - a.length);
  writeFileSync(phrasesPath, JSON.stringify(phrases, null, 2));
  console.log(`extracted ${phrases.length} i18n phrases`);
  return phrases;
}

function loadOverrides(langCode) {
  const overridePath = join(overridesDir, `${langCode}.json`);
  if (!existsSync(overridePath)) return {};
  return JSON.parse(readFileSync(overridePath, 'utf8'));
}

function applyPhraseMap(tree, phraseMap) {
  return applyPhraseMapToValues(tree, phraseMap);
}

async function translatePhrase(text, targetLang) {
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text.slice(0, 500));
  url.searchParams.set('langpair', `en|${targetLang}`);

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) return null;
    const data = await response.json();
    const translated = data?.responseData?.translatedText;
    if (!translated || translated === text) return null;
    if (String(data?.responseDetails ?? '').includes('MYMEMORY WARNING')) return null;
    return translated;
  } catch {
    return null;
  }
}

async function translatePhraseGoogle(text, targetLang) {
  try {
    const { translate: googleTranslate } = await import('@vitalets/google-translate-api');
    const result = await googleTranslate(text, { from: 'en', to: targetLang });
    const translated = result?.text?.trim();
    if (!translated || translated === text) return null;
    return translated;
  } catch {
    return null;
  }
}

async function translateText(text, targetLang) {
  const google = await translatePhraseGoogle(text, targetLang);
  if (google) return google;
  const memory = await translatePhrase(text, targetLang);
  return memory ?? text;
}

function localeNeedsTranslation(langCode) {
  const filePath = join(localesDir, `${langCode}.ts`);
  if (!existsSync(filePath)) return true;
  const content = readFileSync(filePath, 'utf8');
  return (
    content.includes('"loading": "Loading..."') ||
    content.includes("loading: 'Loading...'")
  );
}

async function buildPhraseMap(langCode, targetLang, phrases, force) {
  const mapPath = join(phraseMapsDir, `${langCode}.json`);
  let map;
  if (!force && existsSync(mapPath)) {
    map = JSON.parse(readFileSync(mapPath, 'utf8'));
  } else {
    map = {};
    const concurrency = 3;
    for (let i = 0; i < phrases.length; i += concurrency) {
      const batch = phrases.slice(i, i + concurrency);
      const translated = await Promise.all(
        batch.map(async (phrase) => translateText(phrase, targetLang)),
      );
      batch.forEach((phrase, index) => {
        map[phrase] = translated[index];
      });
      if (i + concurrency < phrases.length) {
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    writeFileSync(mapPath, JSON.stringify(map, null, 2));
  }

  return mergePhraseMaps(map, loadOverrides(langCode));
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

async function processLanguage(langCode, phrases, force) {
  const targetLang = LANG_TARGETS[langCode] ?? langCode;
  const needsLocale = force ? localeNeedsTranslation(langCode) : localeNeedsTranslation(langCode);

  if (!needsLocale && !force) {
    console.log(`skip ${langCode} (already translated)`);
    return;
  }

  if (!needsLocale && force) {
    console.log(`skip ${langCode} (locale already translated, phrase map only if missing)`);
    const mapPath = join(phraseMapsDir, `${langCode}.json`);
    if (existsSync(mapPath)) return;
  }

  console.log(`locale ${langCode}: translating ${phrases.length} phrases -> ${targetLang}`);
  const map = await buildPhraseMap(langCode, targetLang, phrases, force);
  if (needsLocale) {
    const localized = applyPhraseMap(en, map);
    writeLocaleFile(langCode, localized);
    console.log(`locale ${langCode}: written`);
  } else {
    console.log(`locale ${langCode}: phrase map saved`);
  }
}

const args = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const force = process.argv.includes('--force');
const onlyArg = args.find((arg) => !arg.startsWith('--'));
const langs = onlyArg
  ? onlyArg.split(',').map((s) => s.trim())
  : NEW_1XBET_LOCALES.filter((code) => localeNeedsTranslation(code));

mkdirSync(phraseMapsDir, { recursive: true });

const phrases = existsSync(phrasesPath)
  ? JSON.parse(readFileSync(phrasesPath, 'utf8'))
  : extractPhrases();

for (const langCode of langs) {
  await processLanguage(langCode, phrases, force);
}

console.log('done');
