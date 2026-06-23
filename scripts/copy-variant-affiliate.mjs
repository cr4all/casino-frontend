import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { de } from '../src/i18n/locales/de.ts';
import { deBe } from '../src/i18n/locales/de-be.ts';
import { nl } from '../src/i18n/locales/nl.ts';
import { nlBe } from '../src/i18n/locales/nl-be.ts';
import { fr } from '../src/i18n/locales/fr.ts';
import { frBe } from '../src/i18n/locales/fr-be.ts';
import { ar } from '../src/i18n/locales/ar.ts';
import { arMa } from '../src/i18n/locales/ar-ma.ts';
import { arDz } from '../src/i18n/locales/ar-dz.ts';
import { arTn } from '../src/i18n/locales/ar-tn.ts';

const localesDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src/i18n/locales');

function writeLocale(exportName, fileName, tree) {
  writeFileSync(
    join(localesDir, fileName),
    `import type { LocaleTree } from './en';\n\nexport const ${exportName}: LocaleTree = ${JSON.stringify(tree, null, 2)};\n`,
  );
}

writeLocale('deBe', 'de-be.ts', { ...deBe, affiliate: de.affiliate });
writeLocale('nlBe', 'nl-be.ts', { ...nlBe, affiliate: nl.affiliate });
writeLocale('frBe', 'fr-be.ts', { ...frBe, affiliate: fr.affiliate });
writeLocale('arMa', 'ar-ma.ts', { ...arMa, affiliate: ar.affiliate });
writeLocale('arDz', 'ar-dz.ts', { ...arDz, affiliate: ar.affiliate });
writeLocale('arTn', 'ar-tn.ts', { ...arTn, affiliate: ar.affiliate });

console.log('variant affiliate sections copied');
