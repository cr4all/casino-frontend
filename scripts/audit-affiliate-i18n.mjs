import { existsSync, readdirSync, readFileSync } from 'node:fs';
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

const LOCALE_VARIANT_PARENT = {
  'ar-dz': 'ar',
  'ar-ma': 'ar',
  'ar-tn': 'ar',
  'de-be': 'de',
  'fr-be': 'fr',
  'nl-be': 'nl',
};

function loadMergedMap(langCode) {
  const mapPath = join(phraseMapsDir, `${langCode}.json`);
  const overridePath = join(overridesDir, `${langCode}.json`);
  const map = existsSync(mapPath) ? JSON.parse(readFileSync(mapPath, 'utf8')) : {};
  const overrides = existsSync(overridePath) ? JSON.parse(readFileSync(overridePath, 'utf8')) : {};
  return mergePhraseMaps(map, overrides);
}

async function loadLocale(langCode) {
  const exportName = EXPORT_NAMES[langCode] ?? langCode.replace(/-/g, '');
  const mod = await import(pathToFileURL(join(localesDir, `${langCode}.ts`)).href);
  return mod[exportName];
}

function resolveAffiliate(langCode, locale, parentAffiliate, phraseMap) {
  const mapped = phraseMap ? applyPhraseMapToValues(en.affiliate, phraseMap) : {};
  const merged = {};
  for (const key of Object.keys(en.affiliate)) {
    const english = en.affiliate[key];
    const existing = locale?.affiliate?.[key];
    const parent = parentAffiliate?.[key];
    const mappedValue = mapped[key];
    if (existing && existing !== english) merged[key] = existing;
    else if (parent && parent !== english) merged[key] = parent;
    else if (mappedValue && mappedValue !== english) merged[key] = mappedValue;
    else merged[key] = existing ?? mappedValue ?? parent ?? english;
  }
  return merged;
}

const codes = readdirSync(localesDir)
  .filter((name) => name.endsWith('.ts') && name !== 'en.ts')
  .map((name) => name.replace(/\.ts$/, ''));

const cache = new Map();
for (const code of codes) {
  cache.set(code, await loadLocale(code));
}

const incomplete = [];
for (const code of codes) {
  const parentCode = LOCALE_VARIANT_PARENT[code];
  const parentAffiliate = parentCode ? cache.get(parentCode)?.affiliate : undefined;
  const phraseMap = loadMergedMap(code);
  const resolved = resolveAffiliate(code, cache.get(code), parentAffiliate, phraseMap);
  const missing = Object.entries(en.affiliate).filter(([key, english]) => resolved[key] === english);
  if (missing.length > 0) {
    incomplete.push({ code, missing: missing.length, title: resolved.title });
  }
}

console.log(JSON.stringify(incomplete, null, 2));
console.log(`Incomplete languages: ${incomplete.length}`);
