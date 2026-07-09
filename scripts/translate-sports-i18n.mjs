/**
 * Translate sportsbook-related i18n strings for all player platform locales.
 * Run: npx --yes tsx scripts/translate-sports-i18n.mjs
 * Optional: npx --yes tsx scripts/translate-sports-i18n.mjs de,fr,es
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';
import { applyPhraseMapToValues, mergePhraseMaps } from '../src/i18n/phraseMapUtils.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src/i18n/locales');
const phraseMapsDir = join(root, 'src/i18n/phraseMaps');
const overridesDir = join(root, 'src/i18n/overrides');

const SKIP_LOCALES = new Set(['en', 'ko']);

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

/** English source strings introduced for sportsbook integration */
const SPORTS_PHRASES = [
  'SPORTS',
  'Platform section',
  'PREMATCH',
  'Pre-match betting',
  'IN LIVE',
  'Live betting',
  'My sports bets',
  'Loading sportsbook...',
  'Unable to load sportsbook.',
  'Sign in to access sports betting.',
  'Bet Now',
  'Bet on',
  'Sports book',
  'Casino Bets',
  'Sports Bets',
  'No sports bets yet. Place a bet in the sportsbook to see your history here.',
  'Go to sportsbook',
  'Round ID',
  'Payment ID',
  'Stake',
  'Odds',
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveTargetLang(langCode, targetLang) {
  return GOOGLE_LOCALE_MAP[langCode] ?? targetLang;
}

function protectPlaceholders(text) {
  const tokens = [];
  const safe = text.replace(/\{\{[^}]+\}\}/g, (match) => {
    const token = `__PH${tokens.length}__`;
    tokens.push(match);
    return token;
  });
  return { safe, tokens };
}

function restorePlaceholders(text, tokens) {
  let out = text;
  tokens.forEach((token, index) => {
    out = out.replace(`__PH${index}__`, token);
  });
  return out;
}

async function translatePhraseMemory(text, targetLang, attempt = 1) {
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text.slice(0, 500));
  url.searchParams.set('langpair', `en|${targetLang}`);

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (response.status === 429 && attempt <= 4) {
      await sleep(3000 * attempt);
      return translatePhraseMemory(text, targetLang, attempt + 1);
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
      return translatePhraseMemory(text, targetLang, attempt + 1);
    }
    return null;
  }
}

async function translatePhraseLingva(text, targetLang, attempt = 1) {
  const url = `https://lingva.ml/api/v1/en/${targetLang}/${encodeURIComponent(text)}`;

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

async function translateText(text, langCode, targetLang) {
  const resolvedTarget = resolveTargetLang(langCode, targetLang);
  const { safe, tokens } = protectPlaceholders(text);

  const memory = await translatePhraseMemory(safe, resolvedTarget);
  if (memory && memory !== safe) {
    return restorePlaceholders(memory, tokens);
  }

  const lingva = await translatePhraseLingva(safe, resolvedTarget);
  if (lingva && lingva !== safe) {
    return restorePlaceholders(lingva, tokens);
  }

  return text;
}

function loadOverrides(langCode) {
  const overridePath = join(overridesDir, `${langCode}.json`);
  return existsSync(overridePath) ? JSON.parse(readFileSync(overridePath, 'utf8')) : {};
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

async function importLocaleTree(langCode) {
  const filePath = join(localesDir, `${langCode}.ts`);
  const mod = await import(pathToFileURL(filePath).href);
  const exportName = EXPORT_NAMES[langCode] ?? langCode.replace(/-/g, '');
  return mod[exportName];
}

async function buildSportsMap(langCode) {
  const targetLang = LANG_TARGETS[langCode] ?? langCode;
  const mapPath = join(phraseMapsDir, `${langCode}.json`);
  const existing = existsSync(mapPath) ? JSON.parse(readFileSync(mapPath, 'utf8')) : {};

  const pending = SPORTS_PHRASES.filter(
    (phrase) => !existing[phrase] || existing[phrase] === phrase,
  );

  if (pending.length === 0) {
    console.log(`  ${langCode}: sports phrases already mapped`);
    return mergePhraseMaps(existing, loadOverrides(langCode));
  }

  console.log(`  ${langCode}: translating ${pending.length} sports phrases -> ${targetLang}`);
  const sportsEntries = {};

  for (let i = 0; i < pending.length; i += 3) {
    const batch = pending.slice(i, i + 3);
    const translated = await Promise.all(
      batch.map((phrase) => translateText(phrase, langCode, targetLang)),
    );
    batch.forEach((phrase, index) => {
      sportsEntries[phrase] = translated[index];
      existing[phrase] = translated[index];
    });

    if (i + 3 < pending.length) {
      await sleep(400);
    }
  }

  if (existsSync(mapPath) || Object.keys(sportsEntries).length > 0) {
    mkdirSync(phraseMapsDir, { recursive: true });
    writeFileSync(mapPath, JSON.stringify(existing, null, 2));
  }

  return mergePhraseMaps(existing, loadOverrides(langCode), sportsEntries);
}

async function processLanguage(langCode) {
  const mapPath = join(phraseMapsDir, `${langCode}.json`);
  const hasPhraseMap = existsSync(mapPath);
  const mergedMap = await buildSportsMap(langCode);

  if (hasPhraseMap) {
    writeLocaleFile(langCode, applyPhraseMapToValues(en, mergedMap));
    console.log(`  ${langCode}: rebuilt from en + phrase map`);
    return;
  }

  const currentTree = await importLocaleTree(langCode);
  writeLocaleFile(langCode, applyPhraseMapToValues(currentTree, mergedMap));
  console.log(`  ${langCode}: patched existing locale with sports translations`);
}

const onlyArg = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
const langs = onlyArg
  ? onlyArg.split(',').map((s) => s.trim())
  : readdirSync(localesDir)
      .filter((file) => file.endsWith('.ts') && file !== 'en.ts')
      .map((file) => file.replace(/\.ts$/, ''))
      .filter((code) => !SKIP_LOCALES.has(code))
      .sort();

console.log(`Translating sports i18n for ${langs.length} locales...`);

for (const langCode of langs) {
  if (!LANG_TARGETS[langCode]) {
    console.log(`skip ${langCode} (unknown target language)`);
    continue;
  }

  console.log(`locale ${langCode}:`);
  await processLanguage(langCode);
  await sleep(800);
}

console.log('done');
