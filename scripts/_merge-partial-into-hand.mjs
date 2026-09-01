#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';
import partial from './i18n-affiliate-program-manual-partial-rest.json' with { type: 'json' };

const dir = dirname(fileURLToPath(import.meta.url));
const handPath = join(dir, '_rest-translations-handwritten.mjs');
const hand = (await import('./_rest-translations-handwritten.mjs')).default;

const LANGS = [
  'lt', 'lv', 'bn', 'fa', 'ms', 'fil', 'sw', 'ta', 'te', 'ur', 'uz', 'ka', 'kk', 'az', 'hy', 'mn', 'ne', 'pa',
  'tg', 'yo', 'zu', 'ga', 'gu', 'ha', 'ig', 'lb', 'lo', 'ml', 'mr', 'mt', 'my', 'si', 'cy', 'is', 'km', 'kn',
];

for (const lang of LANGS) {
  if (!hand[lang]) hand[lang] = {};
  const base = partial[lang]?.affiliateProgram ?? {};
  for (const key of Object.keys(en.affiliateProgram)) {
    if (key === 'partnersEmail') continue;
    const english = en.affiliateProgram[key];
    const p = base[key];
    if (p && p !== english && !hand[lang][key]) hand[lang][key] = p;
  }
}

const body = `/** Hand-written professional affiliateProgram translations for incomplete rest languages. */\nexport default ${JSON.stringify(hand, null, 2)};\n`;
writeFileSync(handPath, body);
console.log('Updated handwritten from partial seeds');
