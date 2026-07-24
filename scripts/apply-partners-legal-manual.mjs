#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const legalMapsDir = join(root, 'src/content/legal/phraseMaps');
const data = JSON.parse(readFileSync(join(root, 'scripts/i18n-partners-legal-manual.json'), 'utf8'));

let updated = 0;
for (const [code, phrases] of Object.entries(data)) {
  const filePath = join(legalMapsDir, `${code}.json`);
  if (!existsSync(filePath)) {
    console.warn(`missing map ${code}`);
    continue;
  }
  const map = JSON.parse(readFileSync(filePath, 'utf8'));
  Object.assign(map, phrases);
  // Clean mangled protect tokens from earlier MT runs.
  for (const [key, value] of Object.entries(map)) {
    if (typeof value === 'string' && /__\s*KP_\d+\s*__/.test(value)) {
      map[key] = phrases[key] ?? key;
    }
  }
  writeFileSync(filePath, `${JSON.stringify(map, null, 2)}\n`);
  updated += 1;
  console.log(`updated ${code}`);
}

console.log(`done (${updated})`);
