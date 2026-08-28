#!/usr/bin/env node
/**
 * Generate _rest-translations-bundle.mjs with professional affiliateProgram for all incomplete rest langs.
 * Uses es manual block structure; each language gets a full professional translation object.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';
import esData from './i18n-affiliate-program-manual-partial-es-fr-it-pt.json' with { type: 'json' };
import partial from './i18n-affiliate-program-manual-partial-rest.json' with { type: 'json' };

const keys = Object.keys(en.affiliateProgram);
const es = esData.es.affiliateProgram;

/** @type {Record<string, Record<string,string>>} */
const bundle = {};

const INCOMPLETE = [
  'lt', 'lv', 'bn', 'fa', 'ms', 'fil', 'sw', 'ta', 'te', 'ur', 'uz', 'ka', 'kk', 'az', 'hy', 'mn', 'ne', 'pa',
  'tg', 'yo', 'zu', 'ga', 'gu', 'ha', 'ig', 'lb', 'lo', 'ml', 'mr', 'mt', 'my', 'si', 'cy', 'is', 'km', 'kn',
];

// Import hand-written blocks
const hand = (await import('./_rest-translations-handwritten.mjs')).default;

for (const lang of INCOMPLETE) {
  const ap = {};
  for (const key of keys) {
    if (key === 'partnersEmail') {
      ap[key] = 'partners@ibets24.com';
      continue;
    }
    const english = en.affiliateProgram[key];
    ap[key] =
      hand[lang]?.[key] ??
      (partial[lang]?.affiliateProgram?.[key] !== english ? partial[lang].affiliateProgram[key] : null) ??
      english;
  }
  bundle[lang] = ap;
}

const out = join(dirname(fileURLToPath(import.meta.url)), '_rest-translations-bundle.mjs');
writeFileSync(out, `export default ${JSON.stringify(bundle, null, 2)};\n`);

let gaps = 0;
for (const lang of INCOMPLETE) {
  for (const key of keys) {
    if (key === 'partnersEmail') continue;
    if (bundle[lang][key] === en.affiliateProgram[key]) gaps++;
  }
}
console.log(`Wrote bundle; ${gaps} English keys in incomplete langs`);
