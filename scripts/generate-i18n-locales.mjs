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

const GOOGLE_LOCALE_MAP = {
  'pt-br': 'pt',
  'zh-tw': 'zh-TW',
  fil: 'tl',
  'de-be': 'de',
  'fr-be': 'fr',
  'nl-be': 'nl',
  'ar-ma': 'ar',
  'ar-dz': 'ar',
  'ar-tn': 'ar',
};

const LINGVA_HOST = 'https://lingva.ml';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveTargetLang(langCode, targetLang) {
  return GOOGLE_LOCALE_MAP[langCode] ?? targetLang;
}

const NEW_1XBET_LOCALES = [
  'af',
  'am',
  'az',
  'be',
  'bg',
  'bn',
  'cy',
  'fa',
  'ga',
  'gu',
  'ha',
  'he',
  'hy',
  'ig',
  'is',
  'ka',
  'kk',
  'km',
  'kn',
  'lb',
  'lo',
  'lt',
  'ml',
  'mn',
  'mr',
  'ms',
  'mt',
  'my',
  'ne',
  'nl',
  'pa',
  'ro',
  'si',
  'so',
  'sv',
  'sw',
  'ta',
  'te',
  'tg',
  'th',
  'uk',
  'uz',
  'vi',
  'yo',
  'zh-tw',
  'zu',
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

async function translatePhrase(text, targetLang, attempt = 1) {
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text.slice(0, 500));
  url.searchParams.set('langpair', `en|${targetLang}`);

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (response.status === 429 && attempt <= 4) {
      await sleep(3000 * attempt);
      return translatePhrase(text, targetLang, attempt + 1);
    }
    if (!response.ok) return null;
    const data = await response.json();
    const translated = data?.responseData?.translatedText;
    if (!translated || translated === text) return null;
    if (String(data?.responseDetails ?? '').includes('MYMEMORY WARNING')) return null;
    return translated;
  } catch {
    if (attempt <= 3) {
      await sleep(1500 * attempt);
      return translatePhrase(text, targetLang, attempt + 1);
    }
    return null;
  }
}

async function translatePhraseLingva(text, targetLang, attempt = 1) {
  const url = `${LINGVA_HOST}/api/v1/en/${targetLang}/${encodeURIComponent(text)}`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
    if (response.status === 429 && attempt <= 6) {
      await sleep(8000 * attempt);
      return translatePhraseLingva(text, targetLang, attempt + 1);
    }
    if (!response.ok) {
      if (attempt <= 3) {
        await sleep(2000 * attempt);
        return translatePhraseLingva(text, targetLang, attempt + 1);
      }
      return null;
    }
    const data = await response.json();
    const translated = data?.translation?.trim();
    if (!translated || translated === text) return null;
    return translated;
  } catch {
    if (attempt <= 3) {
      await sleep(2000 * attempt);
      return translatePhraseLingva(text, targetLang, attempt + 1);
    }
    return null;
  }
}

async function translatePhraseGoogle(text, targetLang) {
  try {
    const { translate: googleTranslate } = await import('@vitalets/google-translate-api');
    const result = await googleTranslate(text, {
      from: 'en',
      to: targetLang,
      requestOptions: { timeout: 12000 },
    });
    const translated = result?.text?.trim();
    if (!translated || translated === text) return null;
    return translated;
  } catch {
    return null;
  }
}

async function translateText(text, langCode, targetLang) {
  const resolvedTarget = resolveTargetLang(langCode, targetLang);
  const memory = await translatePhrase(text, resolvedTarget);
  if (memory && memory !== text) return memory;

  const lingva = await translatePhraseLingva(text, resolvedTarget);
  if (lingva && lingva !== text) return lingva;

  const google = await translatePhraseGoogle(text, resolvedTarget);
  return google ?? text;
}

function isLocaleStub(langCode) {
  const filePath = join(localesDir, `${langCode}.ts`);
  if (!existsSync(filePath)) return true;
  const content = readFileSync(filePath, 'utf8');
  return /LocaleTree\s*=\s*en\s*;/.test(content);
}

function localeNeedsTranslation(langCode) {
  if (isLocaleStub(langCode)) return true;

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
  let map = existsSync(mapPath) ? JSON.parse(readFileSync(mapPath, 'utf8')) : {};

  const pending = force
    ? phrases
    : phrases.filter((phrase) => !map[phrase] || map[phrase] === phrase);

  if (pending.length === 0) {
    return mergePhraseMaps(map, loadOverrides(langCode));
  }

  console.log(`  ${langCode}: translating ${pending.length}/${phrases.length} pending phrases`);
  const concurrency = 4;

  for (let i = 0; i < pending.length; i += concurrency) {
    const batch = pending.slice(i, i + concurrency);
    const translated = await Promise.all(
      batch.map(async (phrase) => translateText(phrase, langCode, targetLang)),
    );
    batch.forEach((phrase, index) => {
      map[phrase] = translated[index];
    });

    if (i > 0 && i % 40 === 0) {
      writeFileSync(mapPath, JSON.stringify(map, null, 2));
    }

    if (i + concurrency < pending.length) {
      await sleep(500);
    }

    if ((i / concurrency) % 5 === 0 && i > 0) {
      console.log(`  ${langCode}: ${Math.min(i + concurrency, pending.length)}/${pending.length}`);
    }
  }

  writeFileSync(mapPath, JSON.stringify(map, null, 2));
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
  const needsLocale = localeNeedsTranslation(langCode);
  const mapPath = join(phraseMapsDir, `${langCode}.json`);

  if (!needsLocale && !force) {
    console.log(`skip ${langCode} (already translated)`);
    return;
  }

  if (!needsLocale && force && existsSync(mapPath)) {
    console.log(`skip ${langCode} (already complete)`);
    return;
  }

  console.log(`locale ${langCode}: translating ${phrases.length} phrases -> ${targetLang}`);
  const map = await buildPhraseMap(langCode, targetLang, phrases, force || needsLocale);
  const translatedCount = Object.entries(map).filter(([a, b]) => a !== b).length;

  if (translatedCount === 0) {
    console.log(`locale ${langCode}: skipped write (no translations)`);
    return;
  }

  const localized = applyPhraseMap(en, map);
  writeLocaleFile(langCode, localized);
  console.log(`locale ${langCode}: written (${translatedCount} translated phrases)`);
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
  await sleep(2000);
}

console.log('done');
