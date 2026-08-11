#!/usr/bin/env node
/**
 * Build i18n-rest-translations.mjs from partial-rest + professional overlays.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';
import partial from './i18n-affiliate-program-manual-partial-rest.json' with { type: 'json' };
import navAuth from './i18n-rest-nav-auth.json' with { type: 'json' };
import ruData from './i18n-affiliate-program-manual-partial-ja-zh-ru.json' with { type: 'json' };
import hrOverride from './_rest-affiliate-overrides.mjs';
import allLangs from './_rest-i18n-all-langs.mjs';

const dir = dirname(fileURLToPath(import.meta.url));
const outPath = join(dir, 'i18n-rest-translations.mjs');

const LANGS = [
  'bg', 'hr', 'sr', 'sl', 'el', 'et', 'lt', 'lv', 'mk', 'bn', 'fa', 'ms', 'fil', 'sw', 'ta', 'te', 'ur', 'uz',
  'ka', 'kk', 'az', 'be', 'hy', 'mn', 'ne', 'pa', 'tg', 'yo', 'zu', 'ga', 'gu', 'ha', 'ig', 'lb', 'lo', 'ml',
  'mr', 'mt', 'my', 'si', 'so', 'cy', 'is', 'km', 'kn', 'af', 'am', 'sq',
];

const ruAp = ruData.ru.affiliateProgram;

function fixCommon(ap) {
  const out = { ...ap };
  out.partnersEmail = 'partners@ibets24.com';
  if (out.ctaPortal && !out.ctaPortal.includes('Affiliate Portal')) {
    out.ctaPortal = 'Affiliate Portal Login';
  }
  return out;
}

const PRIORITY = {
  bg: () => allLangs.bg,
  hr: () => hrOverride.default.hr,
  sr: () => fixCommon(ruAp),
  mk: () => fixCommon(ruAp),
  be: () => fixCommon(ruAp),
};

const TRANSLATIONS = {};

for (const lang of LANGS) {
  const affiliateProgram = {};
  const priority = PRIORITY[lang]?.() ?? allLangs[lang] ?? null;
  const base = partial[lang]?.affiliateProgram ?? {};

  for (const key of Object.keys(en.affiliateProgram)) {
    if (key === 'partnersEmail') {
      affiliateProgram[key] = 'partners@ibets24.com';
      continue;
    }
    const english = en.affiliateProgram[key];
    affiliateProgram[key] =
      priority?.[key] ??
      (base[key] && base[key] !== english ? base[key] : english);
  }

  if (!priority && !allLangs[lang]) {
    Object.assign(affiliateProgram, fixCommon(base));
    affiliateProgram.partnersEmail = 'partners@ibets24.com';
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
console.log(`Wrote ${outPath} (${LANGS.length} langs, ${gaps} English affiliate keys)`);
