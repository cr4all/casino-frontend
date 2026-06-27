import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mapDir = join(root, 'src/content/legal/phraseMaps');
const EMAIL_KEY = 'Email: support@ibets24.com';

const KEEP_PARTIAL = [
  'iBets24',
  'support@ibets24.com',
  'GamCare',
  'Gamblers Anonymous',
  'BeGambleAware',
  'AML',
  'RNG',
  'FAQ',
  'Live Chat',
  'Cookie Policy',
  'Terms & Conditions',
  'Privacy Policy',
  'Responsible Gaming',
  'AML Policy',
  'force majeure',
  'cooling-off',
  'self-exclusion',
  'opt out',
  EMAIL_KEY,
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function protectText(text) {
  const tokens = [];
  let protectedText = text;
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
    result = result.replace(new RegExp(escaped, 'g'), value);
  }
  return result;
}

async function translatePhrase(text, targetLang, attempt = 0) {
  const { protectedText, tokens } = protectText(text);
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', protectedText.slice(0, 500));
  url.searchParams.set('langpair', `en|${targetLang}`);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const status = data?.responseStatus;
    if (status === 429 || status === 403) {
      if (attempt < 8) {
        await sleep(2500 * (attempt + 1));
        return translatePhrase(text, targetLang, attempt + 1);
      }
    }
    const translated = data?.responseData?.translatedText ?? text;
    return restoreText(translated, tokens);
  } catch (err) {
    if (attempt < 5) {
      await sleep(2000 * (attempt + 1));
      return translatePhrase(text, targetLang, attempt + 1);
    }
    throw err;
  }
}

const targets = [
  ['km', 'km'],
  ['ka', 'ka'],
  ['fil', 'tl'],
];

const counts = {};

for (const [code, targetLang] of targets) {
  const filePath = join(mapDir, `${code}.json`);
  const map = JSON.parse(readFileSync(filePath, 'utf8'));
  const keys = Object.keys(map);
  const toFix = keys.filter((k) => k === map[k] && k !== EMAIL_KEY);

  console.log(`${code}: fixing ${toFix.length} entries...`);
  let fixed = 0;

  for (let i = 0; i < toFix.length; i++) {
    const key = toFix[i];
    map[key] = await translatePhrase(key, targetLang);
    fixed += 1;
    process.stdout.write(`\r${code}: ${i + 1}/${toFix.length}`);
    await sleep(600);
  }

  console.log('');
  writeFileSync(filePath, `${JSON.stringify(map, null, 2)}\n`);
  counts[code] = fixed;

  const remaining = Object.entries(map).filter(([k, v]) => k === v && k !== EMAIL_KEY).length;
  console.log(`${code}: fixed ${fixed}, remaining equal (excl email): ${remaining}, keys: ${keys.length}`);
}

console.log('\n=== Fixed counts ===');
for (const [code, n] of Object.entries(counts)) {
  console.log(`${code}: ${n}`);
}
