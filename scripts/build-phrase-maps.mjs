import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { legalEn } from '../src/content/legal/en.ts';
import { legalKo } from '../src/content/legal/ko.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function buildPhraseMap(enNode, localizedNode, map) {
  if (typeof enNode === 'string' && typeof localizedNode === 'string') {
    if (enNode !== localizedNode) {
      map[enNode] = localizedNode;
    }
    return;
  }

  if (Array.isArray(enNode) && Array.isArray(localizedNode)) {
    for (let i = 0; i < enNode.length; i++) {
      buildPhraseMap(enNode[i], localizedNode[i], map);
    }
    return;
  }

  if (
    enNode &&
    localizedNode &&
    typeof enNode === 'object' &&
    typeof localizedNode === 'object'
  ) {
    for (const key of Object.keys(enNode)) {
      buildPhraseMap(enNode[key], localizedNode[key], map);
    }
  }
}

const koMap = {};
buildPhraseMap(legalEn, legalKo, koMap);

const outPath = join(root, 'src/content/legal/phraseMaps/ko.json');
writeFileSync(outPath, JSON.stringify(koMap, null, 2));
console.log(`ko map: ${Object.keys(koMap).length} phrases`);
