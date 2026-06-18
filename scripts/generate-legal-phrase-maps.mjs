import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const phrasesPath = join(root, 'scripts/legal-phrases.json');
const phrases = JSON.parse(readFileSync(phrasesPath, 'utf8'));
const outDir = join(root, 'src/content/legal/phraseMaps');

const LANG_TARGETS = {
  ar: 'ar',
  cs: 'cs',
  da: 'da',
  de: 'de',
  el: 'el',
  es: 'es',
  et: 'et',
  fi: 'fi',
  fil: 'tl',
  fr: 'fr',
  hi: 'hi',
  hr: 'hr',
  hu: 'hu',
  id: 'id',
  it: 'it',
  ja: 'ja',
  lv: 'lv',
  mk: 'mk',
  no: 'no',
  pl: 'pl',
  pt: 'pt',
  'pt-br': 'pt',
  ru: 'ru',
  sk: 'sk',
  sl: 'sl',
  sq: 'sq',
  sr: 'sr',
  tr: 'tr',
  ur: 'ur',
  zh: 'zh-CN',
};

async function translatePhrase(text, targetLang) {
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text.slice(0, 500));
  url.searchParams.set('langpair', `en|${targetLang}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  const translated = data?.responseData?.translatedText;
  if (!translated || translated === text) {
    return text;
  }
  return translated;
}

async function buildMap(langCode, targetLang) {
  const outPath = join(outDir, `${langCode}.json`);
  if (existsSync(outPath)) {
    console.log(`skip ${langCode} (exists)`);
    return;
  }

  const map = {};
  for (const phrase of phrases) {
    try {
      map[phrase] = await translatePhrase(phrase, targetLang);
    } catch {
      map[phrase] = phrase;
    }
    await new Promise((r) => setTimeout(r, 350));
  }

  writeFileSync(outPath, JSON.stringify(map, null, 2));
  console.log(`saved ${langCode}: ${Object.keys(map).length} phrases`);
}

mkdirSync(outDir, { recursive: true });

const lang = process.argv[2];
if (lang) {
  await buildMap(lang, LANG_TARGETS[lang] ?? lang);
} else {
  for (const [code, target] of Object.entries(LANG_TARGETS)) {
    await buildMap(code, target);
  }
}
