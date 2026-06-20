import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'scripts/legal-translation-data');
const phrases = JSON.parse(readFileSync(join(root, 'scripts/legal-phrases.json'), 'utf8'));

const KEEP_PARTIAL = [
  'Email: partners@ibets24.com',
  'iBets24',
  'partners@ibets24.com',
  'GamCare',
  'Gamblers Anonymous',
  'BeGambleAware',
  'AML Policy',
  'Cookie Policy',
  'Terms & Conditions',
  'Privacy Policy',
  'Responsible Gaming',
  'Live Chat',
  'AML',
  'RNG',
  'FAQ',
  'force majeure',
  'cooling-off',
  'self-exclusion',
  'opt out',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function protectText(text) {
  const tokens = [];
  let protectedText = text;
  for (const value of KEEP_PARTIAL) {
    while (protectedText.includes(value)) {
      const token = `ZZZKEEP${tokens.length}ZZZ`;
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
    result = result.replace(new RegExp(escaped, 'g'), value);
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
  const { protectedText, tokens } = protectText(phrase);
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const translated = restoreText(await translateViaGoogle(protectedText, targetLang), tokens);
      if (translated) return translated;
    } catch (err) {
      if (attempt === 3) {
        console.error(`translate failed (${targetLang}): ${phrase.slice(0, 60)}...`, err.message);
      }
    }
    await sleep(700 + attempt * 500);
  }
  return phrase;
}

async function buildArray(langCode, targetLang) {
  const out = [];
  for (let i = 0; i < phrases.length; i++) {
    out.push(await translateOne(phrases[i], targetLang));
    process.stdout.write(`\r${langCode}: ${i + 1}/${phrases.length}`);
    await sleep(400);
  }
  process.stdout.write('\n');
  return out;
}

async function main() {
  const only = process.argv.slice(2);
  const targets = [
    ['ka', 'ka'],
    ['km', 'km'],
    ['tg', 'tg'],
  ].filter(([code]) => !only.length || only.includes(code));

  for (const [code, targetLang] of targets) {
    const values = await buildArray(code, targetLang);
    if (values.length !== phrases.length) {
      throw new Error(`${code}: expected ${phrases.length}, got ${values.length}`);
    }
    writeFileSync(join(dataDir, `${code}.json`), `${JSON.stringify(values, null, 2)}\n`);
    console.log(`wrote ${code}.json (${values.length} strings)`);
  }

  if (!only.length || only.includes('fil')) {
    const filPath = join(dataDir, 'fil.json');
    const fil = JSON.parse(readFileSync(filPath, 'utf8'));
    const englishIndices = fil.map((v, i) => (v === phrases[i] ? i : -1)).filter((i) => i >= 0);
    console.log(`fil: patching ${englishIndices.length} English-identical entries`);
    for (let n = 0; n < englishIndices.length; n++) {
      const i = englishIndices[n];
      fil[i] = await translateOne(phrases[i], 'tl');
      process.stdout.write(`\rfil patch: ${n + 1}/${englishIndices.length}`);
      await sleep(400);
    }
    process.stdout.write('\n');
    writeFileSync(filPath, `${JSON.stringify(fil, null, 2)}\n`);
    console.log(`wrote fil.json (${fil.length} strings)`);
  }
}

await main();
