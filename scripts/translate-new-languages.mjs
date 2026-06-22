import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';
import { applyPhraseMapToValues } from '../src/i18n/phraseMapUtils.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src/i18n/locales');
const phraseMapsDir = join(root, 'src/i18n/phraseMaps');
const phrasesPath = join(root, 'scripts/i18n-phrases.json');

const NEW_LANGS = [
  ['ne', 'ne'], ['ta', 'ta'], ['te', 'te'], ['mr', 'mr'], ['gu', 'gu'], ['kn', 'kn'],
  ['ml', 'ml'], ['pa', 'pa'], ['si', 'si'], ['my', 'my'], ['lo', 'lo'], ['am', 'am'],
  ['so', 'so'], ['yo', 'yo'], ['ig', 'ig'], ['ha', 'ha'], ['zu', 'zu'], ['af', 'af'],
  ['is', 'is'], ['ga', 'ga'], ['cy', 'cy'], ['mt', 'mt'], ['lb', 'lb'],
];

async function translatePhrase(text, targetLang, attempt = 1) {
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text.slice(0, 500));
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
    const translated = data?.responseData?.translatedText?.trim();
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
  const filePath = join(localesDir, `${langCode}.ts`);
  const body = JSON.stringify(tree, null, 2);
  writeFileSync(
    filePath,
    `import type { LocaleTree } from './en';\n\nexport const ${langCode}: LocaleTree = ${body};\n`,
  );
}

async function translateLanguage(langCode, targetLang, phrases, force = false) {
  const mapPath = join(phraseMapsDir, `${langCode}.json`);
  let map = !force && existsSync(mapPath) ? JSON.parse(readFileSync(mapPath, 'utf8')) : {};
  let translatedCount = Object.entries(map).filter(([a, b]) => a !== b).length;

  if (!force && translatedCount > 200) {
    console.log(`${langCode}: reuse existing map (${translatedCount} phrases)`);
    writeLocaleFile(langCode, applyPhraseMapToValues(en, map));
    return translatedCount;
  }

  map = {};
  console.log(`${langCode}: translating ${phrases.length} phrases -> ${targetLang}`);

  for (let i = 0; i < phrases.length; i++) {
    const phrase = phrases[i];
    const translated = await translatePhrase(phrase, targetLang);
    map[phrase] = translated ?? phrase;
    if ((i + 1) % 25 === 0) {
      writeFileSync(mapPath, JSON.stringify(map, null, 2));
      translatedCount = Object.entries(map).filter(([a, b]) => a !== b).length;
      console.log(`  ${langCode}: ${i + 1}/${phrases.length} (${translatedCount} translated)`);
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  writeFileSync(mapPath, JSON.stringify(map, null, 2));
  translatedCount = Object.entries(map).filter(([a, b]) => a !== b).length;
  writeLocaleFile(langCode, applyPhraseMapToValues(en, map));
  console.log(`${langCode}: done (${translatedCount} translated phrases)`);
  return translatedCount;
}

mkdirSync(phraseMapsDir, { recursive: true });
const phrases = JSON.parse(readFileSync(phrasesPath, 'utf8'));
const force = process.argv.includes('--force');
const onlyArg = process.argv.slice(2).find((arg) => !arg.startsWith('--') && arg.includes(','));
const langs = onlyArg
  ? onlyArg.split(',').map((code) => [code.trim(), NEW_LANGS.find(([c]) => c === code.trim())?.[1] ?? code.trim()])
  : NEW_LANGS;

for (const [langCode, targetLang] of langs) {
  await translateLanguage(langCode, targetLang, phrases, force);
}

console.log('all done');
