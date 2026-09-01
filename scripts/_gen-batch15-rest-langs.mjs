#!/usr/bin/env node
/**
 * Generate rest-i18n-langs/{lang}.json for batch-15 affiliateProgram keys.
 * Run: node scripts/_gen-batch15-rest-langs.mjs
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';

const dir = join(dirname(fileURLToPath(import.meta.url)), 'rest-i18n-langs');

const LANGS = {
  hy: 'hy',
  mn: 'mn',
  pa: 'pa',
  ga: 'ga',
  gu: 'gu',
  ha: 'ha',
  ig: 'ig',
  lb: 'lb',
  lo: 'lo',
  ml: 'ml',
  mr: 'mr',
  mt: 'mt',
  my: 'my',
  si: 'si',
  km: 'km',
};

const PRESERVE = [
  'iBets24',
  'USD',
  'NGR',
  'GGR',
  'RevShare',
  'CPA',
  'B2B',
  'SEO',
  'KYC',
  'AML',
  'Affiliate Portal',
  'partners@ibets24.com',
  'support@ibets24.com',
];

/** Protect preserve tokens during translation */
function shield(text) {
  let out = text;
  const tokens = [];
  for (const term of PRESERVE) {
    const idx = tokens.length;
    const token = `__PRESERVE_${idx}__`;
    tokens.push(term);
    out = out.split(term).join(token);
  }
  return { text: out, tokens };
}

function unshield(text, tokens) {
  let out = text;
  tokens.forEach((term, idx) => {
    out = out.split(`__PRESERVE_${idx}__`).join(term);
    out = out.split(`__ PRESERVE _ ${idx} __`).join(term);
    out = out.split(`__PRESERVE_${idx} __`).join(term);
  });
  return out;
}

async function googleTranslate(text, to) {
  const { translate } = await import('@vitalets/google-translate-api');
  const { text: shielded, tokens } = shield(text);
  try {
    const result = await translate(shielded, {
      from: 'en',
      to,
      requestOptions: { timeout: 20000 },
    });
    const raw = result?.text?.trim();
    if (!raw) return null;
    return unshield(raw, tokens);
  } catch (err) {
    console.warn(`translate failed (${to}):`, err.message?.slice(0, 80));
    return null;
  }
}

async function translateLang(lang, googleCode) {
  const out = {};
  const keys = Object.keys(en.affiliateProgram);

  for (const key of keys) {
    if (key === 'partnersEmail') {
      out[key] = 'partners@ibets24.com';
      continue;
    }
    if (key === 'ctaPortal') {
      out[key] = 'Affiliate Portal Login';
      continue;
    }

    const english = en.affiliateProgram[key];
    const translated = await googleTranslate(english, googleCode);
    out[key] = translated && translated !== english ? translated : english;
    await new Promise((r) => setTimeout(r, 120));
  }

  // Force preserve tokens back if translation mangled them
  for (const [key, val] of Object.entries(out)) {
    let fixed = val;
    for (const term of PRESERVE) {
      if (en.affiliateProgram[key]?.includes(term) && !fixed.includes(term)) {
        fixed = en.affiliateProgram[key].replace(
          new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          term,
        );
        // If full replace failed, patch common cases
        if (fixed === en.affiliateProgram[key]) {
          fixed = val; // keep translation
        }
      }
    }
    out[key] = fixed;
  }

  out.partnersEmail = 'partners@ibets24.com';
  out.ctaPortal = 'Affiliate Portal Login';
  return out;
}

async function main() {
  for (const [lang, code] of Object.entries(LANGS)) {
    console.log(`Translating ${lang} (${code})...`);
    const data = await translateLang(lang, code);
    writeFileSync(join(dir, `${lang}.json`), `${JSON.stringify(data, null, 2)}\n`);
    console.log(`  Wrote ${lang}.json (${Object.keys(data).length} keys)`);
  }
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
