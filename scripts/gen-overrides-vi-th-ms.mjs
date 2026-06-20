import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { translate as googleTranslate } from '@vitalets/google-translate-api';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const overridesDir = join(root, 'src/i18n/overrides');
const phrasesPath = join(root, 'scripts/i18n-phrases.json');

const LANG_TARGETS = {
  vi: 'vi',
  th: 'th',
  ms: 'ms',
};

const KEEP_AS_IS = new Set([
  '404',
  'FAQ',
  'OK',
  'ID',
  'CPA',
  'TRC20, ERC20...',
  'TXyz...',
  'XXXX XXXX',
  'player@example.com',
]);

const PLACEHOLDER_RE = /\{\{[^}]+\}\}/g;

function protectPlaceholders(text) {
  const placeholders = [];
  const protectedText = text.replace(PLACEHOLDER_RE, (match) => {
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

function placeholdersMatch(source, target) {
  const from = source.match(PLACEHOLDER_RE) ?? [];
  const to = target.match(PLACEHOLDER_RE) ?? [];
  if (from.length !== to.length) return false;
  return from.every((ph, i) => ph === to[i]);
}

async function translatePhrase(text, targetLang) {
  if (KEEP_AS_IS.has(text)) return text;

  const { protectedText, placeholders } = protectPlaceholders(text);

  try {
    const result = await googleTranslate(protectedText, { from: 'en', to: targetLang });
    let translated = restorePlaceholders(result.text.trim(), placeholders);
    if (!placeholdersMatch(text, translated)) {
      translated = text.replace(PLACEHOLDER_RE, (ph) => {
        const idx = placeholders.indexOf(ph);
        return idx >= 0 ? ph : ph;
      });
      const retry = await googleTranslate(protectPlaceholders(text).protectedText, {
        from: 'en',
        to: targetLang,
      });
      translated = restorePlaceholders(retry.text.trim(), placeholders);
    }
    if (translated === text && !KEEP_AS_IS.has(text)) {
      const retry = await googleTranslate(protectedText, { from: 'en', to: targetLang, forceFrom: true });
      translated = restorePlaceholders(retry.text.trim(), placeholders);
    }
    return translated || text;
  } catch (error) {
    console.error(`translate failed (${targetLang}): ${text.slice(0, 60)}...`, error.message);
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

function validate(langCode, phrases, map) {
  const missing = phrases.filter((p) => !(p in map));
  if (missing.length) {
    throw new Error(`${langCode}: missing ${missing.length} keys`);
  }

  const unchanged = [];
  const badPlaceholders = [];
  for (const phrase of phrases) {
    const value = map[phrase];
    if (!KEEP_AS_IS.has(phrase) && value === phrase) {
      unchanged.push(phrase);
    }
    if (!placeholdersMatch(phrase, value)) {
      badPlaceholders.push(phrase);
    }
  }

  if (unchanged.length) {
    console.warn(`${langCode}: ${unchanged.length} unchanged translatable strings`);
  }
  if (badPlaceholders.length) {
    throw new Error(`${langCode}: placeholder mismatch on ${badPlaceholders.length} entries`);
  }
}

mkdirSync(overridesDir, { recursive: true });
const phrases = JSON.parse(readFileSync(phrasesPath, 'utf8'));

for (const langCode of Object.keys(LANG_TARGETS)) {
  const targetLang = LANG_TARGETS[langCode];
  console.log(`${langCode}: translating ${phrases.length} phrases -> ${targetLang}`);
  const map = await buildOverrideMap(phrases, targetLang);
  validate(langCode, phrases, map);
  const outPath = join(overridesDir, `${langCode}.json`);
  writeFileSync(outPath, `${JSON.stringify(map, null, 2)}\n`);
  const translated = Object.entries(map).filter(([a, b]) => a !== b).length;
  const lines = readFileSync(outPath, 'utf8').split('\n').length;
  console.log(`${langCode}: wrote ${Object.keys(map).length} keys (${translated} translated), ${lines} lines`);
}

console.log('done');
