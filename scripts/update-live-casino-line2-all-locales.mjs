import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src/i18n/locales');
const phraseMapsDir = join(root, 'src/i18n/phraseMaps');
const overridesDir = join(root, 'src/i18n/overrides');

const NEW_EN = 'UP TO {{percent}}% Cashback Bonus';
const LEGACY_KEYS = [
  '5% Cashback Bonus Every Tuesday',
  '5% Cashback Bonus Per Week',
  '5% cashback bonus per week',
  '5% Cashback Bonus',
];

/** All locales use the English template; {{percent}} is filled at runtime. */
const MANUAL = {
  en: NEW_EN,
};

const LANG_TARGETS = {
  af: 'af', am: 'am', ar: 'ar', 'ar-ma': 'ar', 'ar-dz': 'ar', 'ar-tn': 'ar', az: 'az', be: 'be', bg: 'bg',
  bn: 'bn', cs: 'cs', cy: 'cy', da: 'da', de: 'de', 'de-be': 'de', el: 'el', es: 'es', et: 'et', fa: 'fa',
  fi: 'fi', fil: 'tl', fr: 'fr', 'fr-be': 'fr', ga: 'ga', gu: 'gu', ha: 'ha', he: 'he', hi: 'hi', hr: 'hr',
  hu: 'hu', hy: 'hy', id: 'id', ig: 'ig', is: 'is', it: 'it', ja: 'ja', ka: 'ka', kk: 'kk', km: 'km', kn: 'kn',
  lb: 'lb', lo: 'lo', lt: 'lt', lv: 'lv', mk: 'mk', ml: 'ml', mn: 'mn', mr: 'mr', ms: 'ms', mt: 'mt', my: 'my',
  ne: 'ne', nl: 'nl', 'nl-be': 'nl', no: 'no', pa: 'pa', pl: 'pl', pt: 'pt', 'pt-br': 'pt', ro: 'ro', ru: 'ru',
  si: 'si', sk: 'sk', sl: 'sl', so: 'so', sq: 'sq', sr: 'sr', sv: 'sv', sw: 'sw', ta: 'ta', te: 'te', tg: 'tg',
  th: 'th', tr: 'tr', uk: 'uk', ur: 'ur', uz: 'uz', vi: 'vi', yo: 'yo', zh: 'zh-CN', 'zh-tw': 'zh-TW', zu: 'zu',
};

const GOOGLE_LOCALE_MAP = {
  'pt-br': 'pt', 'zh-tw': 'zh-TW', fil: 'tl', 'de-be': 'de', 'fr-be': 'fr', 'nl-be': 'nl',
  'ar-ma': 'ar', 'ar-dz': 'ar', 'ar-tn': 'ar',
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveTargetLang(langCode, targetLang) {
  return GOOGLE_LOCALE_MAP[langCode] ?? targetLang;
}

async function translatePhraseMemory(text, targetLang, attempt = 1) {
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text.slice(0, 500));
  url.searchParams.set('langpair', `en|${targetLang}`);

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (response.status === 429 && attempt <= 4) {
      await sleep(3000 * attempt);
      return translatePhraseMemory(text, targetLang, attempt + 1);
    }
    if (!response.ok) return null;
    const data = await response.json();
    const translated = data?.responseData?.translatedText;
    if (!translated || translated === text) return null;
    if (String(data?.responseDetails ?? '').includes('MYMEMORY WARNING')) return null;
    return translated;
  } catch {
    if (attempt <= 3) {
      await sleep(1500 * attempt);
      return translatePhraseMemory(text, targetLang, attempt + 1);
    }
    return null;
  }
}

async function translatePhraseLingva(text, targetLang, attempt = 1) {
  const url = `https://lingva.ml/api/v1/en/${targetLang}/${encodeURIComponent(text)}`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
    if (response.status === 429 && attempt <= 6) {
      await sleep(8000 * attempt);
      return translatePhraseLingva(text, targetLang, attempt + 1);
    }
    if (!response.ok) {
      if (attempt <= 3) {
        await sleep(2000 * attempt);
        return translatePhraseLingva(text, targetLang, attempt + 1);
      }
      return null;
    }
    const data = await response.json();
    const translated = data?.translation?.trim();
    if (!translated || translated === text) return null;
    return translated;
  } catch {
    if (attempt <= 3) {
      await sleep(2000 * attempt);
      return translatePhraseLingva(text, targetLang, attempt + 1);
    }
    return null;
  }
}

async function translateText(text, langCode, targetLang) {
  const resolvedTarget = resolveTargetLang(langCode, targetLang);
  const memory = await translatePhraseMemory(text, resolvedTarget);
  if (memory && memory !== text) return memory;
  const lingva = await translatePhraseLingva(text, resolvedTarget);
  if (lingva && lingva !== text) return lingva;
  return text;
}

function loadJson(path) {
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {};
}

function saveJson(path, data) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
}

function looksLikeCashbackTuesdayTranslation(text) {
  if (!text || text === NEW_EN) return false;
  if (/premium experience|premiumupplevelse|premium deneyim|프리미엄 경험|尊享体验|尊享體驗|trải nghiệm cao cấp|esperienza premium|experiência premium|experiență premium|doświadczenie premium|pengalaman premium|premium tajriba|премиум|преміальний досвід/i.test(text)) {
    return false;
  }
  if (/^bonuses?$/i.test(text.trim())) return false;

  const hasFivePercent = /5\s*%|5%|٥\s*%|۵\s*%/i.test(text);
  const hasCashback = /cashback|cash back|ke[sş]bek|кешбек|кэшбэк|返水|캐시백|キャッシュバック|rimborso|reembolso|reintegro|rückvergütung|geldrückgabe|hoàn tiền|geri ödeme|kurudishiwa|rebat|atmaksa|grąžinimo|endurgreiðslu|поврат|вяртанне|връщане|استرداد|بازگشت|החזר|नगद|पैसा|cashback/i.test(text);
  const hasTuesday = /tuesday|tues|火曜|화요일|martes|mardi|dienstag|martedì|martedi|salı|sali|вівторок|вторник|星期二|週二|terça|selasa|dimarts|úterý|utorok|torek|tirsdag|tiistai|úterý|utorok|tuesday|dinsdag|tisdag|wtorek|úterý|angalau|talata|utho|mgqibelo|labobedi|mardi|wtorek/i.test(text);

  return hasFivePercent && hasCashback && hasTuesday;
}

function pickExistingTranslation(langCode) {
  const override = loadJson(join(overridesDir, `${langCode}.json`));
  if (override[NEW_EN] && looksLikeCashbackTuesdayTranslation(override[NEW_EN])) return override[NEW_EN];

  const phraseMap = loadJson(join(phraseMapsDir, `${langCode}.json`));
  if (phraseMap[NEW_EN] && looksLikeCashbackTuesdayTranslation(phraseMap[NEW_EN])) return phraseMap[NEW_EN];

  return null;
}

function readLiveCasinoLine2(content) {
  const match = content.match(/"liveCasinoLine2"\s*:\s*"((?:\\.|[^"\\])*)"/);
  return match ? JSON.parse(`"${match[1]}"`) : null;
}

function needsUpdate(content) {
  const current = readLiveCasinoLine2(content);
  if (current == null) return true;
  return !looksLikeCashbackTuesdayTranslation(current);
}

function updateLiveCasinoLine2InLocaleFile(langCode, translation) {
  const filePath = join(localesDir, `${langCode}.ts`);
  const content = readFileSync(filePath, 'utf8');
  const escaped = JSON.stringify(translation).slice(1, -1);
  const pattern = /"liveCasinoLine2"\s*:\s*"(?:\\.|[^"\\])*"/;
  if (!pattern.test(content)) {
    throw new Error(`liveCasinoLine2 not found in ${langCode}.ts`);
  }
  const replaced = content.replace(pattern, `"liveCasinoLine2": "${escaped}"`);
  writeFileSync(filePath, replaced);
}

function updatePhraseArtifacts(langCode, translation) {
  const phraseMapPath = join(phraseMapsDir, `${langCode}.json`);
  const overridePath = join(overridesDir, `${langCode}.json`);
  const phraseMap = loadJson(phraseMapPath);
  const overrides = loadJson(overridePath);

  phraseMap[NEW_EN] = translation;
  overrides[NEW_EN] = translation;
  for (const legacyKey of LEGACY_KEYS) {
    delete phraseMap[legacyKey];
    delete overrides[legacyKey];
  }

  if (Object.keys(phraseMap).length > 0) saveJson(phraseMapPath, phraseMap);
  if (Object.keys(overrides).length > 0) saveJson(overridePath, overrides);
}

const langs = readdirSync(localesDir)
  .filter((file) => file.endsWith('.ts'))
  .map((file) => file.replace(/\.ts$/, ''))
  .filter((code) => code !== 'en')
  .sort();

console.log(`Updating liveCasinoLine2 for ${langs.length} locales...`);

for (const langCode of langs) {
  const filePath = join(localesDir, `${langCode}.ts`);
  const content = readFileSync(filePath, 'utf8');
  const shouldUpdate = needsUpdate(content);

  if (MANUAL[langCode]) {
    const translation = MANUAL[langCode];
    if (shouldUpdate) updateLiveCasinoLine2InLocaleFile(langCode, translation);
    updatePhraseArtifacts(langCode, translation);
    console.log(`${langCode}: manual${shouldUpdate ? '' : ' (already localized)'}`);
    continue;
  }

  if (!shouldUpdate) {
    updatePhraseArtifacts(langCode, readLiveCasinoLine2(content));
    console.log(`${langCode}: skip (already localized)`);
    continue;
  }

  let translation = pickExistingTranslation(langCode);
  if (!translation) {
    const targetLang = LANG_TARGETS[langCode] ?? langCode;
    console.log(`${langCode}: translating -> ${targetLang}`);
    translation = await translateText(NEW_EN, langCode, targetLang);
    await sleep(500);
  } else {
    console.log(`${langCode}: existing cashback translation`);
  }

  updateLiveCasinoLine2InLocaleFile(langCode, translation);
  updatePhraseArtifacts(langCode, translation);
}

console.log('done');
