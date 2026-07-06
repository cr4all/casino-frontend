/**
 * Generates scripts/build-es-it-pt-locales.mjs with embedded phrase maps.
 * Run: node scripts/generate-build-es-it-pt-locales.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';
import { IT_MAP, PT_MAP, ES_FIXES, ES_EXTRA, PT_BR_OVERRIDES } from './es-it-pt-map-data.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const esExisting = JSON.parse(readFileSync(join(root, 'src/i18n/phraseMaps/es.json'), 'utf8'));

function collectLeafStrings(node, set = new Set()) {
  if (typeof node === 'string') {
    set.add(node);
    return set;
  }
  if (Array.isArray(node)) {
    node.forEach((v) => collectLeafStrings(v, set));
    return set;
  }
  if (node && typeof node === 'object') {
    Object.values(node).forEach((v) => collectLeafStrings(v, set));
  }
  return set;
}

const englishLeaves = collectLeafStrings(en);

const ES_MAP = {};
for (const key of englishLeaves) {
  ES_MAP[key] = ES_FIXES[key] ?? ES_EXTRA[key] ?? esExisting[key] ?? key;
}

const PT_BR_MAP = { ...PT_MAP, ...PT_BR_OVERRIDES };

function formatMap(name, map) {
  const entries = [...englishLeaves]
    .sort((a, b) => a.localeCompare(b))
    .map((key) => `  ${JSON.stringify(key)}: ${JSON.stringify(map[key])},`)
    .join('\n');
  return `const ${name} = {\n${entries}\n};`;
}

const body = `/**
 * Build Spanish (es), Italian (it), and Portuguese (pt / pt-br) locale files from embedded phrase maps.
 * Run: node scripts/build-es-it-pt-locales.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';
import { applyPhraseMapToValues } from '../src/i18n/phraseMapUtils.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src/i18n/locales');
const phraseMapsDir = join(root, 'src/i18n/phraseMaps');

${formatMap('ES_MAP', ES_MAP)}

${formatMap('IT_MAP', IT_MAP)}

${formatMap('PT_MAP', PT_MAP)}

${formatMap('PT_BR_MAP', PT_BR_MAP)}

function collectLeafStrings(node, set = new Set()) {
  if (typeof node === 'string') {
    set.add(node);
    return set;
  }
  if (Array.isArray(node)) {
    node.forEach((v) => collectLeafStrings(v, set));
    return set;
  }
  if (node && typeof node === 'object') {
    Object.values(node).forEach((v) => collectLeafStrings(v, set));
  }
  return set;
}

function countGaps(tree, englishLeaves) {
  let gaps = 0;
  function walk(node) {
    if (typeof node === 'string') {
      if (englishLeaves.has(node)) gaps++;
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node && typeof node === 'object') {
      Object.values(node).forEach(walk);
    }
  }
  walk(tree);
  return gaps;
}

function writeLocale(langCode, exportName, tree) {
  const body = JSON.stringify(tree, null, 2);
  const content = \`import type { LocaleTree } from './en';

export const \${exportName}: LocaleTree = \${body};
\`;
  writeFileSync(join(localesDir, \`\${langCode}.ts\`), content);
}

function writePhraseMap(langCode, map) {
  mkdirSync(phraseMapsDir, { recursive: true });
  writeFileSync(join(phraseMapsDir, \`\${langCode}.json\`), JSON.stringify(map, null, 2) + '\\n');
}

const englishLeaves = collectLeafStrings(en);
const esTree = applyPhraseMapToValues(en, ES_MAP);
const itTree = applyPhraseMapToValues(en, IT_MAP);
const ptTree = applyPhraseMapToValues(en, PT_MAP);
const ptBrTree = applyPhraseMapToValues(en, PT_BR_MAP);

writeLocale('es', 'es', esTree);
writeLocale('it', 'it', itTree);
writeLocale('pt', 'pt', ptTree);
writeLocale('pt-br', 'ptBr', ptBrTree);
writePhraseMap('es', ES_MAP);
writePhraseMap('it', IT_MAP);
writePhraseMap('pt', PT_MAP);
writePhraseMap('pt-br', PT_BR_MAP);

const esGaps = countGaps(esTree, englishLeaves);
const itGaps = countGaps(itTree, englishLeaves);
const ptGaps = countGaps(ptTree, englishLeaves);
const ptBrGaps = countGaps(ptBrTree, englishLeaves);

console.log('Wrote src/i18n/locales/es.ts');
console.log('Wrote src/i18n/locales/it.ts');
console.log('Wrote src/i18n/locales/pt.ts');
console.log('Wrote src/i18n/locales/pt-br.ts');
console.log('Wrote src/i18n/phraseMaps/es.json');
console.log('Wrote src/i18n/phraseMaps/it.json');
console.log('Wrote src/i18n/phraseMaps/pt.json');
console.log('Wrote src/i18n/phraseMaps/pt-br.json');
console.log(\`es gap count (strings still equal to English): \${esGaps}\`);
console.log(\`it gap count (strings still equal to English): \${itGaps}\`);
console.log(\`pt gap count (strings still equal to English): \${ptGaps}\`);
console.log(\`pt-br gap count (strings still equal to English): \${ptBrGaps}\`);
console.log(\`ES_MAP entries: \${Object.keys(ES_MAP).length}\`);
console.log(\`IT_MAP entries: \${Object.keys(IT_MAP).length}\`);
console.log(\`PT_MAP entries: \${Object.keys(PT_MAP).length}\`);
console.log(\`PT_BR_MAP entries: \${Object.keys(PT_BR_MAP).length}\`);
console.log(\`Unique English leaves: \${englishLeaves.size}\`);
`;

writeFileSync(join(root, 'scripts/build-es-it-pt-locales.mjs'), body);
console.log('Generated scripts/build-es-it-pt-locales.mjs');
