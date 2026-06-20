import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const phrases = JSON.parse(readFileSync(join(root, 'scripts/i18n-phrases.json'), 'utf8'));
const outDir = join(root, 'src/i18n/overrides');

const KEEP_AS_IS = new Set([
  '404',
  'FAQ',
  'OK',
  'ID',
  'CPA',
  'player@example.com',
  'TRC20, ERC20...',
  'TXyz...',
  'XXXX XXXX',
]);

function buildMap(translations, lang) {
  const map = {};
  const missing = [];
  const sameAsEnglish = [];
  const badPlaceholders = [];

  for (const phrase of phrases) {
    let value;
    if (KEEP_AS_IS.has(phrase)) {
      value = phrase;
    } else if (translations[phrase]) {
      value = translations[phrase];
    } else {
      missing.push(phrase);
      value = phrase;
    }
    map[phrase] = value;

    if (!KEEP_AS_IS.has(phrase) && value === phrase) {
      sameAsEnglish.push(phrase);
    }

    const enPh = [...phrase.matchAll(/\{\{[^}]+\}\}/g)].map((m) => m[0]).sort().join(',');
    const trPh = [...value.matchAll(/\{\{[^}]+\}\}/g)].map((m) => m[0]).sort().join(',');
    if (enPh !== trPh) badPlaceholders.push({ phrase, value });
  }

  if (missing.length) {
    console.error(`[${lang}] missing ${missing.length}:`, missing.slice(0, 5));
    process.exitCode = 1;
  }
  if (sameAsEnglish.length) {
    console.error(`[${lang}] untranslated ${sameAsEnglish.length}:`, sameAsEnglish.slice(0, 5));
    process.exitCode = 1;
  }
  if (badPlaceholders.length) {
    console.error(`[${lang}] bad placeholders:`, badPlaceholders.slice(0, 3));
    process.exitCode = 1;
  }

  return map;
}

function writeOverride(lang, map) {
  const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)));
  const out = join(outDir, `${lang}.json`);
  writeFileSync(out, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');
  const lines = readFileSync(out, 'utf8').split('\n').length;
  const translated = Object.entries(map).filter(([k, v]) => k !== v).length;
  console.log(`${lang}: wrote ${Object.keys(map).length} keys, ${translated} translated, ${lines} lines -> ${out}`);
}

for (const lang of ['vi', 'th', 'ms']) {
  const dataPath = join(import.meta.dirname, `override-data-${lang}.json`);
  if (!existsSync(dataPath)) {
    console.error(`Missing ${dataPath}`);
    process.exitCode = 1;
    continue;
  }
  const data = JSON.parse(readFileSync(dataPath, 'utf8'));
  writeOverride(lang, buildMap(data, lang));
}

if (!process.exitCode) console.log('done');
