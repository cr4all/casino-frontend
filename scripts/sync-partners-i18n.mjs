#!/usr/bin/env node
/**
 * Sync Partners footer labels + /partners legal phrases across locales.
 *
 * Usage:
 *   node scripts/sync-partners-i18n.mjs
 *   node scripts/sync-partners-i18n.mjs --langs=de,fr,ja
 *   node scripts/sync-partners-i18n.mjs --force
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { legalEn } from '../src/content/legal/en.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src/i18n/locales');
const i18nMapsDir = join(root, 'src/i18n/phraseMaps');
const legalMapsDir = join(root, 'src/content/legal/phraseMaps');
const cachePath = join(root, 'scripts/i18n-partners-data.json');

const require = createRequire(join(root, 'package.json'));

const args = process.argv.slice(2);
const langsArg = args.find((a) => a.startsWith('--langs='));
const onlyLangs = langsArg
  ? langsArg
      .split('=')[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  : null;
const force = args.includes('--force');
const applyOnly = args.includes('--apply-only');

const FOOTER_EN = {
  partners: 'Partners',
  affiliateProgram: 'Affiliate Program',
  becomePartner: 'Become a Partner',
};

function collectLegalPhrases(node, out = new Set()) {
  if (typeof node === 'string') {
    out.add(node);
    return out;
  }
  if (Array.isArray(node)) {
    for (const item of node) collectLegalPhrases(item, out);
    return out;
  }
  if (node && typeof node === 'object') {
    for (const value of Object.values(node)) collectLegalPhrases(value, out);
  }
  return out;
}

const LEGAL_PHRASES = [...collectLegalPhrases(legalEn.partners)];
const ALL_PHRASES = [...new Set([...Object.values(FOOTER_EN), ...LEGAL_PHRASES])];

const KEEP_PARTIAL = [
  'iBets24',
  'partners@ibets24.com',
  'support@ibets24.com',
  'Affiliate Portal',
  'B2B',
];

const MYMEMORY_LANG = {
  af: 'af',
  am: 'am',
  ar: 'ar',
  'ar-dz': 'ar',
  'ar-ma': 'ar',
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

const VARIANT_PARENT = {
  'ar-dz': 'ar',
  'ar-ma': 'ar',
  'ar-tn': 'ar',
  'de-be': 'de',
  'fr-be': 'fr',
  'nl-be': 'nl',
};

const MANUAL_FOOTER = {
  ko: { partners: '파트너', affiliateProgram: '제휴 프로그램', becomePartner: '파트너 되기' },
  de: { partners: 'Partner', affiliateProgram: 'Partnerprogramm', becomePartner: 'Partner werden' },
  es: { partners: 'Partners', affiliateProgram: 'Programa de afiliados', becomePartner: 'Hazte partner' },
  fr: { partners: 'Partenaires', affiliateProgram: "Programme d'affiliation", becomePartner: 'Devenir partenaire' },
  it: { partners: 'Partner', affiliateProgram: 'Programma affiliati', becomePartner: 'Diventa partner' },
  pt: { partners: 'Parceiros', affiliateProgram: 'Programa de afiliados', becomePartner: 'Torne-se parceiro' },
  'pt-br': { partners: 'Parceiros', affiliateProgram: 'Programa de afiliados', becomePartner: 'Seja um parceiro' },
  ar: { partners: 'الشركاء', affiliateProgram: 'برنامج الشركاء', becomePartner: 'كن شريكاً' },
  tr: { partners: 'Ortaklar', affiliateProgram: 'Ortaklık Programı', becomePartner: 'Ortak Olun' },
  ja: { partners: 'パートナー', affiliateProgram: 'アフィリエイトプログラム', becomePartner: 'パートナーになる' },
  zh: { partners: '合作伙伴', affiliateProgram: '联盟计划', becomePartner: '成为合作伙伴' },
  'zh-tw': { partners: '合作夥伴', affiliateProgram: '聯盟計畫', becomePartner: '成為合作夥伴' },
  ru: { partners: 'Партнёры', affiliateProgram: 'Партнёрская программа', becomePartner: 'Стать партнёром' },
  nl: { partners: 'Partners', affiliateProgram: 'Affiliateprogramma', becomePartner: 'Word partner' },
  pl: { partners: 'Partnerzy', affiliateProgram: 'Program partnerski', becomePartner: 'Zostań partnerem' },
  sq: { partners: 'Partnerët', affiliateProgram: 'Programi i afiliatëve', becomePartner: 'Bëhu partner' },
  da: { partners: 'Partnere', affiliateProgram: 'Affiliateprogram', becomePartner: 'Bliv partner' },
  fi: { partners: 'Kumppanit', affiliateProgram: 'Affiliate-ohjelma', becomePartner: 'Ryhdy kumppaniksi' },
  sv: { partners: 'Partners', affiliateProgram: 'Affiliateprogram', becomePartner: 'Bli partner' },
  no: { partners: 'Partnere', affiliateProgram: 'Affiliateprogram', becomePartner: 'Bli partner' },
  cs: { partners: 'Partneři', affiliateProgram: 'Partnerský program', becomePartner: 'Staňte se partnerem' },
  sk: { partners: 'Partneri', affiliateProgram: 'Partnerský program', becomePartner: 'Staňte sa partnerom' },
  hu: { partners: 'Partnerek', affiliateProgram: 'Partnerprogram', becomePartner: 'Legyen partner' },
  ro: { partners: 'Parteneri', affiliateProgram: 'Program de afiliere', becomePartner: 'Devino partener' },
  bg: { partners: 'Партньори', affiliateProgram: 'Партньорска програма', becomePartner: 'Станете партньор' },
  uk: { partners: 'Партнери', affiliateProgram: 'Партнерська програма', becomePartner: 'Стати партнером' },
  el: { partners: 'Συνεργάτες', affiliateProgram: 'Πρόγραμμα συνεργατών', becomePartner: 'Γίνετε συνεργάτης' },
  hr: { partners: 'Partneri', affiliateProgram: 'Partnerski program', becomePartner: 'Postanite partner' },
  sr: { partners: 'Partneri', affiliateProgram: 'Partnerski program', becomePartner: 'Postanite partner' },
  sl: { partners: 'Partnerji', affiliateProgram: 'Partnerski program', becomePartner: 'Postanite partner' },
  id: { partners: 'Mitra', affiliateProgram: 'Program afiliasi', becomePartner: 'Jadi mitra' },
  vi: { partners: 'Đối tác', affiliateProgram: 'Chương trình liên kết', becomePartner: 'Trở thành đối tác' },
  th: { partners: 'พาร์ทเนอร์', affiliateProgram: 'โปรแกรมพันธมิตร', becomePartner: 'เป็นพาร์ทเนอร์' },
  hi: { partners: 'पार्टनर', affiliateProgram: 'Affiliate Program', becomePartner: 'पार्टनर बनें' },
  he: { partners: 'שותפים', affiliateProgram: 'תוכנית שותפים', becomePartner: 'הפוך לשותף' },
  fa: { partners: 'شرکا', affiliateProgram: 'برنامه همکاری', becomePartner: 'شریک شوید' },
  ur: { partners: 'پارٹنرز', affiliateProgram: 'افیلیئٹ پروگرام', becomePartner: 'پارٹنر بنیں' },
  ms: { partners: 'Rakan kongsi', affiliateProgram: 'Program afiliasi', becomePartner: 'Jadi rakan kongsi' },
  fil: { partners: 'Mga Partner', affiliateProgram: 'Affiliate Program', becomePartner: 'Maging Partner' },
  lt: { partners: 'Partneriai', affiliateProgram: 'Partnerių programa', becomePartner: 'Tapkite partneriu' },
  lv: { partners: 'Partneri', affiliateProgram: 'Partneru programma', becomePartner: 'Kļūstiet par partneri' },
  et: { partners: 'Partnerid', affiliateProgram: 'Partnerlusprogramm', becomePartner: 'Saa partneriks' },
  mk: { partners: 'Партнери', affiliateProgram: 'Партнерска програма', becomePartner: 'Станете партнер' },
  az: { partners: 'Tərəfdaşlar', affiliateProgram: 'Tərəfdaşlıq proqramı', becomePartner: 'Tərəfdaş olun' },
  ka: { partners: 'პარტნიორები', affiliateProgram: 'პარტნიორული პროგრამა', becomePartner: 'გახდი პარტნიორი' },
  kk: { partners: 'Серіктестер', affiliateProgram: 'Серіктестік бағдарламасы', becomePartner: 'Серіктес болыңыз' },
  uz: { partners: 'Hamkorlar', affiliateProgram: 'Hamkorlik dasturi', becomePartner: 'Hamkor bo‘ling' },
  bn: { partners: 'পার্টনার', affiliateProgram: 'অ্যাফিলিয়েট প্রোগ্রাম', becomePartner: 'পার্টনার হোন' },
};

let googleTranslate = null;
function getGoogleTranslate() {
  if (!googleTranslate) {
    googleTranslate = require('@vitalets/google-translate-api').translate;
  }
  return googleTranslate;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function protectText(text) {
  const tokens = [];
  let protectedText = text;
  for (const value of KEEP_PARTIAL) {
    let idx;
    while ((idx = protectedText.indexOf(value)) !== -1) {
      const token = `__KP_${tokens.length}__`;
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

async function translateMyMemory(text, targetLang, attempt = 0) {
  const { protectedText, tokens } = protectText(text);
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', protectedText.slice(0, 450));
  url.searchParams.set('langpair', `en|${targetLang}`);

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const status = data?.responseStatus;
    if ((status === 429 || status === 403) && attempt < 3) {
      await sleep(1200 * (attempt + 1));
      return translateMyMemory(text, targetLang, attempt + 1);
    }
    const translated = restoreText(String(data?.responseData?.translatedText ?? text).trim(), tokens);
    return translated || text;
  } catch (err) {
    if (attempt < 2) {
      await sleep(800 * (attempt + 1));
      return translateMyMemory(text, targetLang, attempt + 1);
    }
    return text;
  }
}

async function translateGoogle(text, code) {
  const target = MYMEMORY_LANG[code] ?? code;
  const { protectedText, tokens } = protectText(text);
  try {
    const result = await Promise.race([
      getGoogleTranslate()(protectedText, {
        from: 'en',
        to: target === 'zh-CN' ? 'zh-CN' : target === 'zh-TW' ? 'zh-TW' : target,
        requestOptions: { timeout: 8000 },
      }),
      sleep(9000).then(() => null),
    ]);
    if (!result) return text;
    return restoreText(String(result?.text ?? '').trim(), tokens) || text;
  } catch {
    return text;
  }
}

async function translatePhrase(text, code) {
  const target = MYMEMORY_LANG[code] ?? code;
  let translated = await translateGoogle(text, code);
  if (!translated || translated === text) {
    translated = await translateMyMemory(text, target);
  }
  return translated || text;
}

function loadCache() {
  if (!existsSync(cachePath)) return {};
  return JSON.parse(readFileSync(cachePath, 'utf8'));
}

function saveCache(cache) {
  writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
}

function listLocaleCodes() {
  return readdirSync(localesDir)
    .filter((name) => name.endsWith('.ts') && name !== 'en.ts')
    .map((name) => name.replace(/\.ts$/, ''));
}

function listLegalMapCodes() {
  return readdirSync(legalMapsDir)
    .filter((name) => name.endsWith('.json') && name !== 'ko.json')
    .map((name) => name.replace(/\.json$/, ''));
}

function escapeDouble(value) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function escapeSingle(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function patchFooterInLocaleFile(langCode, footer) {
  const filePath = join(localesDir, `${langCode}.ts`);
  let content = readFileSync(filePath, 'utf8');
  const missing = [];

  for (const [key, value] of Object.entries(footer)) {
    const doubleQuoted = new RegExp(`("${key}"\\s*:\\s*")(?:\\\\.|[^"\\\\])*(")`);
    const singleQuoted = new RegExp(`(${key}\\s*:\\s*')(?:\\\\.|[^'\\\\])*(')`);

    if (doubleQuoted.test(content)) {
      content = content.replace(doubleQuoted, `$1${escapeDouble(value)}$2`);
      continue;
    }
    if (singleQuoted.test(content)) {
      content = content.replace(singleQuoted, `$1${escapeSingle(value)}$2`);
      continue;
    }
    missing.push(key);
  }

  if (missing.length > 0) {
    const useDouble = /"legal"\s*:/.test(content);
    const block = missing
      .map((key) =>
        useDouble
          ? `    "${key}": "${escapeDouble(footer[key])}",`
          : `    ${key}: '${escapeSingle(footer[key])}',`,
      )
      .join('\n');

    if (useDouble) {
      content = content.replace(/([ \t]*)("legal"\s*:)/, `${block}\n$1$2`);
    } else if (/legal\s*:/.test(content)) {
      content = content.replace(/([ \t]*)(legal\s*:)/, `${block}\n$1$2`);
    } else {
      console.warn(`skip insert ${langCode}: no legal anchor`);
    }
  }

  writeFileSync(filePath, content);
}

function upsertPhraseMap(filePath, phrases) {
  const map = existsSync(filePath) ? JSON.parse(readFileSync(filePath, 'utf8')) : {};
  let changed = 0;
  for (const [english, localized] of Object.entries(phrases)) {
    if (!english || !localized) continue;
    if (!force && map[english] && map[english] !== english) continue;
    if (map[english] === localized) continue;
    map[english] = localized;
    changed += 1;
  }
  writeFileSync(filePath, `${JSON.stringify(map, null, 2)}\n`);
  return changed;
}

function isUsableTranslation(english, localized) {
  if (!localized) return false;
  // Reject broken cache entries that stored key names as values.
  if (localized === 'partners' || localized === 'affiliateProgram' || localized === 'becomePartner') {
    return false;
  }
  // Long legal sentences left in English usually mean failed MT.
  if (localized === english && english.length > 40) return false;
  return true;
}

function cacheCoverage(bundle) {
  if (!bundle) return 0;
  return ALL_PHRASES.filter((p) => isUsableTranslation(p, bundle[p])).length;
}

async function translatePhraseList(phrases, code) {
  const resolved = {};
  const concurrency = 6;
  for (let i = 0; i < phrases.length; i += concurrency) {
    const batch = phrases.slice(i, i + concurrency);
    const translated = await Promise.all(batch.map((phrase) => translatePhrase(phrase, code)));
    batch.forEach((phrase, index) => {
      resolved[phrase] = translated[index];
    });
    await sleep(200);
  }
  return resolved;
}

async function resolvePhraseBundle(langCode, cache) {
  const parent = VARIANT_PARENT[langCode];
  if (parent && cache[parent] && cacheCoverage(cache[parent]) >= ALL_PHRASES.length - 2) {
    const inherited = { ...cache[parent] };
    const manual = MANUAL_FOOTER[langCode] ?? MANUAL_FOOTER[parent];
    if (manual) {
      for (const [key, value] of Object.entries(manual)) {
        inherited[FOOTER_EN[key]] = value;
      }
    }
    cache[langCode] = inherited;
    saveCache(cache);
    return inherited;
  }

  const cached = cache[langCode];
  const coverage = cacheCoverage(cached);
  if (applyOnly) {
    const base = { ...(cached ?? {}) };
    const manual = MANUAL_FOOTER[langCode] ?? (parent ? MANUAL_FOOTER[parent] : null);
    if (manual) {
      for (const [key, value] of Object.entries(manual)) {
        base[FOOTER_EN[key]] = value;
      }
    }
    // Fill gaps with English so files still get keys.
    for (const phrase of ALL_PHRASES) {
      if (!base[phrase]) base[phrase] = phrase;
    }
    return base;
  }

  if (!force && coverage >= ALL_PHRASES.length - 2) {
    return cached;
  }

  const missing = ALL_PHRASES.filter((p) => !isUsableTranslation(p, cached?.[p]));
  const base = { ...(cached ?? {}) };
  if (missing.length > 0) {
    const fresh = await translatePhraseList(missing, langCode);
    Object.assign(base, fresh);
  }

  const manual = MANUAL_FOOTER[langCode] ?? (parent ? MANUAL_FOOTER[parent] : null);
  if (manual) {
    for (const [key, value] of Object.entries(manual)) {
      base[FOOTER_EN[key]] = value;
    }
  }

  cache[langCode] = base;
  saveCache(cache);
  return base;
}

function footerFromResolved(resolved) {
  return {
    partners: resolved[FOOTER_EN.partners] ?? FOOTER_EN.partners,
    affiliateProgram: resolved[FOOTER_EN.affiliateProgram] ?? FOOTER_EN.affiliateProgram,
    becomePartner: resolved[FOOTER_EN.becomePartner] ?? FOOTER_EN.becomePartner,
  };
}

async function main() {
  // Drop broken cache from previous run (key-name values / empty long phrases).
  const cache = loadCache();
  for (const [code, bundle] of Object.entries(cache)) {
    if (cacheCoverage(bundle) < 3) delete cache[code];
  }

  // Seed curated footer labels into cache immediately.
  for (const [code, footer] of Object.entries(MANUAL_FOOTER)) {
    cache[code] = { ...(cache[code] ?? {}) };
    for (const [key, value] of Object.entries(footer)) {
      cache[code][FOOTER_EN[key]] = value;
    }
  }
  saveCache(cache);

  const localeCodes = listLocaleCodes().filter((code) => !onlyLangs || onlyLangs.includes(code));
  const legalCodes = listLegalMapCodes().filter((code) => !onlyLangs || onlyLangs.includes(code));
  const allCodes = [...new Set([...localeCodes, ...legalCodes])];

  console.log(`phrases: ${ALL_PHRASES.length} unique`);
  console.log(`languages: ${allCodes.length}`);

  for (const code of allCodes) {
    const resolved = await resolvePhraseBundle(code, cache);
    const footer = footerFromResolved(resolved);

    if (localeCodes.includes(code)) {
      patchFooterInLocaleFile(code, footer);
    }

    const i18nMapPath = join(i18nMapsDir, `${code}.json`);
    if (existsSync(i18nMapPath) || localeCodes.includes(code)) {
      upsertPhraseMap(i18nMapPath, {
        [FOOTER_EN.partners]: footer.partners,
        [FOOTER_EN.affiliateProgram]: footer.affiliateProgram,
        [FOOTER_EN.becomePartner]: footer.becomePartner,
      });
    }

    if (legalCodes.includes(code)) {
      const legalPairs = Object.fromEntries(LEGAL_PHRASES.map((p) => [p, resolved[p] ?? p]));
      const changed = upsertPhraseMap(join(legalMapsDir, `${code}.json`), legalPairs);
      console.log(`${code}: footer=${footer.partners} | legal +${changed}`);
    } else {
      console.log(`${code}: footer=${footer.partners}`);
    }
  }

  console.log('done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
