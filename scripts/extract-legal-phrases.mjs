import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const enPath = join(root, 'src/content/legal/en.ts');
const source = readFileSync(enPath, 'utf8');

const strings = new Set();
const re = /'((?:\\'|[^'])*)'/g;
let match;
while ((match = re.exec(source)) !== null) {
  const value = match[1].replace(/\\'/g, "'");
  if (value.length > 1 && !/^[a-z_]+$/.test(value)) {
    strings.add(value);
  }
}

const phrases = [...strings].sort((a, b) => b.length - a.length);
writeFileSync(join(root, 'scripts/legal-phrases.json'), JSON.stringify(phrases, null, 2));
console.log(`Extracted ${phrases.length} phrases`);
