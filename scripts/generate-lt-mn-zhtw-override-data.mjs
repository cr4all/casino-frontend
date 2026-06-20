import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const phrasesPath = join(root, 'scripts/i18n-phrases.json');
const outDir = join(root, 'scripts/i18n-override-data');

const LANGS = {
  lt: 'lt',
  mn: 'mn',
  'zh-tw': 'zh-TW',
};

const KEEP_FULL = new Set([
  '404',
  'CPA',
  'OK',
  'ID',
  'player@example.com',
  'TRC20, ERC20...',
  'TXyz...',
  'XXXX XXXX',
  'Pragmatic Slots',
  'Rollback',
  'Hybrid',
  'FAQ',
]);

const KEEP_PARTIAL = [
  'iBets24',
  'player@example.com',
  'TRC20, ERC20...',
  'TXyz...',
  'XXXX XXXX',
  'Pragmatic Slots',
  'Rollback',
  'Hybrid',
  'FAQ',
  'CPA',
  'OK',
  'ID',
  '404',
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function protectText(text) {
  const tokens = [];
  let protectedText = text.replace(/\{\{[^}]+\}\}/g, (match) => {
    const token = `__PH_${tokens.length}__`;
    tokens.push({ token, value: match });
    return token;
  });

  for (const value of KEEP_PARTIAL) {
    while (protectedText.includes(value)) {
      const token = `__KP_${tokens.length}__`;
      tokens.push({ token, value });
      protectedText = protectedText.replace(value, token);
    }
  }

  return { protectedText, tokens };
}

function restoreText(text, tokens) {
  let result = text;
  for (const { token, value } of tokens) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const variants = [
      new RegExp(escaped, 'g'),
      new RegExp(escaped.replaceAll('_', '[ _]*'), 'g'),
    ];
    for (const pattern of variants) {
      result = result.replace(pattern, value);
    }
  }
  return result;
}

async function translateViaGoogle(text, targetLang) {
  const directUrl = new URL('http://translate.googleapis.com/translate_a/single');
  directUrl.searchParams.set('client', 'gtx');
  directUrl.searchParams.set('sl', 'en');
  directUrl.searchParams.set('tl', targetLang);
  directUrl.searchParams.set('dt', 't');
  directUrl.searchParams.set('q', text);

  const proxyUrl = `https://r.jina.ai/${directUrl.toString()}`;
  const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(60000) });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const body = await response.text();
  const jsonStart = body.indexOf('[[[');
  if (jsonStart < 0) throw new Error('No translation payload');
  const data = JSON.parse(body.slice(jsonStart).trim());
  const translated = Array.isArray(data?.[0])
    ? data[0].map((chunk) => (Array.isArray(chunk) ? chunk[0] : '')).join('')
    : '';

  return translated?.trim() || text;
}

async function translateOne(phrase, targetLang) {
  if (KEEP_FULL.has(phrase)) return phrase;

  const { protectedText, tokens } = protectText(phrase);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const translated = restoreText(await translateViaGoogle(protectedText, targetLang), tokens);
      if (translated !== phrase || !/[A-Za-z]/.test(phrase)) return translated;
    } catch {
      // retry
    }
    await sleep(500 + attempt * 400);
  }
  return phrase;
}

async function buildLanguage(phrases, lang, targetLang) {
  const out = [];
  const batchSize = 1;
  for (let i = 0; i < phrases.length; i += batchSize) {
    const batch = phrases.slice(i, i + batchSize);
    const translatedBatch = await Promise.all(batch.map((phrase) => translateOne(phrase, targetLang)));
    out.push(...translatedBatch);
    if (out.length % 25 === 0 || out.length === phrases.length) {
      process.stdout.write(`${lang}: ${out.length}/${phrases.length}\r`);
    }
    await sleep(350);
  }
  process.stdout.write('\n');
  return out;
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const phrases = JSON.parse(readFileSync(phrasesPath, 'utf8'));

  for (const [lang, targetLang] of Object.entries(LANGS)) {
    console.log(`translating ${lang} -> ${targetLang}`);
    const translated = await buildLanguage(phrases, lang, targetLang);
    if (translated.length !== phrases.length) {
      throw new Error(`${lang}: expected ${phrases.length}, got ${translated.length}`);
    }
    const outPath = join(outDir, `${lang}.json`);
    writeFileSync(outPath, `${JSON.stringify(translated, null, 2)}\n`);
    console.log(`wrote ${lang}.json (${translated.length})`);
  }
}

await main();
