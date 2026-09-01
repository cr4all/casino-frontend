#!/usr/bin/env node
/**
 * Apply curated affiliateProgram translations from scripts/i18n-affiliate-program-manual.json
 *
 * Usage:
 *   node scripts/apply-affiliate-program-manual.mjs
 *   node scripts/apply-affiliate-program-manual.mjs es,fr,ja
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';
import { applyPhraseMapToValues, mergePhraseMaps } from '../src/i18n/phraseMapUtils.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src/i18n/locales');
const phraseMapsDir = join(root, 'src/i18n/phraseMaps');
const overridesDir = join(root, 'src/i18n/overrides');
const manualPath = join(root, 'scripts/i18n-affiliate-program-manual.json');

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

const PRESERVE_LOCALE = new Set(['ko', 'de']);

const AUTH_AFFILIATE_KEYS = [
  'affiliatePortalLoginTitle',
  'affiliateRegisterTitle',
  'affiliateReferralCode',
  'affiliateReferralCodeHint',
  'affiliateReferralCodeInvalid',
  'affiliateRegisterError',
  'hasAffiliateAccount',
];

const NAV_KEYS = ['affiliateProgram', 'affiliateProgramLabel'];

const args = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const onlyArg = args.find((arg) => !arg.startsWith('--'));
const langsFilter = onlyArg ? onlyArg.split(',').map((s) => s.trim()).filter(Boolean) : null;

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

async function loadLocale(langCode) {
  const exportName = EXPORT_NAMES[langCode] ?? langCode.replace(/-/g, '');
  const mod = await import(pathToFileURL(join(localesDir, `${langCode}.ts`)).href);
  return mod[exportName];
}

function buildPhraseEntries(manualEntry) {
  const entries = {};

  for (const key of Object.keys(en.affiliateProgram)) {
    const english = en.affiliateProgram[key];
    const translated = manualEntry.affiliateProgram?.[key];
    if (translated && translated !== english) {
      entries[english] = translated;
    }
  }

  for (const key of AUTH_AFFILIATE_KEYS) {
    const english = en.auth[key];
    const translated = manualEntry.auth?.[key];
    if (translated && translated !== english) {
      entries[english] = translated;
    }
  }

  for (const key of NAV_KEYS) {
    const english = en.nav[key];
    const translated = manualEntry.nav?.[key];
    if (translated && translated !== english) {
      entries[english] = translated;
    }
  }

  return entries;
}

function buildAffiliateProgramSection(existingSection, phraseMap) {
  const localized = applyPhraseMapToValues(en.affiliateProgram, phraseMap);
  const result = {};

  for (const key of Object.keys(en.affiliateProgram)) {
    const english = en.affiliateProgram[key];
    const existing = existingSection?.[key];
    if (existing && existing !== english) {
      result[key] = existing;
      continue;
    }
    result[key] = localized[key] ?? english;
  }

  return result;
}

if (!existsSync(manualPath)) {
  console.error(`Missing ${manualPath}`);
  process.exit(1);
}

const manual = loadJson(manualPath);
const langs = langsFilter ?? Object.keys(manual);

for (const langCode of langs) {
  const manualEntry = manual[langCode];
  if (!manualEntry) {
    console.log(`skip ${langCode} (no manual entry)`);
    continue;
  }

  const phraseEntries = buildPhraseEntries(manualEntry);
  const mapPath = join(phraseMapsDir, `${langCode}.json`);
  const overridePath = join(overridesDir, `${langCode}.json`);
  const map = existsSync(mapPath) ? loadJson(mapPath) : {};
  const overrides = existsSync(overridePath) ? loadJson(overridePath) : {};
  const merged = mergePhraseMaps(map, overrides);

  let updated = 0;
  for (const [english, translated] of Object.entries(phraseEntries)) {
    if (merged[english] === translated) continue;
    map[english] = translated;
    merged[english] = translated;
    updated += 1;
  }

  if (updated > 0) {
    writeFileSync(mapPath, JSON.stringify(map, null, 2));
  }

  if (PRESERVE_LOCALE.has(langCode)) {
    console.log(`${langCode}: phrase map +${updated} (preserved locale)`);
    continue;
  }

  const locale = await loadLocale(langCode);
  const affiliateProgram = buildAffiliateProgramSection(locale.affiliateProgram, merged);
  const next = { ...locale, affiliateProgram };

  if (manualEntry.nav) {
    next.nav = { ...locale.nav, ...manualEntry.nav };
  }
  if (manualEntry.auth) {
    next.auth = { ...locale.auth, ...manualEntry.auth };
  }

  writeLocaleFile(langCode, next);
  console.log(`${langCode}: applied manual affiliateProgram (+${updated} phrase map entries)`);
}

console.log('done');
