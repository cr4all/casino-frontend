#!/usr/bin/env node
/**
 * Build scripts/i18n-partners-legal-remaining.json for requested locale codes.
 *
 * Safeguards against hung runs:
 * - Hard per-request timeout (no nested long retry storms)
 * - Abort API calls for a language after consecutive failures
 * - Global abort after too many API failures
 * - Periodic checkpoint writes so partial progress is kept
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outPath = join(root, 'scripts/i18n-partners-legal-remaining.json');
const manualPath = join(root, 'scripts/i18n-partners-legal-manual.json');
const dataPath = join(root, 'scripts/i18n-partners-data.json');
const phraseDir = join(root, 'src/content/legal/phraseMaps');

const LANGS = [
  'gu', 'ha', 'hy', 'id', 'ig', 'is', 'ka', 'kk', 'km', 'kn', 'lb', 'lo', 'lt', 'lv', 'mk',
  'ml', 'mn', 'mr', 'ms', 'mt', 'my', 'ne', 'nl', 'no', 'pa', 'ro', 'si', 'sk', 'sl', 'so',
  'sr', 'sv', 'sw', 'ta', 'te', 'tg', 'th', 'uk', 'ur', 'uz', 'vi', 'yo', 'zu',
];

const KEYS = [
  'Partners',
  'iBets24 welcomes long-term partnerships with affiliates, media publishers, payment providers, game studios, and other B2B partners.',
  'Affiliate Program',
  'Our affiliate program offers competitive commissions for referring new players who meet our eligibility and compliance requirements.',
  'Existing affiliates can access performance stats and payouts from the Affiliate Portal after signing in.',
  'To apply or request affiliate terms, email partners@ibets24.com with your traffic sources, target markets, and promotional methods.',
  'Business Partnerships',
  'We collaborate with licensed game providers, payment solution partners, marketing agencies, and technology vendors that share our standards for fairness, security, and responsible gaming.',
  'Send partnership proposals to partners@ibets24.com including company details, product overview, and proposed commercial model.',
  'How to get in touch',
  'Business and partnership enquiries: partners@ibets24.com',
  'Player support (accounts, payments, bonuses): support@ibets24.com',
  'Please do not use the partners inbox for player account issues — those requests are handled by customer support.',
];

const KEEP = ['iBets24', 'partners@ibets24.com', 'support@ibets24.com', 'Affiliate Portal', 'B2B'];

const LANG = {
  gu: 'gu', ha: 'ha', hy: 'hy', id: 'id', ig: 'ig', is: 'is', ka: 'ka', kk: 'kk', km: 'km',
  kn: 'kn', lb: 'lb', lo: 'lo', lt: 'lt', lv: 'lv', mk: 'mk', ml: 'ml', mn: 'mn', mr: 'mr',
  ms: 'ms', mt: 'mt', my: 'my', ne: 'ne', nl: 'nl', no: 'no', pa: 'pa', ro: 'ro', si: 'si',
  sk: 'sk', sl: 'sl', so: 'so', sr: 'sr', sv: 'sv', sw: 'sw', ta: 'ta', te: 'te', tg: 'tg',
  th: 'th', uk: 'uk', ur: 'ur', uz: 'uz', vi: 'vi', yo: 'yo', zu: 'zu',
};

/** Max wait for a single HTTP call (ms). */
const REQUEST_TIMEOUT_MS = 8000;
/** Stop calling APIs for a language after this many consecutive failures. */
const MAX_CONSECUTIVE_FAILS_PER_LANG = 3;
/** Stop all API calls after this many total failures. */
const MAX_GLOBAL_API_FAILS = 40;
/** Delay between successful API calls only. */
const SUCCESS_DELAY_MS = 200;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function protect(text) {
  const tokens = [];
  let out = text;
  for (const value of KEEP) {
    let idx;
    while ((idx = out.indexOf(value)) !== -1) {
      const token = `__KP_${tokens.length}__`;
      tokens.push(value);
      out = `${out.slice(0, idx)}${token}${out.slice(idx + value.length)}`;
    }
  }
  return { out, tokens };
}

function restore(text, tokens) {
  let out = String(text ?? '');
  tokens.forEach((value, i) => {
    for (const pat of [`__KP_${i}__`, `__ KP_${i} __`, `__KP_${i} __`, `__ KP_${i}__`]) {
      out = out.split(pat).join(value);
    }
  });
  out = out.replace(/__\s*KP_(\d+)\s*__/g, (_, n) => tokens[Number(n)] ?? '');
  return out.trim();
}

function good(value, english) {
  if (!value) return false;
  if (value === english) return false;
  if (/__\s*KP_\d+\s*__/.test(value)) return false;
  if (/Вввв/.test(value)) return false;
  if (/(.)\1{8,}/.test(value)) return false;
  return true;
}

function pickExisting(lang, key, manual, data) {
  const pmPath = join(phraseDir, `${lang}.json`);
  const pm = existsSync(pmPath) ? JSON.parse(readFileSync(pmPath, 'utf8')) : {};
  for (const src of [manual[lang]?.[key], pm[key], data[lang]?.[key]]) {
    if (good(src, key)) return src;
  }
  return null;
}

async function translateMyMemory(text, target) {
  const { out, tokens } = protect(text);
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', out.slice(0, 480));
  url.searchParams.set('langpair', `en|${target}`);
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    if (!response.ok) return null;
    const data = await response.json();
    if (String(data?.responseDetails ?? '').includes('MYMEMORY WARNING')) return null;
    const translated = restore(data?.responseData?.translatedText, tokens);
    return good(translated, text) ? translated : null;
  } catch {
    return null;
  }
}

async function translateLingva(text, target) {
  const { out, tokens } = protect(text);
  const url = `https://lingva.ml/api/v1/en/${encodeURIComponent(target)}/${encodeURIComponent(out)}`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    if (!response.ok) return null;
    const data = await response.json();
    const translated = restore(data?.translation, tokens);
    return good(translated, text) ? translated : null;
  } catch {
    return null;
  }
}

async function translatePhrase(text, code) {
  const target = LANG[code] ?? code;
  const fromMemory = await translateMyMemory(text, target);
  if (fromMemory) return fromMemory;
  return translateLingva(text, target);
}

function checkpoint(output) {
  writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);
}

const manual = existsSync(manualPath) ? JSON.parse(readFileSync(manualPath, 'utf8')) : {};
const data = existsSync(dataPath) ? JSON.parse(readFileSync(dataPath, 'utf8')) : {};
const existingOut = existsSync(outPath) ? JSON.parse(readFileSync(outPath, 'utf8')) : {};
const output = { ...existingOut };
let fetched = 0;
let globalFails = 0;
let apiDisabled = false;

for (const lang of LANGS) {
  output[lang] = { ...(output[lang] ?? {}) };
  console.log(`\n${lang}:`);
  let consecutiveFails = 0;

  for (const key of KEYS) {
    if (good(output[lang][key], key)) {
      process.stdout.write('.');
      continue;
    }

    const existing = pickExisting(lang, key, manual, data);
    if (existing) {
      output[lang][key] = existing;
      process.stdout.write('.');
      continue;
    }

    if (apiDisabled || consecutiveFails >= MAX_CONSECUTIVE_FAILS_PER_LANG) {
      output[lang][key] = key;
      process.stdout.write('s'); // skipped
      continue;
    }

    const value = await translatePhrase(key, lang);
    if (value) {
      output[lang][key] = value;
      fetched += 1;
      consecutiveFails = 0;
      process.stdout.write('+');
      await sleep(SUCCESS_DELAY_MS);
    } else {
      output[lang][key] = key;
      consecutiveFails += 1;
      globalFails += 1;
      process.stdout.write('!');
      if (globalFails >= MAX_GLOBAL_API_FAILS) {
        apiDisabled = true;
        console.log(`\n[abort] ${MAX_GLOBAL_API_FAILS} API failures — skipping remaining API calls`);
      } else if (consecutiveFails >= MAX_CONSECUTIVE_FAILS_PER_LANG) {
        console.log(`\n[skip-lang] ${lang} hit ${MAX_CONSECUTIVE_FAILS_PER_LANG} consecutive failures`);
      }
    }
  }

  checkpoint(output);
}

checkpoint(output);

const englishLeft = [];
for (const lang of LANGS) {
  for (const key of KEYS) {
    if (output[lang][key] === key && !(lang === 'nl' && key === 'Partners')) {
      englishLeft.push(`${lang}:${key.slice(0, 30)}`);
    }
  }
}

console.log(`\n\nWrote ${outPath}`);
console.log(`Languages: ${LANGS.length}, phrases/lang: ${KEYS.length}`);
console.log(`API fetched: ${fetched}, API fails: ${globalFails}`);
if (englishLeft.length) {
  console.log(`Still English (${englishLeft.length}):`, englishLeft.slice(0, 20).join(', '));
}
