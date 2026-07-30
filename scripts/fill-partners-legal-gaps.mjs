#!/usr/bin/env node
/**
 * Fill remaining English Partners legal phrases via MyMemory (+ Lingva fallback).
 *
 * Safeguards: short timeouts, no nested retry storms, per-lang / global fail abort.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { legalEn } from '../src/content/legal/en.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const legalMapsDir = join(root, 'src/content/legal/phraseMaps');
const cachePath = join(root, 'scripts/i18n-partners-data.json');

const KEEP = ['iBets24', 'partners@ibets24.com', 'support@ibets24.com', 'Affiliate Portal', 'B2B'];
const REQUEST_TIMEOUT_MS = 8000;
const MAX_CONSECUTIVE_FAILS_PER_LANG = 3;
const MAX_GLOBAL_API_FAILS = 40;

const LANG = {
  af: 'af', am: 'am', ar: 'ar', az: 'az', be: 'be', bg: 'bg', bn: 'bn', cs: 'cs', cy: 'cy',
  da: 'da', de: 'de', el: 'el', es: 'es', et: 'et', fa: 'fa', fi: 'fi', fil: 'tl', fr: 'fr',
  ga: 'ga', gu: 'gu', ha: 'ha', he: 'he', hi: 'hi', hr: 'hr', hu: 'hu', hy: 'hy', id: 'id',
  ig: 'ig', is: 'is', it: 'it', ja: 'ja', ka: 'ka', kk: 'kk', km: 'km', kn: 'kn', lb: 'lb',
  lo: 'lo', lt: 'lt', lv: 'lv', mk: 'mk', ml: 'ml', mn: 'mn', mr: 'mr', ms: 'ms', mt: 'mt',
  my: 'my', ne: 'ne', nl: 'nl', no: 'no', pa: 'pa', pl: 'pl', pt: 'pt', 'pt-br': 'pt',
  ro: 'ro', ru: 'ru', si: 'si', sk: 'sk', sl: 'sl', so: 'so', sq: 'sq', sr: 'sr', sv: 'sv',
  sw: 'sw', ta: 'ta', te: 'te', tg: 'tg', th: 'th', tr: 'tr', uk: 'uk', ur: 'ur', uz: 'uz',
  vi: 'vi', yo: 'yo', zh: 'zh-CN', 'zh-tw': 'zh-TW', zu: 'zu',
};

function collect(node, out = new Set()) {
  if (typeof node === 'string') out.add(node);
  else if (Array.isArray(node)) node.forEach((n) => collect(n, out));
  else if (node && typeof node === 'object') Object.values(node).forEach((n) => collect(n, out));
  return out;
}

const LEGAL_PHRASES = [...collect(legalEn.partners)];
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
    out = out.split(`__KP_${i}__`).join(value);
    out = out.split(`__ KP_${i} __`).join(value);
    out = out.split(`__KP_${i} __`).join(value);
    out = out.split(`__ KP_${i}__`).join(value);
  });
  out = out.replace(/__\s*KP_(\d+)\s*__/g, (_, n) => tokens[Number(n)] ?? '');
  return out.trim();
}

function usable(translated, english) {
  if (!translated || translated === english) return false;
  if (/__\s*KP_\d+\s*__/.test(translated)) return false;
  if (/(.)\1{8,}/.test(translated)) return false;
  return true;
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
    return usable(translated, text) ? translated : null;
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
    return usable(translated, text) ? translated : null;
  } catch {
    return null;
  }
}

async function translatePhrase(text, code) {
  const target = LANG[code] ?? code;
  return (await translateMyMemory(text, target)) ?? (await translateLingva(text, target));
}

function needsFix(value, english) {
  if (!value) return true;
  if (value === english) return true;
  if (/__\s*KP_\d+\s*__/.test(value)) return true;
  if (/(.)\1{8,}/.test(value)) return true;
  return false;
}

const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, 'utf8')) : {};
const legalCodes = readdirSync(legalMapsDir)
  .filter((f) => f.endsWith('.json') && f !== 'ko.json')
  .map((f) => f.replace(/\.json$/, ''));

let totalFixed = 0;
let globalFails = 0;
let apiDisabled = false;

for (const code of legalCodes) {
  const filePath = join(legalMapsDir, `${code}.json`);
  const map = JSON.parse(readFileSync(filePath, 'utf8'));
  const missing = LEGAL_PHRASES.filter((p) => needsFix(map[p], p));
  if (missing.length === 0) {
    console.log(`${code}: ok`);
    continue;
  }

  let fixed = 0;
  let consecutiveFails = 0;

  for (const phrase of missing) {
    if (apiDisabled || consecutiveFails >= MAX_CONSECUTIVE_FAILS_PER_LANG) {
      break;
    }

    const translated = await translatePhrase(phrase, code);
    if (translated) {
      map[phrase] = translated;
      fixed += 1;
      totalFixed += 1;
      consecutiveFails = 0;
      await sleep(200);
    } else {
      consecutiveFails += 1;
      globalFails += 1;
      if (globalFails >= MAX_GLOBAL_API_FAILS) {
        apiDisabled = true;
        console.log(`[abort] ${MAX_GLOBAL_API_FAILS} API failures — skipping remaining API calls`);
      }
    }
  }

  writeFileSync(filePath, `${JSON.stringify(map, null, 2)}\n`);
  cache[code] = { ...(cache[code] ?? {}) };
  for (const phrase of LEGAL_PHRASES) {
    if (map[phrase]) cache[code][phrase] = map[phrase];
  }
  writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`);

  console.log(`${code}: +${fixed}/${missing.length}`);
  if (apiDisabled) break;
}

console.log(`done totalFixed=${totalFixed} apiFails=${globalFails}`);
