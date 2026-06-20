import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const phrases = JSON.parse(readFileSync(join(root, 'scripts/legal-phrases.json'), 'utf8'));
const dataDir = join(root, 'scripts/legal-translation-data');
const outDir = join(root, 'src/content/legal/phraseMaps');

mkdirSync(outDir, { recursive: true });

const summary = [];
for (const file of readdirSync(dataDir).filter((f) => f.endsWith('.json'))) {
  const lang = file.replace(/\.json$/, '');
  const values = JSON.parse(readFileSync(join(dataDir, file), 'utf8'));
  if (values.length !== phrases.length) {
    throw new Error(`${file}: expected ${phrases.length} values, got ${values.length}`);
  }
  const map = Object.fromEntries(phrases.map((key, i) => [key, values[i]]));
  writeFileSync(join(outDir, `${lang}.json`), `${JSON.stringify(map, null, 2)}\n`);
  const translated = Object.entries(map).filter(([k, v]) => k !== v).length;
  summary.push({ lang, keys: Object.keys(map).length, translated });
}

console.log('=== Summary ===');
for (const row of summary.sort((a, b) => a.lang.localeCompare(b.lang))) {
  console.log(`${row.lang}.json: ${row.keys} keys (${row.translated} translated)`);
}
