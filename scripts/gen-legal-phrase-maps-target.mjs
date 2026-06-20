import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const phrases = JSON.parse(readFileSync(join(root, 'scripts/legal-phrases.json'), 'utf8'));
const outDir = join(root, 'src/content/legal/phraseMaps');

/** locale code -> MyMemory target language code */
const LANG_TARGETS = {
  he: 'he',
  fa: 'fa',
  ur: 'ur',
  hi: 'hi',
  bn: 'bn',
  id: 'id',
  fil: 'tl',
  ms: 'ms',
  sw: 'sw',
  be: 'be',
  bg: 'bg',
  kk: 'kk',
  uz: 'uz',
  tg: 'tg',
  mn: 'mn',
  hy: 'hy',
  ka: 'ka',
  km: 'km',
  lt: 'lt',
  lv: 'lv',
  mk: 'mk',
  sq: 'sq',
  sr: 'sr',
  sl: 'sl',
  sk: 'sk',
  hr: 'hr',
  hu: 'hu',
  ro: 'ro',
  el: 'el',
  et: 'et',
};

const PRESERVE = [
  'iBets24',
  'partners@ibets24.com',
  'GamCare',
  'Gamblers Anonymous',
  'BeGambleAware',
  'AML',
  'RNG',
  'FAQ',
  'Live Chat',
  'Cookie Policy',
];

function preserveTerms(original, translated) {
  let result = translated;
  for (const term of PRESERVE) {
    if (!original.includes(term)) continue;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped, 'gi');
    if (!re.test(result)) {
      result = result.replace(
        new RegExp(`(${escaped.slice(0, Math.max(3, term.length - 2))}[^\\s,.;)]*)`, 'i'),
        term,
      );
      if (!result.includes(term)) {
        const idx = original.indexOf(term);
        if (idx >= 0) {
          const before = original.slice(0, idx);
          const after = original.slice(idx + term.length);
          const beforeTranslated = before ? result.slice(0, Math.min(result.length, before.length + 20)) : '';
          result = beforeTranslated + term + (after ? result.slice(beforeTranslated.length + term.length) : '');
        }
      }
    }
    result = result.replace(new RegExp(escaped, 'gi'), term);
  }
  if (original.includes('(AML)') && !result.includes('(AML)') && !result.includes('AML')) {
    result = result.replace(/anti-money laundering/i, 'anti-money laundering (AML)');
  }
  if (original.includes('(RNG)') && !result.includes('RNG')) {
    result = result.replace(/random number generators?/i, (m) => `${m} (RNG)`);
  }
  return result;
}

async function translatePhrase(text, targetLang, attempt = 0) {
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text.slice(0, 500));
  url.searchParams.set('langpair', `en|${targetLang}`);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const status = data?.responseStatus;
    if (status === 429 || status === 403) {
      if (attempt < 5) {
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
        return translatePhrase(text, targetLang, attempt + 1);
      }
    }
    const translated = data?.responseData?.translatedText ?? text;
    return preserveTerms(text, translated);
  } catch (err) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      return translatePhrase(text, targetLang, attempt + 1);
    }
    return text;
  }
}

async function buildMap(langCode, targetLang) {
  const outPath = join(outDir, `${langCode}.json`);
  const map = {};
  const concurrency = 3;

  for (let i = 0; i < phrases.length; i += concurrency) {
    const batch = phrases.slice(i, i + concurrency);
    const translated = await Promise.all(
      batch.map((phrase) => translatePhrase(phrase, targetLang)),
    );
    batch.forEach((phrase, index) => {
      map[phrase] = translated[index];
    });
    process.stdout.write(`\r${langCode}: ${Math.min(i + concurrency, phrases.length)}/${phrases.length}`);
    await new Promise((r) => setTimeout(r, 500));
  }

  writeFileSync(outPath, `${JSON.stringify(map, null, 2)}\n`);
  const translatedCount = Object.entries(map).filter(([k, v]) => k !== v).length;
  console.log(`\nsaved ${langCode}.json: ${Object.keys(map).length} keys (${translatedCount} translated)`);
  return { langCode, keys: Object.keys(map).length, translated: translatedCount };
}

mkdirSync(outDir, { recursive: true });

const requested = process.argv.slice(2);
const entries = requested.length
  ? requested.map((code) => [code, LANG_TARGETS[code] ?? code])
  : Object.entries(LANG_TARGETS);

const summary = [];
for (const [code, target] of entries) {
  summary.push(await buildMap(code, target));
}

console.log('\n=== Summary ===');
for (const row of summary) {
  console.log(`${row.langCode}.json: ${row.keys} keys (${row.translated} translated)`);
}
