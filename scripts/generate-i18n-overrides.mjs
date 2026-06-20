import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { translate as googleTranslate } from '@vitalets/google-translate-api';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const overridesDir = join(root, 'src/i18n/overrides');
const phrasesPath = join(root, 'scripts/i18n-phrases.json');

const LANG_TARGETS = {
  ro: 'ro',
  sv: 'sv',
  sw: 'sw',
  hy: 'hy',
  ka: 'ka',
  km: 'km',
  lt: 'lt',
  mn: 'mn',
  'zh-tw': 'zh-TW',
};

const KEEP_AS_IS = new Set([
  '404',
  'CPA',
  'OK',
  'ID',
  'player@example.com',
  'TRC20, ERC20...',
  'TXyz...',
  'XXXX XXXX',
]);

function protectPlaceholders(text) {
  const placeholders = [];
  const protectedText = text.replace(/\{\{[^}]+\}\}/g, (match) => {
    const token = `__PH${placeholders.length}__`;
    placeholders.push(match);
    return token;
  });
  return { protectedText, placeholders };
}

function restorePlaceholders(text, placeholders) {
  let result = text;
  for (let i = 0; i < placeholders.length; i++) {
    const patterns = [
      new RegExp(`__PH${i}__`, 'g'),
      new RegExp(`__ PH ${i} __`, 'g'),
      new RegExp(`__PH ${i}__`, 'g'),
      new RegExp(`__ PH${i}__`, 'g'),
    ];
    for (const pattern of patterns) {
      result = result.replace(pattern, placeholders[i]);
    }
  }
  return result;
}

async function translatePhrase(text, targetLang) {
  if (KEEP_AS_IS.has(text)) return text;

  const { protectedText, placeholders } = protectPlaceholders(text);

  try {
    const result = await googleTranslate(protectedText, { from: 'en', to: targetLang });
    const translated = restorePlaceholders(result.text.trim(), placeholders);
    return translated || text;
  } catch {
    return text;
  }
}

async function buildOverrideMap(phrases, targetLang) {
  const map = {};
  const concurrency = 2;

  for (let i = 0; i < phrases.length; i += concurrency) {
    const batch = phrases.slice(i, i + concurrency);
    const translated = await Promise.all(
      batch.map((phrase) => translatePhrase(phrase, targetLang)),
    );
    batch.forEach((phrase, index) => {
      map[phrase] = translated[index];
    });
    if (i + concurrency < phrases.length) {
      await new Promise((r) => setTimeout(r, 350));
    }
    if ((i + concurrency) % 40 === 0 || i + concurrency >= phrases.length) {
      process.stdout.write(`  ${Math.min(i + concurrency, phrases.length)}/${phrases.length}\r`);
    }
  }

  process.stdout.write('\n');
  return map;
}

const args = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const langs = args.length
  ? args[0].split(',').map((s) => s.trim())
  : Object.keys(LANG_TARGETS);

mkdirSync(overridesDir, { recursive: true });
const phrases = JSON.parse(readFileSync(phrasesPath, 'utf8'));

for (const langCode of langs) {
  const targetLang = LANG_TARGETS[langCode];
  if (!targetLang) {
    console.log(`skip ${langCode} (unknown target)`);
    continue;
  }

  console.log(`${langCode}: translating ${phrases.length} phrases -> ${targetLang}`);
  const map = await buildOverrideMap(phrases, targetLang);
  const outPath = join(overridesDir, `${langCode}.json`);
  writeFileSync(outPath, `${JSON.stringify(map, null, 2)}\n`);
  const translated = Object.entries(map).filter(([a, b]) => a !== b).length;
  console.log(`${langCode}: wrote ${Object.keys(map).length} keys (${translated} translated)`);
}

console.log('done');
