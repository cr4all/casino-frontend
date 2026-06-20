import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'scripts/i18n-override-data');
const overridesDir = join(root, 'src/i18n/overrides');
const phrasesPath = join(root, 'scripts/i18n-phrases.json');

const LANGS = ['ro', 'sv', 'sw', 'hy', 'ka', 'km', 'lt', 'mn', 'zh-tw'];

const phrases = JSON.parse(readFileSync(phrasesPath, 'utf8'));
mkdirSync(overridesDir, { recursive: true });

for (const lang of LANGS) {
  const dataPath = join(dataDir, `${lang}.json`);
  if (!existsSync(dataPath)) {
    console.error(`missing data: ${dataPath}`);
    process.exitCode = 1;
    continue;
  }

  const translations = JSON.parse(readFileSync(dataPath, 'utf8'));
  if (translations.length !== phrases.length) {
    console.error(`${lang}: expected ${phrases.length} translations, got ${translations.length}`);
    process.exitCode = 1;
    continue;
  }

  const map = {};
  phrases.forEach((phrase, index) => {
    map[phrase] = translations[index];
  });

  writeFileSync(join(overridesDir, `${lang}.json`), `${JSON.stringify(map, null, 2)}\n`);
  const translated = translations.filter((t, i) => t !== phrases[i]).length;
  console.log(`${lang}: ${Object.keys(map).length} keys, ${translated} translated`);
}

console.log('done');
