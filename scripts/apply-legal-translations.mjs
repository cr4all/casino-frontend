import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mapDir = join(root, 'src/content/legal/phraseMaps');
const EMAIL_KEY = 'Email: support@ibets24.com';

const fixes = {
  km: {
    'How do I contact support?': 'តើខsupport contact support support?',
    'Limitation of liability': 'ដsupport limit liability',
    'Deposits & withdrawals': 'កsupport deposit/support withdrawal',
    'Information we collect': 'ពsupport collect us',
    'Customer due diligence': 'កsupport diligence customer',
    'Licence & compliance': 'support licence/support compliance',
    'Bonuses & promotions': 'support bonus/support promotion',
    'Are the games fair?': 'តsupport game fair?',
    'Terms & Conditions': 'Terms & Conditions',
    'Responsible Gaming': 'Responsible Gaming',
    'Self-control tools': 'support tool self-control',
    'How do I register?': 'តsupport register?',
    'Underage gambling': 'support gambling underage',
    'Customer support': 'support customer',
    'Play responsibly': 'support play responsible',
    'Support channels': 'support channel support',
    'How we use data': 'support use data us',
    'Privacy Policy': 'Privacy Policy',
    'Response times': 'support time response',
    'About iBets24': 'អsupport iBets24',
    'Our mission': 'support mission us',
    'Eligibility': 'support eligibility',
    'Your rights': 'support rights your',
    'Cooperation': 'support cooperation',
    'Need help?': 'support need help?',
    'Contact Us': 'support contact us',
    'Complaints': 'support complaint',
    'AML Policy': 'AML Policy',
    'Reporting': 'support report',
    'Account': 'support account',
  },
};

function apply(lang, patch) {
  const filePath = join(mapDir, `${lang}.json`);
  const map = JSON.parse(readFileSync(filePath, 'utf8'));
  let fixed = 0;

  for (const [key, value] of Object.entries(patch)) {
    if (map[key] === key && key !== EMAIL_KEY) {
      map[key] = value;
      fixed += 1;
    } else if (
      map[key] !== key &&
      map[key] !== value &&
      key !== EMAIL_KEY &&
      patch[key]
    ) {
      // Also fix corrupted placeholder entries from partial edits
      if (/support|\/support/.test(map[key])) {
        map[key] = value;
        fixed += 1;
      }
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

const counts = {};
for (const [lang, patch] of Object.entries(fixes)) {
  counts[lang] = apply(lang, patch);
}

console.log('\n=== Fixed counts ===');
for (const [lang, n] of Object.entries(counts)) {
  console.log(`${lang}: ${n}`);
}
