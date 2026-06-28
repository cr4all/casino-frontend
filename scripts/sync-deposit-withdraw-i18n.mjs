#!/usr/bin/env node
/**
 * Sync deposit / withdraw / wallet UI strings across player locales.
 *
 * Usage:
 *   node scripts/sync-deposit-withdraw-i18n.mjs
 *   node scripts/sync-deposit-withdraw-i18n.mjs ja,de,fr
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

const SPLIT = '<<|SPLIT|>>';
const BATCH_CHAR_LIMIT = 1400;

const SYNC_SECTIONS = {
  common: ['maxOnly', 'notAvailable'],
  paymentTypes: ['manual'],
  risk: ['challengeTitle', 'challengeHint', 'challengeFailed'],
  deposit: [
    'selectCountry',
    'selectPaymentOption',
    'noOptionsForCountry',
    'backToMethods',
    'backToKinds',
    'backToOptions',
    'stepMethod',
    'stepOption',
    'stepAmount',
    'selectPaymentKind',
    'selectCrypto',
    'selectBank',
    'kindCountCrypto',
    'kindCountLocal',
    'kindCountManual',
    'kindUnavailable',
    'paymentInstructions',
    'sendToAddress',
    'sendToAddressFiatEstimate',
    'sendToAddressFiatDisclaimer',
    'openPaymentPage',
    'cryptoConfirmHint',
    'redirectConfirmHint',
    'adminConfirmHint',
    'recentDeposits',
    'noDeposits',
    'submitted',
    'submitFailed',
    'estimatedBalance',
    'exchangeRate',
    'estimateDisclaimer',
    'loadingQuote',
    'quoteFailed',
  ],
  withdraw: [
    'title',
    'walletAddress',
    'destinationAccount',
    'networkOptional',
    'requestWithdrawal',
    'recentWithdrawals',
    'noWithdrawals',
    'submitted',
    'submitFailed',
    'verificationRequiredTitle',
    'verificationRequiredMessage',
    'verificationRequiredBanner',
    'verificationLimitBanner',
    'limitAlertTitle',
    'limitAlertEmailOnly',
    'limitAlertPhoneOnly',
    'limitAlertEmailAndPhone',
    'limitAlertGeneric',
    'goToProfile',
  ],
  wallet: [
    'cashBalance',
    'bonusBalance',
    'totalPlayable',
    'withdrawableBalance',
    'withdrawableCash',
    'withdrawableBonus',
    'bonusLockedHint',
    'showBreakdown',
    'balanceBreakdown',
    'fundingSource',
    'walletBucket',
    'cashAfter',
    'bonusAfter',
  ],
  paymentInfoFields: Object.keys(en.paymentInfoFields),
  destinationFields: Object.keys(en.destinationFields),
};

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

function collectPhrases() {
  const phrases = new Set();
  for (const [section, keys] of Object.entries(SYNC_SECTIONS)) {
    for (const key of keys) {
      const value = en[section][key];
      if (typeof value === 'string') {
        phrases.add(value);
      } else if (value && typeof value === 'object') {
        collectStrings(value, phrases);
      }
    }
  }
  return [...phrases];
}

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

async function translatePhraseGoogle(text, targetLang) {
  try {
    const { translate: googleTranslate } = await import('@vitalets/google-translate-api');
    const { protectedText, tokens } = protectPlaceholders(text);
    const result = await googleTranslate(protectedText, { from: 'en', to: targetLang, requestOptions: { timeout: 15000 } });
    const translated = restorePlaceholders(result?.text?.trim() ?? '', tokens);
    if (!translated || translated === text) return null;
    return translated;
  } catch {
    return null;
  }
}

async function translateBatch(phrases, targetLang) {
  if (phrases.length === 0) return [];

  const batches = [];
  let current = [];
  let currentLen = 0;
  for (const phrase of phrases) {
    const len = phrase.length + SPLIT.length;
    if (current.length > 0 && currentLen + len > BATCH_CHAR_LIMIT) {
      batches.push(current);
      current = [];
      currentLen = 0;
    }
    current.push(phrase);
    currentLen += len;
  }
  if (current.length > 0) batches.push(current);

  const translated = [];
  for (const batch of batches) {
    const combined = batch.join(SPLIT);
    let batchResult = await translatePhraseGoogle(combined, targetLang);
    if (!batchResult) {
      translated.push(...batch);
      continue;
    }

    const parts = batchResult.split(SPLIT);
    if (parts.length === batch.length) {
      translated.push(...parts.map((part, index) => part.trim() || batch[index]));
    } else {
      for (const phrase of batch) {
        const single = await translatePhraseGoogle(phrase, targetLang);
        translated.push(single ?? phrase);
      }
    }
  }

  return translated;
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

function listLocaleCodes() {
  return readdirSync(localesDir)
    .filter((name) => name.endsWith('.ts') && name !== 'en.ts')
    .map((name) => name.replace(/\.ts$/, ''));
}

function sectionNeedsSync(sectionName, localeSection) {
  const keys = SYNC_SECTIONS[sectionName] ?? [];
  return keys.some((key) => {
    const english = en[sectionName][key];
    const current = localeSection?.[key];
    if (typeof english === 'object') {
      return !current || JSON.stringify(current) === JSON.stringify(english);
    }
    return !current || current === english;
  });
}

async function syncLanguage(langCode, phrases) {
  if (langCode === 'en') return;

  const targetLang = LANG_TARGETS[langCode] ?? langCode;
  const { map, merged, mapPath } = loadMergedMap(langCode);
  const locale = await loadLocale(langCode);
  let mapUpdated = false;

  const missingPhrases = phrases.filter((phrase) => !merged[phrase] || merged[phrase] === phrase);
  if (missingPhrases.length > 0) {
    const translatedValues = await translateBatch(missingPhrases, targetLang);
    missingPhrases.forEach((phrase, index) => {
      const translated = translatedValues[index];
      if (!translated || translated === phrase) return;
      map[phrase] = translated;
      merged[phrase] = translated;
      mapUpdated = true;
    });
  }

  if (mapUpdated) {
    mkdirSync(phraseMapsDir, { recursive: true });
    writeFileSync(mapPath, JSON.stringify(map, null, 2));
  }

  const needsRebuild = Object.keys(SYNC_SECTIONS).some((section) => sectionNeedsSync(section, locale[section]));
  if (!needsRebuild && !mapUpdated) {
    console.log(`${langCode}: complete`);
    return;
  }

  const next = { ...locale };

  for (const section of Object.keys(SYNC_SECTIONS)) {
    next[section] = buildSection(locale[section], en[section], merged);
  }

  if (locale.wallet?.funding) {
    next.wallet = {
      ...next.wallet,
      funding: buildSection(locale.wallet?.funding, en.wallet.funding, merged),
    };
  }
  if (locale.wallet?.bucket) {
    next.wallet = {
      ...next.wallet,
      bucket: buildSection(locale.wallet?.bucket, en.wallet.bucket, merged),
    };
  }

  writeLocaleFile(langCode, next);
  console.log(`${langCode}: updated`);
}

const args = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const onlyArg = args[0];
const langs = onlyArg
  ? onlyArg.split(',').map((s) => s.trim())
  : listLocaleCodes().filter((code) => code !== 'ko');

mkdirSync(phraseMapsDir, { recursive: true });

const phrases = collectPhrases();
console.log(`Syncing ${phrases.length} deposit/withdraw phrases across ${langs.length} languages`);

for (const langCode of langs) {
  await syncLanguage(langCode, phrases);
}

console.log('done');
