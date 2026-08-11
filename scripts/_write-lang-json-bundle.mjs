#!/usr/bin/env node
/** Write rest-i18n-langs/*.json from bundled professional translations. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import bundle from './_rest-translations-bundle.mjs';

const langsDir = join(dirname(fileURLToPath(import.meta.url)), 'rest-i18n-langs');
mkdirSync(langsDir, { recursive: true });

for (const [lang, affiliateProgram] of Object.entries(bundle.default)) {
  writeFileSync(join(langsDir, `${lang}.json`), JSON.stringify(affiliateProgram, null, 2) + '\n');
  console.log('wrote', lang);
}
