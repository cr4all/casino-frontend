#!/usr/bin/env node
/**
 * Sync affiliateProgram page + affiliate register auth strings across locales.
 *
 * Usage:
 *   node scripts/sync-affiliate-program-i18n.mjs
 *   node scripts/sync-affiliate-program-i18n.mjs ko,de,ja
 *   node scripts/sync-affiliate-program-i18n.mjs --apply-only
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { en } from '../src/i18n/locales/en.ts';
import { applyPhraseMapToValues, mergePhraseMaps } from '../src/i18n/phraseMapUtils.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src/i18n/locales');
const phraseMapsDir = join(root, 'src/i18n/phraseMaps');
const overridesDir = join(root, 'src/i18n/overrides');
const cachePath = join(root, 'scripts/i18n-affiliate-program-data.json');

const require = createRequire(join(root, 'package.json'));

const args = process.argv.slice(2);
const applyOnly = args.includes('--apply-only');
const onlyArg = args.find((arg) => !arg.startsWith('--'));
const langsOverride = onlyArg ? onlyArg.split(',').map((s) => s.trim()).filter(Boolean) : null;

const AUTH_AFFILIATE_KEYS = [
  'affiliatePortalLoginTitle',
  'affiliateRegisterTitle',
  'affiliateReferralCode',
  'affiliateReferralCodeHint',
  'affiliateReferralCodeInvalid',
  'affiliateRegisterError',
  'hasAffiliateAccount',
];

const KEEP_PARTIAL = [
  'iBets24',
  'partners@ibets24.com',
  'support@ibets24.com',
  'Affiliate Portal',
  'B2B',
  'USD',
  'NGR',
  'GGR',
  'RevShare',
  'CPA',
  'SEO',
  'KYC',
  'AML',
];

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

const VARIANT_PARENT = {
  'ar-dz': 'ar',
  'ar-ma': 'ar',
  'ar-tn': 'ar',
  'de-be': 'de',
  'fr-be': 'fr',
  'nl-be': 'nl',
};

const PRESERVE_LOCALE = new Set(['ko', 'de']);

let googleTranslate = null;
function getGoogleTranslate() {
  if (!googleTranslate) {
    googleTranslate = require('@vitalets/google-translate-api').translate;
  }
  return googleTranslate;
}

function collectPhrases() {
  const phrases = [...Object.values(en.affiliateProgram)];
  for (const key of AUTH_AFFILIATE_KEYS) {
    phrases.push(en.auth[key]);
  }
  return [...new Set(phrases)];
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function loadCache() {
  if (!existsSync(cachePath)) return {};
  try {
    return loadJson(cachePath);
  } catch {
    return {};
  }
}

function saveCache(cache) {
  writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}

function loadMergedMap(langCode) {
  const mapPath = join(phraseMapsDir, `${langCode}.json`);
  const overridePath = join(overridesDir, `${langCode}.json`);
  const map = existsSync(mapPath) ? loadJson(mapPath) : {};
  const overrides = existsSync(overridePath) ? loadJson(overridePath) : {};
  return { map, merged: mergePhraseMaps(map, overrides), mapPath };
}

function protectText(text) {
  const tokens = [];
  let protectedText = text;
  for (const value of KEEP_PARTIAL) {
    let idx;
    while ((idx = protectedText.indexOf(value)) !== -1) {
      const token = `{ZKP${tokens.length}Z}`;
      tokens.push({ token, value });
      protectedText = `${protectedText.slice(0, idx)}${token}${protectedText.slice(idx + value.length)}`;
    }
  }
  return { protectedText, tokens };
}

function restoreText(text, tokens) {
  let result = text;
  for (const { token, value } of tokens) {
    result = result.split(token).join(value);
  }
  return result;
}

function isBrokenTranslation(value) {
  return /KP_\d+__|__\s*KP[\s_]|__KP[\s_]|{ZKP\d+Z}/i.test(value);
}

async function translatePhraseGoogle(text, targetLang) {
  const { protectedText, tokens } = protectText(text);
  try {
    const result = await getGoogleTranslate()(protectedText, {
      from: 'en',
      to: targetLang === 'zh-CN' ? 'zh-CN' : targetLang === 'zh-TW' ? 'zh-TW' : targetLang,
      requestOptions: { timeout: 8000 },
    });
    const translated = restoreText(result?.text?.trim() ?? '', tokens);
    if (!translated || translated === text) return null;
    return translated;
  } catch {
    return null;
  }
}

async function translatePhrase(text, targetLang, attempt = 1) {
  const { protectedText, tokens } = protectText(text);
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', protectedText.slice(0, 500));
  url.searchParams.set('langpair', `en|${targetLang}`);

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const details = String(data?.responseDetails ?? '');
    if (details.includes('MYMEMORY WARNING')) {
      if (attempt < 4) {
        await new Promise((r) => setTimeout(r, 1500 * attempt));
        return translatePhrase(text, targetLang, attempt + 1);
      }
      return null;
    }
    const translated = restoreText(data?.responseData?.translatedText?.trim() ?? '', tokens);
    if (!translated || translated === text) return null;
    return translated;
  } catch {
    if (attempt < 4) {
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      return translatePhrase(text, targetLang, attempt + 1);
    }
    return null;
  }
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

function buildAffiliateProgramSection(existingSection, phraseMap) {
  const localized = applyPhraseMapToValues(en.affiliateProgram, phraseMap);
  const result = {};

  for (const key of Object.keys(en.affiliateProgram)) {
    const english = en.affiliateProgram[key];
    const existing = existingSection?.[key];
    if (existing && existing !== english && !isBrokenTranslation(existing)) {
      result[key] = existing;
      continue;
    }
    result[key] = localized[key] ?? english;
  }

  return result;
}

function listLocaleCodes() {
  const codes = readdirSync(localesDir)
    .filter((name) => name.endsWith('.ts') && name !== 'en.ts')
    .map((name) => name.replace(/\.ts$/, ''));

  const parents = new Set(Object.values(VARIANT_PARENT));
  const variants = codes.filter((code) => VARIANT_PARENT[code]);
  const roots = codes.filter((code) => !VARIANT_PARENT[code]);
  roots.sort();
  variants.sort((a, b) => {
    const parentOrder = roots.indexOf(VARIANT_PARENT[a]) - roots.indexOf(VARIANT_PARENT[b]);
    return parentOrder !== 0 ? parentOrder : a.localeCompare(b);
  });

  return [...roots, ...variants];
}

async function mapWithConcurrency(items, concurrency, fn) {
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current], current);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

async function syncLanguage(langCode, phrases, cache, parentMaps) {
  if (langCode === 'en') return;

  const targetLang = LANG_TARGETS[langCode] ?? langCode;
  const { map, merged, mapPath } = loadMergedMap(langCode);
  const locale = await loadLocale(langCode);
  let mapUpdated = false;

  const parentCode = VARIANT_PARENT[langCode];
  if (parentCode && parentMaps[parentCode]) {
    for (const phrase of phrases) {
      if (merged[phrase] && merged[phrase] !== phrase) continue;
      const inherited = parentMaps[parentCode][phrase];
      if (inherited && inherited !== phrase) {
        map[phrase] = inherited;
        merged[phrase] = inherited;
        mapUpdated = true;
      }
    }
  }

  if (!applyOnly) {
    const missing = phrases.filter((phrase) => {
      const current = merged[phrase];
      if (!current || current === phrase) return true;
      return isBrokenTranslation(current);
    });

    for (const phrase of missing) {
      if (merged[phrase] && isBrokenTranslation(merged[phrase])) {
        delete map[phrase];
        delete merged[phrase];
        mapUpdated = true;
      }
    }

    await mapWithConcurrency(missing, 6, async (phrase) => {
      const preservedProgram = Object.values(locale.affiliateProgram ?? {}).find(
        (value) => value === phrase,
      );
      if (preservedProgram && preservedProgram !== phrase) return;

      const preservedAuth = AUTH_AFFILIATE_KEYS.map((key) => locale.auth?.[key]).find(
        (value) => value === phrase,
      );
      if (preservedAuth && preservedAuth !== phrase) return;

      const cacheKey = `${langCode}::${phrase}`;
      if (cache[cacheKey] && cache[cacheKey] !== phrase) {
        map[phrase] = cache[cacheKey];
        merged[phrase] = cache[cacheKey];
        mapUpdated = true;
        return;
      }

      let finalTranslation = await translatePhraseGoogle(phrase, targetLang);
      if (!finalTranslation || finalTranslation === phrase) {
        finalTranslation = await translatePhrase(phrase, targetLang);
      }
      if (!finalTranslation || finalTranslation === phrase) return;

      map[phrase] = finalTranslation;
      merged[phrase] = finalTranslation;
      cache[cacheKey] = finalTranslation;
      mapUpdated = true;
    });

    const stillMissing = phrases.filter((phrase) => {
      const current = merged[phrase];
      return !current || current === phrase || isBrokenTranslation(current);
    });

    for (const phrase of stillMissing) {
      const cacheKey = `${langCode}::${phrase}`;
      let finalTranslation = await translatePhraseGoogle(phrase, targetLang);
      if (!finalTranslation || finalTranslation === phrase) {
        finalTranslation = await translatePhrase(phrase, targetLang);
      }
      if (!finalTranslation || finalTranslation === phrase) continue;

      map[phrase] = finalTranslation;
      merged[phrase] = finalTranslation;
      cache[cacheKey] = finalTranslation;
      mapUpdated = true;
    }
  }

  if (mapUpdated) {
    mkdirSync(phraseMapsDir, { recursive: true });
    writeFileSync(mapPath, JSON.stringify(map, null, 2));
  }

  parentMaps[langCode] = merged;

  if (PRESERVE_LOCALE.has(langCode)) {
    console.log(`${langCode}: phrase map updated (preserved locale affiliateProgram)`);
    return;
  }

  const affiliateProgram = buildAffiliateProgramSection(locale.affiliateProgram, merged);
  writeLocaleFile(langCode, { ...locale, affiliateProgram });
  console.log(`${langCode}: updated affiliateProgram section`);
}

mkdirSync(phraseMapsDir, { recursive: true });

const phrases = collectPhrases();
const langs = langsOverride ?? listLocaleCodes();
const cache = loadCache();

console.log(`Syncing ${phrases.length} affiliateProgram phrases across ${langs.length} languages`);

const parentMaps = {};
for (const langCode of langs) {
  await syncLanguage(langCode, phrases, cache, parentMaps);
  saveCache(cache);
}
console.log('done');
