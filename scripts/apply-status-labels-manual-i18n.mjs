/**
 * Apply curated status/txTypes labels (paid, Loss, Cashout) for priority locales.
 */
import { readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { en } from '../src/i18n/locales/en.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src/i18n/locales');

const EXPORT_NAMES = {
  'ar-ma': 'arMa', 'ar-dz': 'arDz', 'ar-tn': 'arTn', 'de-be': 'deBe', 'fr-be': 'frBe',
  'nl-be': 'nlBe', 'pt-br': 'ptBr', 'zh-tw': 'zhTw',
};

const MANUAL = {
  ko: { paid: '지급 완료', won: '승리', lost: '패배', cashout: '캐시아웃', loss: '패배' },
  de: { paid: 'bezahlt', won: 'Gewinn', lost: 'Verlust', cashout: 'Cashout', loss: 'Verlust' },
  'de-be': { paid: 'bezahlt', won: 'Gewinn', lost: 'Verlust', cashout: 'Cashout', loss: 'Verlust' },
  es: { paid: 'pagado', won: 'Ganado', lost: 'Pérdida', cashout: 'Cashout', loss: 'Pérdida' },
  it: { paid: 'pagato', won: 'Vinto', lost: 'Perdita', cashout: 'Cashout', loss: 'Perdita' },
  pt: { paid: 'pago', won: 'Ganho', lost: 'Perda', cashout: 'Cashout', loss: 'Perda' },
  'pt-br': { paid: 'pago', won: 'Ganho', lost: 'Perda', cashout: 'Cashout', loss: 'Perda' },
  ar: { paid: 'مدفوع', won: 'فوز', lost: 'خسارة', cashout: 'كاش أوت', loss: 'خسارة' },
  'ar-dz': { paid: 'مدفوع', won: 'فوز', lost: 'خسارة', cashout: 'كاش أوت', loss: 'خسارة' },
  'ar-ma': { paid: 'مدفوع', won: 'فوز', lost: 'خسارة', cashout: 'كاش أوت', loss: 'خسارة' },
  'ar-tn': { paid: 'مدفوع', won: 'فوز', lost: 'خسارة', cashout: 'كاش أوت', loss: 'خسارة' },
  sq: { paid: 'paguar', won: 'Fitore', lost: 'Humbje', cashout: 'Cashout', loss: 'Humbje' },
  tr: { paid: 'ödendi', won: 'Kazanç', lost: 'Kayıp', cashout: 'Cashout', loss: 'Kayıp' },
  ja: { paid: '支払済み', won: '勝ち', lost: '負け', cashout: 'キャッシュアウト', loss: '負け' },
  zh: { paid: '已支付', won: '赢', lost: '输', cashout: '兑现', loss: '输' },
  'zh-tw': { paid: '已支付', won: '贏', lost: '輸', cashout: '兌現', loss: '輸' },
  fr: { paid: 'payé', won: 'Gagné', lost: 'Perte', cashout: 'Cashout', loss: 'Perte' },
  'fr-be': { paid: 'payé', won: 'Gagné', lost: 'Perte', cashout: 'Cashout', loss: 'Perte' },
  ru: { paid: 'оплачено', won: 'Выигрыш', lost: 'Проигрыш', cashout: 'Кэшаут', loss: 'Проигрыш' },
  nl: { paid: 'betaald', won: 'Winst', lost: 'Verlies', cashout: 'Cashout', loss: 'Verlies' },
  'nl-be': { paid: 'betaald', won: 'Winst', lost: 'Verlies', cashout: 'Cashout', loss: 'Verlies' },
  vi: { paid: 'đã thanh toán', won: 'Thắng', lost: 'Thua', cashout: 'Cashout', loss: 'Thua' },
  th: { paid: 'จ่ายแล้ว', won: 'ชนะ', lost: 'แพ้', cashout: 'แคชเอาต์', loss: 'แพ้' },
  id: { paid: 'dibayar', won: 'Menang', lost: 'Kalah', cashout: 'Cashout', loss: 'Kalah' },
  pl: { paid: 'opłacone', won: 'Wygrana', lost: 'Przegrana', cashout: 'Cashout', loss: 'Przegrana' },
};

function writeLocaleFile(langCode, tree) {
  const exportName = EXPORT_NAMES[langCode] ?? langCode.replace(/-/g, '');
  writeFileSync(
    join(localesDir, `${langCode}.ts`),
    `import type { LocaleTree } from './en';\n\nexport const ${exportName}: LocaleTree = ${JSON.stringify(tree, null, 2)};\n`,
  );
}

async function loadLocale(langCode) {
  const exportName = EXPORT_NAMES[langCode] ?? langCode.replace(/-/g, '');
  const mod = await import(pathToFileURL(join(localesDir, `${langCode}.ts`)).href);
  return structuredClone(mod[exportName]);
}

let updated = 0;
for (const langCode of Object.keys(MANUAL)) {
  const m = MANUAL[langCode];
  const locale = await loadLocale(langCode);
  if (!locale.status) locale.status = {};
  if (!locale.txTypes) locale.txTypes = {};

  let changed = false;
  const setIfNeeded = (obj, key, english, next) => {
    if (obj[key] == null || obj[key] === english) {
      obj[key] = next;
      changed = true;
    }
  };

  setIfNeeded(locale.status, 'paid', en.status.paid, m.paid);
  setIfNeeded(locale.status, 'won', en.status.won, m.won);
  setIfNeeded(locale.status, 'lost', en.status.lost, m.lost);
  setIfNeeded(locale.status, 'cashout', en.status.cashout, m.cashout);
  setIfNeeded(locale.txTypes, 'loss', en.txTypes.loss, m.loss);
  setIfNeeded(locale.txTypes, 'cashout', en.txTypes.cashout, m.cashout);

  if (!changed) {
    console.log(`${langCode}: complete`);
    continue;
  }

  writeLocaleFile(langCode, locale);
  console.log(`${langCode}: updated status/tx labels`);
  updated++;
}
console.log(`done (${updated} locales)`);
