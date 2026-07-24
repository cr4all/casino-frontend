import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cache = JSON.parse(readFileSync(join(root, 'scripts/i18n-partners-data.json'), 'utf8'));
const locales = readdirSync(join(root, 'src/i18n/locales'))
  .filter((f) => f.endsWith('.ts') && f !== 'en.ts')
  .map((f) => f.replace(/\.ts$/, ''));
const legal = readdirSync(join(root, 'src/content/legal/phraseMaps'))
  .filter((f) => f.endsWith('.json') && f !== 'ko.json')
  .map((f) => f.replace(/\.json$/, ''));

const missingCache = locales.filter((c) => !cache[c]);
let footerMissing = 0;
const footerStillEnglish = [];
for (const code of locales) {
  const text = readFileSync(join(root, 'src/i18n/locales', `${code}.ts`), 'utf8');
  if (!/"partners"\s*:/.test(text) && !/partners\s*:/.test(text)) footerMissing += 1;
  const m = text.match(/"affiliateProgram"\s*:\s*"([^"]+)"/);
  if (m?.[1] === 'Affiliate Program') footerStillEnglish.push(code);
}

let legalMissing = 0;
let legalStillEnglish = 0;
const sample = 'Business Partnerships';
for (const code of legal) {
  const map = JSON.parse(readFileSync(join(root, 'src/content/legal/phraseMaps', `${code}.json`), 'utf8'));
  if (!map[sample]) legalMissing += 1;
  else if (map[sample] === sample) legalStillEnglish += 1;
}

console.log({
  locales: locales.length,
  cached: Object.keys(cache).length,
  missingCache,
  footerMissing,
  footerStillEnglishCount: footerStillEnglish.length,
  footerStillEnglish: footerStillEnglish.slice(0, 20),
  legalMissing,
  legalStillEnglish,
});
console.log('de:', JSON.parse(readFileSync(join(root, 'src/content/legal/phraseMaps/de.json'), 'utf8'))[sample]);
console.log('ja:', JSON.parse(readFileSync(join(root, 'src/content/legal/phraseMaps/ja.json'), 'utf8'))[sample]);
