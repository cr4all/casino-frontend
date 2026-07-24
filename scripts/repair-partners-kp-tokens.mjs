#!/usr/bin/env node
/** Repair mangled __KP_N__ protect tokens in legal Partners phrase maps. */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { legalEn } from '../src/content/legal/en.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const legalMapsDir = join(root, 'src/content/legal/phraseMaps');
const KEEP = ['iBets24', 'partners@ibets24.com', 'support@ibets24.com', 'Affiliate Portal', 'B2B'];

function collect(node, out = new Set()) {
  if (typeof node === 'string') out.add(node);
  else if (Array.isArray(node)) node.forEach((n) => collect(n, out));
  else if (node && typeof node === 'object') Object.values(node).forEach((n) => collect(n, out));
  return out;
}

const LEGAL_PHRASES = new Set(collect(legalEn.partners));

function tokensFor(english) {
  const tokens = [];
  let out = english;
  for (const value of KEEP) {
    let idx;
    while ((idx = out.indexOf(value)) !== -1) {
      tokens.push(value);
      out = `${out.slice(0, idx)}⟦${tokens.length - 1}⟧${out.slice(idx + value.length)}`;
    }
  }
  return tokens;
}

function repair(english, localized) {
  if (!localized || !/__\s*KP_/.test(localized)) return localized;
  const tokens = tokensFor(english);
  return localized.replace(/__\s*KP_(\d+)\s*__/gi, (_, n) => tokens[Number(n)] ?? '');
}

let files = 0;
let fixes = 0;
for (const name of readdirSync(legalMapsDir).filter((f) => f.endsWith('.json'))) {
  const filePath = join(legalMapsDir, name);
  const map = JSON.parse(readFileSync(filePath, 'utf8'));
  let changed = 0;
  for (const [english, localized] of Object.entries(map)) {
    if (!LEGAL_PHRASES.has(english)) continue;
    const next = repair(english, localized);
    if (next !== localized) {
      map[english] = next;
      changed += 1;
    }
  }
  if (changed > 0) {
    writeFileSync(filePath, `${JSON.stringify(map, null, 2)}\n`);
    files += 1;
    fixes += changed;
    console.log(`${name}: repaired ${changed}`);
  }
}

console.log(`done files=${files} fixes=${fixes}`);
