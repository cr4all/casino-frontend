const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src/i18n/locales');

for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.ts') || file === 'en.ts' || file === 'affiliate.i18n.ts') continue;

  const filePath = path.join(dir, file);
  let src = fs.readFileSync(filePath, 'utf8');

  if (!src.includes('affiliate:')) continue;

  if (!src.includes("from './affiliate.i18n'")) {
    src = `import { affiliateI18n } from './affiliate.i18n';\n${src}`;
  }

  src = src.replace(/  affiliate: \{[\s\S]*?\n  \},/m, '  affiliate: affiliateI18n,');

  fs.writeFileSync(filePath, src);
  console.log('patched', file);
}
