#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import DATA from './_rest-lang-batch15.mjs';

const dir = join(dirname(fileURLToPath(import.meta.url)), 'rest-i18n-langs');
for (const [lang, ap] of Object.entries(DATA)) {
  writeFileSync(join(dir, `${lang}.json`), `${JSON.stringify(ap, null, 2)}\n`);
  console.log('Wrote', lang);
}
