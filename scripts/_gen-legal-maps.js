import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const phrases = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'legal-phrases.json'), 'utf8')
);
const outDir = path.join(__dirname, '../src/content/legal/phraseMaps');

const langs = {
  kk: JSON.parse(fs.readFileSync(path.join(__dirname, '_legal-translations-kk.json'), 'utf8')),
  tg: JSON.parse(fs.readFileSync(path.join(__dirname, '_legal-translations-tg.json'), 'utf8')),
  uz: JSON.parse(fs.readFileSync(path.join(__dirname, '_legal-translations-uz.json'), 'utf8')),
};

for (const [lang, map] of Object.entries(langs)) {
  const missing = phrases.filter((p) => !map[p]);
  const extra = Object.keys(map).filter((k) => !phrases.includes(k));
  const sameAsEnglish = phrases.filter((p) => map[p] === p);
  if (missing.length) console.error(`${lang}: missing ${missing.length}`, missing.slice(0, 3));
  if (extra.length) console.error(`${lang}: extra keys`, extra);
  if (sameAsEnglish.length) console.error(`${lang}: same as English ${sameAsEnglish.length}`, sameAsEnglish);
  const ordered = {};
  for (const p of phrases) ordered[p] = map[p];
  fs.writeFileSync(path.join(outDir, `${lang}.json`), JSON.stringify(ordered, null, 2) + '\n');
  console.log(`${lang}: wrote ${phrases.length} entries, translated ${phrases.length - sameAsEnglish.length}`);
}
