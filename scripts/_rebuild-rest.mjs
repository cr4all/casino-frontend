#!/usr/bin/env node
/** Append more language blocks to part2/part3/part4 and emit JSON + rebuild. */
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
execSync('node _emit-rest-lang-files.mjs', { cwd: dir, stdio: 'inherit' });
execSync('node _build-final-rest.mjs', { cwd: dir, stdio: 'inherit' });

import mod from './i18n-rest-translations.mjs';
import { en } from '../src/i18n/locales/en.ts';
let gaps = 0;
for (const lang of Object.keys(mod.TRANSLATIONS)) {
  for (const k of Object.keys(en.affiliateProgram)) {
    if (k === 'partnersEmail') continue;
    if (mod.TRANSLATIONS[lang].affiliateProgram[k] === en.affiliateProgram[k]) gaps++;
  }
}
console.log('Total English affiliate gaps:', gaps);
