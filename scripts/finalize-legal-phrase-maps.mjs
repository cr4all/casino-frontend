import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const phrases = JSON.parse(readFileSync(join(root, 'scripts/legal-phrases.json'), 'utf8'));
const mapDir = join(root, 'src/content/legal/phraseMaps');
const EMAIL_KEY = 'Email: partners@ibets24.com';

const filFixes = {
  'Limitation of liability': 'Limitasyon ng pananagutan',
  'Deposits & withdrawals': 'Deposito at pag-withdraw',
  'Information we collect': 'Impormasyong kinokolekta namin',
  'Customer due diligence': 'Due diligence ng customer',
  'Licence & compliance': 'Lisensya at pagsunod',
  'Bonuses & promotions': 'Bonus at promosyon',
  'Terms & Conditions': 'Mga Tuntunin at Kundisyon',
  'Responsible Gaming': 'Responsableng paglalaro',
  'Self-control tools': 'Mga kasangkapan sa pagkontrol sa sarili',
  'Underage gambling': 'Pagsusugal ng menor de edad',
  'Customer support': 'Suporta sa customer',
  'Support channels': 'Mga channel ng suporta',
  'Privacy Policy': 'Patakaran sa Privacy',
  'Response times': 'Oras ng pagtugon',
  'Eligibility': 'Pagiging kwalipikado',
  'Cooperation': 'Pakikipagtulungan',
  'Contact Us': 'Makipag-ugnayan sa Amin',
  'Complaints': 'Mga reklamo',
  'AML Policy': 'Patakaran sa AML',
  'Reporting': 'Pag-uulat',
  'Account': 'Account',
  'Cookies': 'Cookies',
  'FAQ': 'FAQ',
};

function buildMap(lang, values) {
  if (values.length !== phrases.length) {
    throw new Error(`${lang}: expected ${phrases.length} values, got ${values.length}`);
  }
  return Object.fromEntries(phrases.map((key, i) => [key, values[i]]));
}

function patchEqual(lang, patch) {
  const filePath = join(mapDir, `${lang}.json`);
  const map = JSON.parse(readFileSync(filePath, 'utf8'));
  let fixed = 0;

  for (const [key, value] of Object.entries(patch)) {
    if (key === EMAIL_KEY) continue;
    if (map[key] === key) {
      map[key] = value;
      fixed += 1;
    }
  }

  writeFileSync(filePath, `${JSON.stringify(map, null, 2)}\n`);
  const remaining = Object.entries(map).filter(
    ([k, v]) => k === v && k !== EMAIL_KEY,
  ).length;
  console.log(
    `${lang}: fixed ${fixed}, remaining equal (excl email): ${remaining}, keys: ${Object.keys(map).length}`,
  );
  return fixed;
}

function writeMap(lang, map) {
  const filePath = join(mapDir, `${lang}.json`);
  const before = JSON.parse(readFileSync(filePath, 'utf8'));
  const fixed = Object.entries(map).filter(
    ([k, v]) => k !== EMAIL_KEY && before[k] === k && v !== k,
  ).length;
  writeFileSync(filePath, `${JSON.stringify(map, null, 2)}\n`);
  const remaining = Object.entries(map).filter(
    ([k, v]) => k === v && k !== EMAIL_KEY,
  ).length;
  console.log(
    `${lang}: fixed ${fixed}, remaining equal (excl email): ${remaining}, keys: ${Object.keys(map).length}`,
  );
  return fixed;
}

const kmValues = JSON.parse(
  readFileSync(join(root, 'scripts/legal-translation-data/km.json'), 'utf8'),
);
const kmFixed = writeMap('km', buildMap('km', kmValues));

const kaValues = JSON.parse(
  readFileSync(join(root, 'scripts/legal-translation-data/ka.json'), 'utf8'),
);
const kaFixed = writeMap('ka', buildMap('ka', kaValues));

const filFixed = patchEqual('fil', filFixes);

console.log('\n=== Fixed counts ===');
console.log(`km: ${kmFixed}`);
console.log(`ka: ${kaFixed}`);
console.log(`fil: ${filFixed}`);
