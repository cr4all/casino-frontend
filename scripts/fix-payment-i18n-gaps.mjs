#!/usr/bin/env node
/**
 * Find payment/deposit/withdraw UI strings still identical to English and translate them.
 *
 * Usage:
 *   npx tsx scripts/fix-payment-i18n-gaps.mjs
 *   npx tsx scripts/fix-payment-i18n-gaps.mjs sq,de,ja
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';
import { applyPhraseMapToValues, mergePhraseMaps } from '../src/i18n/phraseMapUtils.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src/i18n/locales');
const phraseMapsDir = join(root, 'src/i18n/phraseMaps');
const overridesDir = join(root, 'src/i18n/overrides');
const manualPath = join(root, 'scripts/deposit-withdraw-manual-phrases.json');

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

const SYNC_SECTIONS = [
  'common',
  'paymentMethods',
  'paymentTypes',
  'risk',
  'deposit',
  'withdraw',
  'wallet',
  'paymentInfoFields',
  'destinationFields',
];

const SPLIT = '<<|SPLIT|>>';
const BATCH_CHAR_LIMIT = 1200;

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

function protectPlaceholders(text) {
  const tokens = [];
  const protectedText = text.replace(/\{\{[^}]+\}\}/g, (match) => {
    const token = `__PH_${tokens.length}__`;
    tokens.push(match);
    return token;
  });
  return { protectedText, tokens };
}

function restorePlaceholders(text, tokens) {
  let restored = text;
  tokens.forEach((token, index) => {
    restored = restored.replace(`__PH_${index}__`, token);
  });
  return restored;
}

async function translateMyMemory(text, targetLang, attempt = 1) {
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text.slice(0, 450));
  url.searchParams.set('langpair', `en|${targetLang}`);
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const translated = data?.responseData?.translatedText?.trim();
    if (!translated || translated === text) return null;
    if (String(data?.responseDetails ?? '').includes('MYMEMORY WARNING')) return null;
    return translated;
  } catch {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 1200 * attempt));
      return translateMyMemory(text, targetLang, attempt + 1);
    }
    return null;
  }
}

async function translateGoogle(text, targetLang) {
  try {
    const { translate: googleTranslate } = await import('@vitalets/google-translate-api');
    const { protectedText, tokens } = protectPlaceholders(text);
    const result = await googleTranslate(protectedText, { from: 'en', to: targetLang, requestOptions: { timeout: 12000 } });
    const translated = restorePlaceholders(result?.text?.trim() ?? '', tokens);
    if (!translated || translated === text) return null;
    return translated;
  } catch {
    return null;
  }
}

async function translateText(text, targetLang) {
  const memory = await translateMyMemory(text, targetLang);
  if (memory) return memory;
  return translateGoogle(text, targetLang);
}

async function translateBatch(phrases, targetLang) {
  const results = [];
  for (let i = 0; i < phrases.length; i += 8) {
    const batch = phrases.slice(i, i + 8);
    const translated = await Promise.all(batch.map((phrase) => translateText(phrase, targetLang)));
    results.push(...translated);
    if (i + 8 < phrases.length) await new Promise((r) => setTimeout(r, 250));
  }
  return results.map((value, index) => value ?? phrases[index]);
}

function collectUntranslated(enNode, locNode, missing) {
  if (typeof enNode === 'string') {
    const loc = typeof locNode === 'string' ? locNode : undefined;
    if (!loc || loc === enNode) missing.add(enNode);
    return;
  }
  if (enNode && typeof enNode === 'object') {
    for (const key of Object.keys(enNode)) {
      collectUntranslated(enNode[key], locNode?.[key], missing);
    }
  }
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

function listLocaleCodes() {
  return readdirSync(localesDir)
    .filter((name) => name.endsWith('.ts') && name !== 'en.ts')
    .map((name) => name.replace(/\.ts$/, ''));
}

const manualPhrases = existsSync(manualPath) ? loadJson(manualPath) : {};

async function syncLanguage(langCode) {
  const targetLang = LANG_TARGETS[langCode] ?? langCode;
  const locale = await loadLocale(langCode);
  const { map, merged, mapPath } = loadMergedMap(langCode);

  if (manualPhrases[langCode]) {
    Object.assign(map, manualPhrases[langCode]);
    Object.assign(merged, manualPhrases[langCode]);
  }

  const missing = new Set();
  for (const section of SYNC_SECTIONS) {
    collectUntranslated(en[section], locale[section], missing);
  }

  const toTranslate = [...missing].filter((phrase) => !merged[phrase] || merged[phrase] === phrase);
  let mapUpdated = Boolean(manualPhrases[langCode]);

  if (toTranslate.length > 0) {
    console.log(`${langCode}: translating ${toTranslate.length} phrases...`);
    const translated = await translateBatch(toTranslate, targetLang);
    toTranslate.forEach((phrase, index) => {
      const value = translated[index];
      if (!value || value === phrase) return;
      map[phrase] = value;
      merged[phrase] = value;
      mapUpdated = true;
    });
  }

  if (mapUpdated) {
    mkdirSync(phraseMapsDir, { recursive: true });
    writeFileSync(mapPath, JSON.stringify(map, null, 2));
  }

  const next = { ...locale };
  for (const section of SYNC_SECTIONS) {
    next[section] = buildSection(locale[section], en[section], merged);
  }

  writeLocaleFile(langCode, next);
  console.log(`${langCode}: updated`);
}

const args = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const langs = args[0]
  ? args[0].split(',').map((s) => s.trim())
  : listLocaleCodes();

mkdirSync(phraseMapsDir, { recursive: true });

for (const langCode of langs) {
  await syncLanguage(langCode);
}

console.log('done');
