import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const phrases = JSON.parse(readFileSync(join(root, 'scripts/legal-phrases.json'), 'utf8'));
const outDir = join(root, 'src/content/legal/phraseMaps');
const i18nMapsDir = join(root, 'src/i18n/phraseMaps');

const LANG_TARGETS = {
  af: 'af',
  am: 'am',
  cy: 'cy',
  ga: 'ga',
  gu: 'gu',
  ha: 'ha',
  ig: 'ig',
  is: 'is',
  kn: 'kn',
  lb: 'lb',
  lo: 'lo',
  ml: 'ml',
  mr: 'mr',
  mt: 'mt',
  my: 'my',
  ne: 'ne',
  pa: 'pa',
  si: 'si',
  so: 'so',
  ta: 'ta',
  te: 'te',
  yo: 'yo',
  zu: 'zu',
};

const EMAIL_KEY = 'Email: support@ibets24.com';

async function translatePhrase(text, targetLang) {
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text.slice(0, 500));
  url.searchParams.set('langpair', `en|${targetLang}`);

  const response = await fetch(url);
  if (!response.ok) return text;

  const data = await response.json();
  const translated = data?.responseData?.translatedText;
  if (!translated || typeof translated !== 'string') return text;

  const warning = data?.responseStatus;
  if (warning === 429 || /MYMEMORY WARNING/i.test(translated)) return text;

  return translated;
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function buildMap(langCode, { force = false } = {}) {
  const outPath = join(outDir, `${langCode}.json`);
  if (!force && existsSync(outPath)) {
    console.log(`skip ${langCode} (exists)`);
    return { langCode, skipped: true };
  }

  const targetLang = LANG_TARGETS[langCode] ?? langCode;
  const i18nPath = join(i18nMapsDir, `${langCode}.json`);
  const i18nMap = existsSync(i18nPath) ? loadJson(i18nPath) : {};
  const existingMap = existsSync(outPath) ? loadJson(outPath) : {};

  const map = {};
  let fromI18n = 0;
  let fromApi = 0;
  let kept = 0;

  for (const phrase of phrases) {
    if (
      !force &&
      existingMap[phrase] &&
      existingMap[phrase] !== phrase &&
      phrase !== EMAIL_KEY
    ) {
      map[phrase] = existingMap[phrase];
      kept += 1;
      continue;
    }

    if (i18nMap[phrase] && i18nMap[phrase] !== phrase) {
      map[phrase] = i18nMap[phrase];
      fromI18n += 1;
      continue;
    }

    map[phrase] = await translatePhrase(phrase, targetLang);
    fromApi += 1;
    await sleep(350);
  }

  writeFileSync(outPath, `${JSON.stringify(map, null, 2)}\n`);
  const translated = Object.entries(map).filter(
    ([english, localized]) => english !== localized,
  ).length;
  console.log(
    `${langCode}: saved (${translated}/${phrases.length} translated, i18n=${fromI18n}, api=${fromApi}, kept=${kept})`,
  );
  return { langCode, translated, total: phrases.length };
}

mkdirSync(outDir, { recursive: true });

const args = process.argv.slice(2);
const force = args.includes('--force');
const onlyArg = args.find((arg) => !arg.startsWith('--'));
const requested = onlyArg
  ? onlyArg.split(',').map((s) => s.trim())
  : Object.keys(LANG_TARGETS);

const missing = requested.filter((code) => LANG_TARGETS[code] || requested.length === 1);

console.log(`Building legal phrase maps for: ${missing.join(', ')}`);

const results = [];
for (const langCode of missing) {
  try {
    results.push(await buildMap(langCode, { force }));
  } catch (error) {
    console.error(`${langCode}: failed`, error);
  }
}

console.log('\n=== Summary ===');
for (const result of results) {
  if (result.skipped) continue;
  console.log(`${result.langCode}: ${result.translated}/${result.total}`);
}
