#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';
import { applyPhraseMapToValues } from '../src/i18n/phraseMapUtils.ts';
import partial from './i18n-affiliate-program-manual-partial-rest.json' with { type: 'json' };
import navAuth from './i18n-rest-nav-auth.json' with { type: 'json' };
import ruData from './i18n-affiliate-program-manual-partial-ja-zh-ru.json' with { type: 'json' };
import allLangs from './_rest-i18n-all-langs.mjs';
import hand from './_rest-translations-handwritten.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = dirname(fileURLToPath(import.meta.url));
const langsDir = join(dir, 'rest-i18n-langs');
const outPath = join(dir, 'i18n-rest-translations.mjs');
const LANGS = [
  'bg', 'hr', 'sr', 'sl', 'el', 'et', 'lt', 'lv', 'mk', 'bn', 'fa', 'ms', 'fil', 'sw', 'ta', 'te', 'ur', 'uz',
  'ka', 'kk', 'az', 'be', 'hy', 'mn', 'ne', 'pa', 'tg', 'yo', 'zu', 'ga', 'gu', 'ha', 'ig', 'lb', 'lo', 'ml',
  'mr', 'mt', 'my', 'si', 'so', 'cy', 'is', 'km', 'kn', 'af', 'am', 'sq',
];
const ruAp = ruData.ru.affiliateProgram;
const CYRILLIC_RU = new Set(['sr', 'mk', 'be', 'tg']);

function loadMap(lang) {
  const p = join(root, 'src/i18n/phraseMaps', `${lang}.json`);
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {};
}

function loadLangFile(lang) {
  const p = join(langsDir, `${lang}.json`);
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
}

function fix(ap) {
  const o = { ...ap };
  o.partnersEmail = 'partners@ibets24.com';
  if (!String(o.ctaPortal || '').includes('Affiliate Portal Login')) o.ctaPortal = 'Affiliate Portal Login';
  return o;
}

function mergeAffiliate(lang) {
  const phraseLocalized = applyPhraseMapToValues(en.affiliateProgram, loadMap(lang));
  const base = partial[lang]?.affiliateProgram ?? {};
  const langFile = loadLangFile(lang);
  const out = {};

  for (const key of Object.keys(en.affiliateProgram)) {
    if (key === 'partnersEmail') {
      out[key] = 'partners@ibets24.com';
      continue;
    }
    const english = en.affiliateProgram[key];
    const candidates = [
      allLangs[lang]?.[key],
      hand[lang]?.[key],
      langFile?.[key],
      CYRILLIC_RU.has(lang) ? ruAp[key] : null,
      base[key],
      phraseLocalized[key],
    ];
    const picked = candidates.find((v) => v && v !== english);
    out[key] = picked ?? english;
  }
  return fix(out);
}

const TRANSLATIONS = {};
for (const lang of LANGS) {
  TRANSLATIONS[lang] = {
    affiliateProgram: mergeAffiliate(lang),
    nav: { ...navAuth[lang].nav },
    auth: { ...navAuth[lang].auth },
  };
}

writeFileSync(outPath, `const TRANSLATIONS = ${JSON.stringify(TRANSLATIONS, null, 2)};\n\nexport default { TRANSLATIONS };\n`);

let gaps = 0;
for (const lang of LANGS) {
  for (const key of Object.keys(en.affiliateProgram)) {
    if (key === 'partnersEmail') continue;
    if (TRANSLATIONS[lang].affiliateProgram[key] === en.affiliateProgram[key]) gaps++;
  }
}
console.log(`Wrote ${outPath}; ${gaps} English affiliate keys`);
