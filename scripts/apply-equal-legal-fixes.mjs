import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const mapDir = join(root, 'src/content/legal/phraseMaps');
const EMAIL_KEY = 'Email: partners@ibets24.com';

const fixes = {
  fil: {
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
  },
  ka: {
    'How long do withdrawals take?': 'რამდენ ხანს სჭირდება გამოტანა?',
    'How do I contact support?': 'როგორ დავუკავშირდე მხარდაჭერას?',
    'Limitation of liability': 'პასუხისმგებლობის შეზღუდვა',
    'Deposits & withdrawals': 'შეტანა და გამოტანა',
    'Information we collect': 'ინფორმაცია, რომელსაც ვაგროვებთ',
    'Customer due diligence': 'მომხმარებლის შემოწმება',
    'Licence & compliance': 'ლიცენზია და შესაბამისობა',
    'Bonuses & promotions': 'ბონუსები და აქციები',
    'Are the games fair?': 'სამართლიანია თამაში?',
    'Terms & Conditions': 'Terms & Conditions',
    'Responsible Gaming': 'Responsible Gaming',
    'Self-control tools': 'თვითკონტროლის ინსტრუმენტები',
    'How do I register?': 'როგორ დავრეგისტრირდე?',
    'Underage gambling': 'არასრულწლოვანების აზარტული თამაში',
    'Customer support': 'მომხმარებელთა მხარდაჭერა',
    'Play responsibly': 'ითამაშეთ პასუხისმგებლად',
    'Support channels': 'მხარდაჭერის არხები',
    'How we use data': 'როგორ ვიყენებთ მონაცემებს',
    'Privacy Policy': 'Privacy Policy',
    'Response times': 'პასუხის დრო',
    'About iBets24': 'iBets24-ის შესახებ',
    'Our mission': 'ჩვენი მისია',
    'Eligibility': 'მონაწილეობის უფლება',
    'Your rights': 'თქვენი უფლებები',
    'Cooperation': 'თანამშრომლობა',
    'Need help?': 'გჭირდებათ დახმარება?',
    'Contact Us': 'დაგვიკავშირდით',
    'Complaints': 'საჩივრები',
    'AML Policy': 'AML Policy',
    'Reporting': 'ანგარიშგება',
    'Account': 'ანგარიში',
    'Cookies': 'Cookies',
    'FAQ': 'FAQ',
  },
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
    if (key === EMAIL_KEY) continue;
    const current = map[key];
    const needsFix =
      current === key ||
      (lang === 'km' && typeof current === 'string' && /\/support|support limit|support deposit/.test(current));
    if (needsFix) {
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

const counts = {};
for (const [lang, patch] of Object.entries(fixes)) {
  counts[lang] = apply(lang, patch);
}

console.log('\n=== Fixed counts ===');
for (const [lang, n] of Object.entries(counts)) {
  console.log(`${lang}: ${n}`);
}
