#!/usr/bin/env node
/**
 * Apply hand-maintained deposit/withdraw phrase translations when auto-translate is unavailable.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';
import { applyPhraseMapToValues, mergePhraseMaps } from '../src/i18n/phraseMapUtils.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src/i18n/locales');
const phraseMapsDir = join(root, 'src/i18n/phraseMaps');
const overridesDir = join(root, 'src/i18n/overrides');
const manualPath = join(root, 'scripts/deposit-withdraw-manual-phrases.json');

const EXPORT_NAMES = {
  'ar-ma': 'arMa', 'ar-dz': 'arDz', 'ar-tn': 'arTn', 'de-be': 'deBe', 'fr-be': 'frBe',
  'nl-be': 'nlBe', 'pt-br': 'ptBr', 'zh-tw': 'zhTw',
};

const SYNC_SECTIONS = [
  'common',
  'paymentTypes',
  'risk',
  'deposit',
  'withdraw',
  'wallet',
  'paymentInfoFields',
  'destinationFields',
];

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
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

function buildSection(existingSection, enSection, phraseMap) {
  const localized = applyPhraseMapToValues(enSection, phraseMap);
  const result = { ...(existingSection ?? {}) };

  for (const key of Object.keys(enSection)) {
    const english = enSection[key];
    const existing = existingSection?.[key];

    if (typeof english === 'object' && english !== null) {
      result[key] = buildSection(
        typeof existing === 'object' && existing !== null ? existing : undefined,
        english,
        phraseMap,
      );
      continue;
    }

    if (existing && existing !== english) {
      result[key] = existing;
      continue;
    }
    result[key] = localized[key] ?? english;
  }

  return result;
}

const manual = loadJson(manualPath);

for (const [langCode, phrases] of Object.entries(manual)) {
  if (langCode === 'en') continue;

  const mapPath = join(phraseMapsDir, `${langCode}.json`);
  const overridePath = join(overridesDir, `${langCode}.json`);
  const existingMap = existsSync(mapPath) ? loadJson(mapPath) : {};
  const overrides = existsSync(overridePath) ? loadJson(overridePath) : {};
  const map = { ...existingMap, ...phrases };
  writeFileSync(mapPath, JSON.stringify(map, null, 2));

  const merged = mergePhraseMaps(map, overrides);
  const locale = await loadLocale(langCode);
  const next = { ...locale };

  for (const section of SYNC_SECTIONS) {
    next[section] = buildSection(locale[section], en[section], merged);
  }

  if (en.wallet?.funding) {
    next.wallet = {
      ...next.wallet,
      funding: buildSection(locale.wallet?.funding, en.wallet.funding, merged),
    };
  }
  if (en.wallet?.bucket) {
    next.wallet = {
      ...next.wallet,
      bucket: buildSection(locale.wallet?.bucket, en.wallet.bucket, merged),
    };
  }

  writeLocaleFile(langCode, next);
  console.log(`${langCode}: applied ${Object.keys(phrases).length} manual phrases`);
}

console.log('done');
