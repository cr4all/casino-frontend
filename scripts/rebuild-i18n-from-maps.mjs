import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';
import { applyPhraseMapToValues, mergePhraseMaps } from '../src/i18n/phraseMapUtils.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src/i18n/locales');
const phraseMapsDir = join(root, 'src/i18n/phraseMaps');
const overridesDir = join(root, 'src/i18n/overrides');

const NEW_1XBET_LOCALES = [
  'af', 'am', 'az', 'be', 'bg', 'bn', 'cy', 'fa', 'ga', 'gu', 'ha', 'he', 'hy', 'ig', 'is',
  'ka', 'kk', 'km', 'kn', 'lb', 'lo', 'lt', 'ml', 'mn', 'mr', 'ms', 'mt', 'my', 'ne', 'nl',
  'pa', 'ro', 'si', 'so', 'sv', 'sw', 'ta', 'te', 'tg', 'th', 'uk', 'uz', 'vi', 'yo', 'zh-tw', 'zu',
];

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

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
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

function buildMergedMap(langCode) {
  const mapPath = join(phraseMapsDir, `${langCode}.json`);
  const overridePath = join(overridesDir, `${langCode}.json`);
  const map = existsSync(mapPath) ? loadJson(mapPath) : {};
  const overrides = existsSync(overridePath) ? loadJson(overridePath) : {};
  return mergePhraseMaps(map, overrides);
}

const onlyArg = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
const langs = onlyArg
  ? onlyArg.split(',').map((s) => s.trim())
  : NEW_1XBET_LOCALES;

for (const langCode of langs) {
  const mergedMap = buildMergedMap(langCode);
  const translatedCount = Object.entries(mergedMap).filter(([a, b]) => a !== b).length;

  if (translatedCount === 0) {
    console.log(`skip ${langCode} (no translations)`);
    continue;
  }

  writeLocaleFile(langCode, applyPhraseMapToValues(en, mergedMap));
  console.log(`${langCode}: rebuilt (${translatedCount} translated phrases)`);
}

console.log('done');
