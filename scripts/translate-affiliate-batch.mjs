import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';
import { applyPhraseMapToValues, mergePhraseMaps } from '../src/i18n/phraseMapUtils.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const phraseMapsDir = join(root, 'src/i18n/phraseMaps');
const localesDir = join(root, 'src/i18n/locales');
const overridesDir = join(root, 'src/i18n/overrides');

const TARGETS = { pa: 'pa', lb: 'lb', ga: 'ga' };
const EXPORT_NAMES = { 'pt-br': 'ptBr', 'zh-tw': 'zhTw' };

const phrases = [...new Set(Object.values(en.affiliate))];

async function googleTranslate(text, targetLang) {
  const { translate } = await import('@vitalets/google-translate-api');
  const result = await translate(text, { from: 'en', to: targetLang, requestOptions: { timeout: 10000 } });
  return result?.text?.trim() || null;
}

function writeLocaleFile(langCode, tree) {
  const exportName = EXPORT_NAMES[langCode] ?? langCode.replace(/-/g, '');
  writeFileSync(
    join(localesDir, `${langCode}.ts`),
    `import type { LocaleTree } from './en';\n\nexport const ${exportName}: LocaleTree = ${JSON.stringify(tree, null, 2)};\n`,
  );
}

async function run(langCode) {
  const target = TARGETS[langCode];
  const mapPath = join(phraseMapsDir, `${langCode}.json`);
  const map = existsSync(mapPath) ? JSON.parse(readFileSync(mapPath, 'utf8')) : {};
  const overrides = existsSync(join(overridesDir, `${langCode}.json`))
    ? JSON.parse(readFileSync(join(overridesDir, `${langCode}.json`), 'utf8'))
  : {};

  const pending = phrases.filter((phrase) => {
    const merged = mergePhraseMaps(map, overrides)[phrase];
    return !merged || merged === phrase;
  });

  console.log(`${langCode}: translating ${pending.length} affiliate phrases`);

  for (let i = 0; i < pending.length; i += 6) {
    const batch = pending.slice(i, i + 6);
    const translated = await Promise.all(batch.map((phrase) => googleTranslate(phrase, target)));
    batch.forEach((phrase, index) => {
      if (translated[index] && translated[index] !== phrase) {
        map[phrase] = translated[index];
      }
    });
    await new Promise((r) => setTimeout(r, 250));
  }

  writeFileSync(mapPath, JSON.stringify(map, null, 2));
  writeLocaleFile(langCode, applyPhraseMapToValues(en, mergePhraseMaps(map, overrides)));
  console.log(`${langCode}: done`);
}

for (const langCode of Object.keys(TARGETS)) {
  await run(langCode);
}

console.log('complete');
