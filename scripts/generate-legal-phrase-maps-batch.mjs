import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const phrases = JSON.parse(readFileSync(join(root, 'scripts/legal-phrases.json'), 'utf8'));
const outDir = join(root, 'src/content/legal/phraseMaps');

const LANG_TARGETS = {
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
  if (!response.ok) return text;
  const data = await response.json();
  return data?.responseData?.translatedText ?? text;
}

async function buildMap(langCode, targetLang) {
  const outPath = join(outDir, `${langCode}.json`);
  if (existsSync(outPath)) {
    console.log(`skip ${langCode}`);
    return;
  }

  const map = {};
  const concurrency = 4;
  for (let i = 0; i < phrases.length; i += concurrency) {
    const batch = phrases.slice(i, i + concurrency);
    const translated = await Promise.all(
      batch.map((phrase) => translatePhrase(phrase, targetLang)),
    );
    batch.forEach((phrase, index) => {
      map[phrase] = translated[index];
    });
    await new Promise((r) => setTimeout(r, 400));
  }

  writeFileSync(outPath, JSON.stringify(map, null, 2));
  console.log(`saved ${langCode}`);
}

mkdirSync(outDir, { recursive: true });

for (const [code, target] of Object.entries(LANG_TARGETS)) {
  await buildMap(code, target);
}

console.log('done');
