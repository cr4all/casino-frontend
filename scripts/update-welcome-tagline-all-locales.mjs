import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src/i18n/locales');
const phraseMapsDir = join(root, 'src/i18n/phraseMaps');
const overridesDir = join(root, 'src/i18n/overrides');

const NEW_EN = "The World's Largest Sportsbook & Online Casino";
const LEGACY_SPORTS_KEY = "The world's largest sportsbook and online casino";
const LEGACY_CASINO_KEY = "The world's largest online casino and slot";

const MANUAL = {
  en: NEW_EN,
  ko: '세계 최대 규모의 스포츠북 & 온라인 카지노',
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

function looksLikeSportsbookTranslation(text) {
  if (!text || text === NEW_EN) return false;
  if (/online casino and slot|casino online e slots|casino en ligne et de machines|casino und slot|casino y tragamonedas|casino e slot|casino og spilleautomater|casino og slot|casino a slot|casino și slot|казино и слот|casino và slot|casino at slot|casino ja slot|kasino ja slot|老虎机|สล็อต|tragamonedas|spilleautomater|slot lớn|slot platformu|sloty na|slots do mundo/i.test(text)) {
    return false;
  }
  return /sportsbook|sport|pari|apuesta|scommess|ставк|букмек|스포츠|体育|スポーツ|thể thao|wetten|spiel|apostas|bahis|weddenschap|sportboek|buku sukan|sportsbok|zakład|vedonly|kihlve|idman|kitabu|Στοίχημα|رياضي|博彩|apostas desportivas|paris sportifs|apuestas deportivas|sportweddenschappen|urheiluvedonly|spordikihlve|شرط بندی|idman mərc|kitabu cha|weddenschap|totó|sázk|kladionica|букмекер|спортивн|lažyb|michezo|weddenschap/i.test(text);
}

function looksLocalizedSportsbookTagline(text) {
  return looksLikeSportsbookTranslation(text);
}

function pickExistingTranslation(langCode) {
  const override = loadJson(join(overridesDir, `${langCode}.json`));
  if (override[NEW_EN] && looksLikeSportsbookTranslation(override[NEW_EN])) return override[NEW_EN];
  if (override[LEGACY_SPORTS_KEY] && looksLikeSportsbookTranslation(override[LEGACY_SPORTS_KEY])) {
    return override[LEGACY_SPORTS_KEY];
  }

  const phraseMap = loadJson(join(phraseMapsDir, `${langCode}.json`));
  if (phraseMap[NEW_EN] && looksLikeSportsbookTranslation(phraseMap[NEW_EN])) return phraseMap[NEW_EN];
  if (phraseMap[LEGACY_SPORTS_KEY] && looksLikeSportsbookTranslation(phraseMap[LEGACY_SPORTS_KEY])) {
    return phraseMap[LEGACY_SPORTS_KEY];
  }

  return null;
}

function readWelcomeTagline(content) {
  const match = content.match(/"welcomeTagline"\s*:\s*"((?:\\.|[^"\\])*)"/);
  return match ? JSON.parse(`"${match[1]}"`) : null;
}

function needsUpdate(content) {
  const current = readWelcomeTagline(content);
  if (current == null) return true;
  return !looksLocalizedSportsbookTagline(current);
}

function updateWelcomeTaglineInLocaleFile(langCode, translation) {
  const filePath = join(localesDir, `${langCode}.ts`);
  const content = readFileSync(filePath, 'utf8');
  const escaped = JSON.stringify(translation).slice(1, -1);
  const pattern = /"welcomeTagline"\s*:\s*"(?:\\.|[^"\\])*"/;
  if (!pattern.test(content)) {
    throw new Error(`welcomeTagline not found in ${langCode}.ts`);
  }
  const replaced = content.replace(pattern, `"welcomeTagline": "${escaped}"`);
  writeFileSync(filePath, replaced);
}

function updatePhraseArtifacts(langCode, translation) {
  const phraseMapPath = join(phraseMapsDir, `${langCode}.json`);
  const overridePath = join(overridesDir, `${langCode}.json`);
  const phraseMap = loadJson(phraseMapPath);
  const overrides = loadJson(overridePath);

  phraseMap[NEW_EN] = translation;
  overrides[NEW_EN] = translation;
  delete phraseMap[LEGACY_CASINO_KEY];
  delete phraseMap[LEGACY_SPORTS_KEY];
  delete overrides[LEGACY_CASINO_KEY];
  delete overrides[LEGACY_SPORTS_KEY];

  if (Object.keys(phraseMap).length > 0) saveJson(phraseMapPath, phraseMap);
  if (Object.keys(overrides).length > 0) saveJson(overridePath, overrides);
}

const langs = readdirSync(localesDir)
  .filter((file) => file.endsWith('.ts'))
  .map((file) => file.replace(/\.ts$/, ''))
  .filter((code) => code !== 'en')
  .sort();

console.log(`Updating welcome tagline for ${langs.length} locales...`);

for (const langCode of langs) {
  const filePath = join(localesDir, `${langCode}.ts`);
  const content = readFileSync(filePath, 'utf8');
  const shouldUpdate = needsUpdate(content);

  if (MANUAL[langCode]) {
    const translation = MANUAL[langCode];
    if (shouldUpdate) updateWelcomeTaglineInLocaleFile(langCode, translation);
    updatePhraseArtifacts(langCode, translation);
    console.log(`${langCode}: manual${shouldUpdate ? '' : ' (already localized)'}`);
    continue;
  }

  if (!shouldUpdate) {
    updatePhraseArtifacts(langCode, readWelcomeTagline(content));
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
    console.log(`${langCode}: existing sportsbook translation`);
  }

  updateWelcomeTaglineInLocaleFile(langCode, translation);
  updatePhraseArtifacts(langCode, translation);
}

console.log('done');
