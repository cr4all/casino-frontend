import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const phrasesPath = join(root, 'scripts/i18n-phrases.json');

function collectStrings(node, set) {
  if (typeof node === 'string') {
    if (node.length > 0) set.add(node);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item) => collectStrings(item, set));
    return;
  }
  if (node && typeof node === 'object') {
    Object.values(node).forEach((value) => collectStrings(value, set));
  }
}

const set = new Set();
collectStrings(en, set);
const phrases = [...set].sort((a, b) => b.length - a.length);
writeFileSync(phrasesPath, JSON.stringify(phrases, null, 2));
console.log(`extracted ${phrases.length} phrases to scripts/i18n-phrases.json`);
