import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const NEW = [
  'az', 'be', 'bg', 'bn', 'fa', 'he', 'hy', 'ka', 'kk', 'km', 'lt', 'mn', 'ms', 'nl',
  'ro', 'sv', 'sw', 'tg', 'th', 'uk', 'uz', 'vi', 'zh-tw',
];

const root = join(import.meta.dirname, '..');
const dir = join(root, 'src/i18n/locales');
const pmDir = join(root, 'src/i18n/phraseMaps');
const ovDir = join(root, 'src/i18n/overrides');
const corruptPattern = /allOyunlar|loadingOyunlar|paymentMetods|gameMərclər|loadingИгри|allИгри|allগেমস/;

for (const lang of NEW) {
  const content = readFileSync(join(dir, `${lang}.ts`), 'utf8');
  const hasStubLoading =
    content.includes('"loading": "Loading..."') || content.includes("loading: 'Loading...'");
  const hasLoginEn = content.includes('"login": "Login"') || content.includes("login: 'Login'");
  const hasCorruptKeys = corruptPattern.test(content);
  const pm = existsSync(join(pmDir, `${lang}.json`));
  const ov = existsSync(join(ovDir, `${lang}.json`));

  let status = 'OK';
  if (hasCorruptKeys) status = 'CORRUPT_KEYS';
  else if (hasStubLoading) status = 'STUB';
  else if (hasLoginEn) status = 'PARTIAL';

  console.log(`${lang}\t${status}\tmap=${pm ? 'yes' : 'no'}\toverride=${ov ? 'yes' : 'no'}`);
}
