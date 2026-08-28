#!/usr/bin/env node
/**
 * Write i18n-rest-translations.mjs — merges curated sources + nav/auth overlays.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';
import partial from './i18n-affiliate-program-manual-partial-rest.json' with { type: 'json' };
import navAuth from './i18n-rest-nav-auth.json' with { type: 'json' };
import ruData from './i18n-affiliate-program-manual-partial-ja-zh-ru.json' with { type: 'json' };
import esData from './i18n-affiliate-program-manual-partial-es-fr-it-pt.json' with { type: 'json' };
import hrOverride from './_rest-affiliate-overrides.mjs';
import allLangs from './_rest-i18n-all-langs.mjs';

const outPath = join(dirname(fileURLToPath(import.meta.url)), 'i18n-rest-translations.mjs');

const LANGS = [
  'bg', 'hr', 'sr', 'sl', 'el', 'et', 'lt', 'lv', 'mk', 'bn', 'fa', 'ms', 'fil', 'sw', 'ta', 'te', 'ur', 'uz',
  'ka', 'kk', 'az', 'be', 'hy', 'mn', 'ne', 'pa', 'tg', 'yo', 'zu', 'ga', 'gu', 'ha', 'ig', 'lb', 'lo', 'ml',
  'mr', 'mt', 'my', 'si', 'so', 'cy', 'is', 'km', 'kn', 'af', 'am', 'sq',
];

const ruAp = ruData.ru.affiliateProgram;
const esAp = esData.es.affiliateProgram;

function fixPortal(ap) {
  return { ...ap, ctaPortal: 'Affiliate Portal Login', partnersEmail: 'partners@ibets24.com' };
}

const SEEDED = {
  bg: allLangs.bg,
  hr: hrOverride.default.hr,
  sr: fixPortal({ ...ruAp }),
  mk: fixPortal({ ...ruAp }),
  be: fixPortal({ ...ruAp }),
  sl: fixPortal({ ...partial.sl.affiliateProgram }),
  af: fixPortal({ ...partial.af.affiliateProgram }),
  am: fixPortal({ ...partial.am.affiliateProgram }),
  so: fixPortal({ ...partial.so.affiliateProgram }),
  sq: fixPortal({ ...partial.sq.affiliateProgram }),
};

const TRANSLATIONS = {};

for (const lang of LANGS) {
  const affiliateProgram = {};
  const seed = SEEDED[lang] ?? allLangs[lang] ?? null;

  for (const key of Object.keys(en.affiliateProgram)) {
    if (key === 'partnersEmail') {
      affiliateProgram[key] = 'partners@ibets24.com';
      continue;
    }
    const english = en.affiliateProgram[key];
    affiliateProgram[key] =
      seed?.[key] ??
      (partial[lang]?.affiliateProgram?.[key] !== english ? partial[lang].affiliateProgram[key] : null) ??
      english;
  }

  TRANSLATIONS[lang] = {
    affiliateProgram,
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
console.log(`Wrote ${outPath}; ${gaps} English keys remain`);
