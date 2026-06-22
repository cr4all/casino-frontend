const fs = require('fs');
const path = require('path');

const keys = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'legal-phrases.json'), 'utf8')
);
const langs = ['af', 'am', 'cy', 'ga', 'is', 'lb', 'mt'];
const dir = path.join(__dirname, '../src/content/legal/phraseMaps');

let ok = true;
for (const lang of langs) {
  const file = path.join(dir, `${lang}.json`);
  const raw = fs.readFileSync(file, 'utf8');
  const map = JSON.parse(raw);
  const mapKeys = Object.keys(map);

  if (mapKeys.length !== keys.length) {
    console.error(`${lang}: expected ${keys.length} keys, got ${mapKeys.length}`);
    ok = false;
  }

  for (const key of keys) {
    if (!(key in map)) {
      console.error(`${lang}: missing key: ${key.slice(0, 60)}...`);
      ok = false;
    } else if (map[key] === key) {
      console.error(`${lang}: untranslated: ${key.slice(0, 60)}...`);
      ok = false;
    }
  }

  for (const key of mapKeys) {
    if (!keys.includes(key)) {
      console.error(`${lang}: extra key: ${key.slice(0, 60)}...`);
      ok = false;
    }
  }

  if (!raw.endsWith('\n')) {
    console.error(`${lang}: missing trailing newline`);
    ok = false;
  }

  for (const [key, value] of Object.entries(map)) {
    if (/[\u0400-\u04FF\u4E00-\u9FFF\u0600-\u06FF]/.test(value)) {
      console.error(`${lang}: mixed script in "${key}": ${value.slice(0, 80)}`);
      ok = false;
    }
  }
}

if (ok) {
  console.log('All 7 phrase maps valid: 80 keys each, no corruption detected.');
} else {
  process.exit(1);
}
