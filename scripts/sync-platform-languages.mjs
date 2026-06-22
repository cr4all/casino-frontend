import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, '..', 'casino-backend', 'config', 'data');
const outPath = join(outDir, 'platform-languages.json');
const priorityPath = join(outDir, 'platform-language-priority.json');

const source = readFileSync(join(root, 'src/i18n/index.ts'), 'utf8');
const prioritySource = readFileSync(join(root, 'src/i18n/priorityLanguages.ts'), 'utf8');
const block = source.match(/const LANGUAGE_DEFINITIONS = \[([\s\S]*?)\] as const/)?.[1] ?? '';

const languages = [];
for (const match of block.matchAll(
  /\{\s*code:\s*'([^']+)',\s*label:\s*'((?:\\'|[^'])*)',\s*shortLabel:\s*'([^']+)'\s*\}/g,
)) {
  languages.push({
    code: match[1],
    label: match[2].replace(/\\'/g, "'"),
    short_label: match[3],
  });
}

if (languages.length === 0) {
  throw new Error('No languages parsed from src/i18n/index.ts');
}

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, `${JSON.stringify(languages, null, 2)}\n`);
console.log(`Wrote ${languages.length} languages to ${outPath}`);

const priorityBlock = prioritySource.match(/PRIORITY_LANGUAGE_CODES = \[([\s\S]*?)\] as const/)?.[1] ?? '';
const priority = [];
for (const match of priorityBlock.matchAll(/'([^']+)'/g)) {
  priority.push(match[1]);
}

if (priority.length === 0) {
  throw new Error('No priority languages parsed from src/i18n/priorityLanguages.ts');
}

writeFileSync(priorityPath, `${JSON.stringify(priority, null, 2)}\n`);
console.log(`Wrote ${priority.length} priority languages to ${priorityPath}`);
