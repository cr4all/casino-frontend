import { readFileSync, writeFileSync } from 'node:fs';
const p = new URL('./gen-override-hy-ka-km.mjs', import.meta.url);
let s = readFileSync(p, 'utf8');
s = s.replace(/"[^"]*aregistri[^"]*"/, '"რეგისტრირებული"');
writeFileSync(p, s);
console.log('fixed');
