#!/usr/bin/env node
/**
 * Sync player nav.notices + announcement popup strings across all locales.
 *
 * Usage:
 *   node scripts/sync-announcements-i18n.mjs
 *   node scripts/sync-announcements-i18n.mjs --langs=de,fr,ja
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { en } from '../src/i18n/locales/en.ts';
import { applyPhraseMapToValues, mergePhraseMaps } from '../src/i18n/phraseMapUtils.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src/i18n/locales');
const phraseMapsDir = join(root, 'src/i18n/phraseMaps');
const overridesDir = join(root, 'src/i18n/overrides');
const cachePath = join(root, 'scripts/i18n-announcements-data.json');

const require = createRequire(join(root, 'package.json'));

const args = process.argv.slice(2);
const langsArg = args.find((a) => a.startsWith('--langs='));
const onlyLangs = langsArg ? langsArg.split('=')[1].split(',').map((s) => s.trim()).filter(Boolean) : null;
const force = args.includes('--force');

const SPLIT = '<<|SPLIT|>>';
const LINGVA_HOST = 'https://lingva.ml';
const BATCH_CHAR_LIMIT = 1500;
const REQUEST_DELAY_MS = 1200;

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

const googleLocaleMap = {
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

const VARIANT_PARENT = {
  'ar-dz': 'ar',
  'ar-ma': 'ar',
  'ar-tn': 'ar',
  'de-be': 'de',
  'fr-be': 'fr',
  'nl-be': 'nl',
  'pt-br': 'pt',
  'zh-tw': 'zh',
};

const ENGLISH_PATHS = {
  'nav.notices': en.nav.notices,
  'nav.noticesLabel': en.nav.noticesLabel,
  'announcement.popupBadge': en.announcement.popupBadge,
  'announcement.popupClose': en.announcement.popupClose,
  'announcement.popupConfirm': en.announcement.popupConfirm,
  'announcement.hideForToday': en.announcement.hideForToday,
};

const MANUAL = {
  ko: {
    'nav.notices': '알림',
    'nav.noticesLabel': '알림',
    'announcement.popupBadge': '공지',
    'announcement.popupClose': '닫기',
    'announcement.popupConfirm': '확인',
    'announcement.hideForToday': '하루동안 표시하지 않기',
  },
  de: {
    'nav.notices': 'MITTEILUNGEN',
    'nav.noticesLabel': 'Hinweise',
    'announcement.popupBadge': 'Mitteilung',
    'announcement.popupClose': 'Schließen',
    'announcement.popupConfirm': 'OK',
    'announcement.hideForToday': 'Heute nicht mehr anzeigen',
  },
  fr: {
    'nav.notices': 'AVIS',
    'nav.noticesLabel': 'Avis',
    'announcement.popupBadge': 'Annonce',
    'announcement.popupClose': 'Fermer',
    'announcement.popupConfirm': 'OK',
    'announcement.hideForToday': 'Ne plus afficher aujourd\'hui',
  },
  es: {
    'nav.notices': 'AVISOS',
    'nav.noticesLabel': 'Avisos',
    'announcement.popupBadge': 'Anuncio',
    'announcement.popupClose': 'Cerrar',
    'announcement.popupConfirm': 'OK',
    'announcement.hideForToday': 'No volver a mostrar hoy',
  },
  ja: {
    'nav.notices': 'お知らせ',
    'nav.noticesLabel': 'お知らせ',
    'announcement.popupBadge': 'お知らせ',
    'announcement.popupClose': '閉じる',
    'announcement.popupConfirm': 'OK',
    'announcement.hideForToday': '今日は再表示しない',
  },
  zh: {
    'nav.notices': '通知',
    'nav.noticesLabel': '通知',
    'announcement.popupBadge': '公告',
    'announcement.popupClose': '关闭',
    'announcement.popupConfirm': '确定',
    'announcement.hideForToday': '今天不再显示',
  },
  'zh-tw': {
    'nav.notices': '通知',
    'nav.noticesLabel': '通知',
    'announcement.popupBadge': '公告',
    'announcement.popupClose': '關閉',
    'announcement.popupConfirm': '確定',
    'announcement.hideForToday': '今天不再顯示',
  },
};

let googleTranslate = null;
function getGoogleTranslate() {
  if (!googleTranslate) {
    googleTranslate = require('@vitalets/google-translate-api').translate;
  }
  return googleTranslate;
}

function setNested(obj, pathParts, value) {
  let cur = obj;
  for (let i = 0; i < pathParts.length - 1; i++) {
    if (!cur[pathParts[i]] || typeof cur[pathParts[i]] !== 'object') {
      cur[pathParts[i]] = {};
    }
    cur = cur[pathParts[i]];
  }
  cur[pathParts[pathParts.length - 1]] = value;
}

function getNested(obj, path) {
  const parts = path.split('.');
  let cur = obj;
  for (const part of parts) {
    cur = cur?.[part];
  }
  return cur;
}

function protectPlaceholders(text) {
  const tokens = [];
  const protectedText = text.replace(/\{\{(\w+)\}\}/g, (match) => {
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function translateWithLingva(text, to, attempt = 1) {
  const target = googleLocaleMap[to] ?? to;
  const url = `${LINGVA_HOST}/api/v1/en/${target}/${encodeURIComponent(text)}`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(45000) });

    if (response.status === 429 && attempt <= 6) {
      await sleep(10000 * attempt);
      return translateWithLingva(text, to, attempt + 1);
    }

    if (!response.ok) {
      if (attempt <= 3) {
        await sleep(2000 * attempt);
        return translateWithLingva(text, to, attempt + 1);
      }
      return null;
    }

    const data = await response.json();
    const translated = data?.translation?.trim();
    if (!translated || translated === text) return null;
    return translated;
  } catch {
    if (attempt <= 2) {
      await sleep(2000 * attempt);
      return translateWithLingva(text, to, attempt + 1);
    }
    return null;
  }
}

async function translateWithGoogle(text, to) {
  try {
    const target = googleLocaleMap[to] ?? to;
    const { protectedText, tokens } = protectPlaceholders(text);
    const result = await getGoogleTranslate()(protectedText, { from: 'en', to: target, requestOptions: { timeout: 12000 } });
    const translated = restorePlaceholders(result?.text?.trim() ?? '', tokens);
    if (!translated || translated === text) return null;
    return translated;
  } catch {
    return null;
  }
}

async function translateText(text, code) {
  const { protectedText, tokens } = protectPlaceholders(text);
  let translated = await translateWithLingva(protectedText, code);
  if (!translated) {
    translated = await translateWithGoogle(protectedText, code);
  }
  if (!translated) return text;
  return restorePlaceholders(translated, tokens);
}

function buildBatches(entries) {
  const batches = [];
  let current = [];
  let currentLen = 0;

  for (const entry of entries) {
    const len = entry[1].length + SPLIT.length;
    if (current.length > 0 && currentLen + len > BATCH_CHAR_LIMIT) {
      batches.push(current);
      current = [];
      currentLen = 0;
    }
    current.push(entry);
    currentLen += len;
  }

  if (current.length > 0) batches.push(current);
  return batches;
}

async function translateBatchEntries(batch, code) {
  const combined = batch.map(([, value]) => value).join(SPLIT);
  const { protectedText, tokens } = protectPlaceholders(combined);
  let translatedCombined = await translateWithLingva(protectedText, code);
  if (!translatedCombined) {
    translatedCombined = await translateWithGoogle(protectedText, code);
  }
  if (!translatedCombined) {
    return batch.map(([, value]) => value);
  }
  translatedCombined = restorePlaceholders(translatedCombined, tokens);
  const parts = translatedCombined.split(SPLIT);
  if (parts.length !== batch.length) {
    const out = [];
    for (const [, value] of batch) {
      out.push(await translateText(value, code));
      await sleep(300);
    }
    return out;
  }
  return parts;
}

function loadCache() {
  if (!existsSync(cachePath)) return {};
  return JSON.parse(readFileSync(cachePath, 'utf8'));
}

function saveCache(cache) {
  writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}

function needsUpdate(path, current, english) {
  if (current == null || current === '') return true;
  if (current === english) return true;
  return false;
}

function pathsNeedUpdate(locale, pathsToCheck) {
  for (const [path, english] of Object.entries(pathsToCheck)) {
    const current = getNested(locale, path);
    if (needsUpdate(path, current, english)) return true;
  }
  return false;
}

async function resolvePaths(langCode, cache) {
  const parent = VARIANT_PARENT[langCode];
  if (MANUAL[langCode]) return MANUAL[langCode];
  if (parent && MANUAL[parent]) return MANUAL[parent];
  if (!force && cache[langCode]) return cache[langCode];

  const entries = Object.entries(ENGLISH_PATHS);
  const batches = buildBatches(entries);
  const resolved = {};

  for (const batch of batches) {
    const values = await translateBatchEntries(batch, langCode);
    batch.forEach(([path], index) => {
      resolved[path] = values[index] ?? batch.find(([, v]) => v)[1];
    });
    await sleep(REQUEST_DELAY_MS);
  }

  cache[langCode] = resolved;
  saveCache(cache);
  return resolved;
}

function applyPathsToLocale(locale, paths) {
  const next = { ...locale, nav: { ...locale.nav }, announcement: { ...(locale.announcement ?? {}) } };
  for (const [path, value] of Object.entries(paths)) {
    setNested(next, path.split('.'), value);
  }
  return next;
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

function hasPhraseMap(langCode) {
  return existsSync(join(phraseMapsDir, `${langCode}.json`));
}

function copyRegionalVariants() {
  for (const [child, parent] of Object.entries(VARIANT_PARENT)) {
    const parentPath = join(localesDir, `${parent}.ts`);
    const childPath = join(localesDir, `${child}.ts`);
    if (existsSync(parentPath)) {
      writeFileSync(childPath, readFileSync(parentPath, 'utf8').replace(
        new RegExp(`export const ${EXPORT_NAMES[parent] ?? parent.replace(/-/g, '')}`),
        `export const ${EXPORT_NAMES[child] ?? child.replace(/-/g, '')}`,
      ));
      console.log(`${child}: copied from ${parent}`);
    }
  }
}

const cache = loadCache();
let localeCodes = readdirSync(localesDir)
  .filter((name) => name.endsWith('.ts') && name !== 'en.ts')
  .map((name) => name.replace(/\.ts$/, ''))
  .filter((code) => !VARIANT_PARENT[code]);

if (onlyLangs) {
  localeCodes = localeCodes.filter((code) => onlyLangs.includes(code));
}

for (const langCode of localeCodes) {
  const locale = await loadLocale(langCode);
  const hasManual = MANUAL[langCode] || (VARIANT_PARENT[langCode] && MANUAL[VARIANT_PARENT[langCode]]);
  const needsWork = force || hasManual || pathsNeedUpdate(locale, ENGLISH_PATHS);

  if (!needsWork) {
    console.log(`${langCode}: complete`);
    continue;
  }

  const paths = await resolvePaths(langCode, cache);
  const phraseEntries = Object.fromEntries(
    Object.entries(ENGLISH_PATHS).map(([path, english]) => [english, paths[path] ?? english]),
  );

  if (hasPhraseMap(langCode)) {
    const mapPath = join(phraseMapsDir, `${langCode}.json`);
    const map = JSON.parse(readFileSync(mapPath, 'utf8'));
    Object.assign(map, phraseEntries);
    writeFileSync(mapPath, JSON.stringify(map, null, 2));

    const overridePath = join(overridesDir, `${langCode}.json`);
    const overrides = existsSync(overridePath) ? JSON.parse(readFileSync(overridePath, 'utf8')) : {};
    const mergedMap = mergePhraseMaps(map, overrides);
    const current = await loadLocale(langCode);
    writeLocaleFile(langCode, {
      ...applyPhraseMapToValues(en, mergedMap),
      affiliate: current.affiliate,
    });
    console.log(`${langCode}: phrase map + locale rebuilt`);
    continue;
  }

  writeLocaleFile(langCode, applyPathsToLocale(locale, paths));
  console.log(`${langCode}: announcement strings patched`);
}

copyRegionalVariants();
console.log('done');
