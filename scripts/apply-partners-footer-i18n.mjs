#!/usr/bin/env node
/** Apply curated Partners footer labels to all locale + i18n phrase map files. */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localesDir = join(root, 'src/i18n/locales');
const i18nMapsDir = join(root, 'src/i18n/phraseMaps');

const FOOTER_EN = {
  partners: 'Partners',
  affiliateProgram: 'Affiliate Program',
  becomePartner: 'Become a Partner',
};

const VARIANT = {
  'ar-dz': 'ar',
  'ar-ma': 'ar',
  'ar-tn': 'ar',
  'de-be': 'de',
  'fr-be': 'fr',
  'nl-be': 'nl',
};

const MANUAL = {
  ko: { partners: '파트너', affiliateProgram: '제휴 프로그램', becomePartner: '파트너 되기' },
  de: { partners: 'Partner', affiliateProgram: 'Partnerprogramm', becomePartner: 'Partner werden' },
  es: { partners: 'Partners', affiliateProgram: 'Programa de afiliados', becomePartner: 'Hazte partner' },
  fr: { partners: 'Partenaires', affiliateProgram: "Programme d'affiliation", becomePartner: 'Devenir partenaire' },
  it: { partners: 'Partner', affiliateProgram: 'Programma affiliati', becomePartner: 'Diventa partner' },
  pt: { partners: 'Parceiros', affiliateProgram: 'Programa de afiliados', becomePartner: 'Torne-se parceiro' },
  'pt-br': { partners: 'Parceiros', affiliateProgram: 'Programa de afiliados', becomePartner: 'Seja um parceiro' },
  ar: { partners: 'الشركاء', affiliateProgram: 'برنامج الشركاء', becomePartner: 'كن شريكاً' },
  tr: { partners: 'Ortaklar', affiliateProgram: 'Ortaklık Programı', becomePartner: 'Ortak Olun' },
  ja: { partners: 'パートナー', affiliateProgram: 'アフィリエイトプログラム', becomePartner: 'パートナーになる' },
  zh: { partners: '合作伙伴', affiliateProgram: '联盟计划', becomePartner: '成为合作伙伴' },
  'zh-tw': { partners: '合作夥伴', affiliateProgram: '聯盟計畫', becomePartner: '成為合作夥伴' },
  ru: { partners: 'Партнёры', affiliateProgram: 'Партнёрская программа', becomePartner: 'Стать партнёром' },
  nl: { partners: 'Partners', affiliateProgram: 'Affiliateprogramma', becomePartner: 'Word partner' },
  pl: { partners: 'Partnerzy', affiliateProgram: 'Program partnerski', becomePartner: 'Zostań partnerem' },
  sq: { partners: 'Partnerët', affiliateProgram: 'Programi i afiliatëve', becomePartner: 'Bëhu partner' },
  da: { partners: 'Partnere', affiliateProgram: 'Affiliateprogram', becomePartner: 'Bliv partner' },
  fi: { partners: 'Kumppanit', affiliateProgram: 'Affiliate-ohjelma', becomePartner: 'Ryhdy kumppaniksi' },
  sv: { partners: 'Partners', affiliateProgram: 'Affiliateprogram', becomePartner: 'Bli partner' },
  no: { partners: 'Partnere', affiliateProgram: 'Affiliateprogram', becomePartner: 'Bli partner' },
  cs: { partners: 'Partneři', affiliateProgram: 'Partnerský program', becomePartner: 'Staňte se partnerem' },
  sk: { partners: 'Partneri', affiliateProgram: 'Partnerský program', becomePartner: 'Staňte sa partnerom' },
  hu: { partners: 'Partnerek', affiliateProgram: 'Partnerprogram', becomePartner: 'Legyen partner' },
  ro: { partners: 'Parteneri', affiliateProgram: 'Program de afiliere', becomePartner: 'Devino partener' },
  bg: { partners: 'Партньори', affiliateProgram: 'Партньорска програма', becomePartner: 'Станете партньор' },
  uk: { partners: 'Партнери', affiliateProgram: 'Партнерська програма', becomePartner: 'Стати партнером' },
  el: { partners: 'Συνεργάτες', affiliateProgram: 'Πρόγραμμα συνεργατών', becomePartner: 'Γίνετε συνεργάτης' },
  hr: { partners: 'Partneri', affiliateProgram: 'Partnerski program', becomePartner: 'Postanite partner' },
  sr: { partners: 'Partneri', affiliateProgram: 'Partnerski program', becomePartner: 'Postanite partner' },
  sl: { partners: 'Partnerji', affiliateProgram: 'Partnerski program', becomePartner: 'Postanite partner' },
  id: { partners: 'Mitra', affiliateProgram: 'Program afiliasi', becomePartner: 'Jadi mitra' },
  vi: { partners: 'Đối tác', affiliateProgram: 'Chương trình liên kết', becomePartner: 'Trở thành đối tác' },
  th: { partners: 'พาร์ทเนอร์', affiliateProgram: 'โปรแกรมพันธมิตร', becomePartner: 'เป็นพาร์ทเนอร์' },
  hi: { partners: 'पार्टनर', affiliateProgram: 'एफिलिएट प्रोग्राम', becomePartner: 'पार्टनर बनें' },
  he: { partners: 'שותפים', affiliateProgram: 'תוכנית שותפים', becomePartner: 'הפוך לשותף' },
  fa: { partners: 'شرکا', affiliateProgram: 'برنامه همکاری', becomePartner: 'شریک شوید' },
  ur: { partners: 'پارٹنرز', affiliateProgram: 'افیلیئٹ پروگرام', becomePartner: 'پارٹنر بنیں' },
  ms: { partners: 'Rakan kongsi', affiliateProgram: 'Program afiliasi', becomePartner: 'Jadi rakan kongsi' },
  fil: { partners: 'Mga Partner', affiliateProgram: 'Programa ng Affiliate', becomePartner: 'Maging Partner' },
  lt: { partners: 'Partneriai', affiliateProgram: 'Partnerių programa', becomePartner: 'Tapkite partneriu' },
  lv: { partners: 'Partneri', affiliateProgram: 'Partneru programma', becomePartner: 'Kļūstiet par partneri' },
  et: { partners: 'Partnerid', affiliateProgram: 'Partnerlusprogramm', becomePartner: 'Saa partneriks' },
  mk: { partners: 'Партнери', affiliateProgram: 'Партнерска програма', becomePartner: 'Станете партнер' },
  az: { partners: 'Tərəfdaşlar', affiliateProgram: 'Tərəfdaşlıq proqramı', becomePartner: 'Tərəfdaş olun' },
  ka: { partners: 'პარტნიორები', affiliateProgram: 'პარტნიორული პროგრამა', becomePartner: 'გახდი პარტნიორი' },
  kk: { partners: 'Серіктестер', affiliateProgram: 'Серіктестік бағдарламасы', becomePartner: 'Серіктес болыңыз' },
  uz: { partners: 'Hamkorlar', affiliateProgram: 'Hamkorlik dasturi', becomePartner: "Hamkor bo'ling" },
  bn: { partners: 'পার্টনার', affiliateProgram: 'অ্যাফিলিয়েট প্রোগ্রাম', becomePartner: 'পার্টনার হোন' },
  cy: { partners: 'Partneriaid', affiliateProgram: 'Rhaglen affiliate', becomePartner: 'Dod yn bartner' },
  ga: { partners: 'Comhpháirtithe', affiliateProgram: 'Clár affiliate', becomePartner: 'Bí i do chomhpháirtí' },
  is: { partners: 'Samstarfsaðilar', affiliateProgram: 'Fylgiprogram', becomePartner: 'Vertu samstarfsaðili' },
  mt: { partners: 'Imsieħba', affiliateProgram: "Programm ta' affiljazzjoni", becomePartner: 'Sir sieħeb' },
  af: { partners: 'Vennote', affiliateProgram: 'Affiliaatprogram', becomePartner: "Word 'n vennoot" },
  am: { partners: 'አጋሮች', affiliateProgram: 'የአጋር ፕሮግራም', becomePartner: 'አጋር ይሁኑ' },
  be: { partners: 'Партнёры', affiliateProgram: 'Партнёрская праграма', becomePartner: 'Стаць партнёрам' },
  hy: { partners: 'Գործընկերներ', affiliateProgram: 'Գործընկերային ծրագիր', becomePartner: 'Դարձեք գործընկեր' },
  lb: { partners: 'Partneren', affiliateProgram: 'Partnerprogramm', becomePartner: 'Gitt Partner' },
  mn: { partners: 'Түншүүд', affiliateProgram: 'Түншлэлийн хөтөлбөр', becomePartner: 'Түнш болоорой' },
  ne: { partners: 'पार्टनरहरू', affiliateProgram: 'एफिलिएट प्रोग्राम', becomePartner: 'पार्टनर बन्नुहोस्' },
  si: { partners: 'හවුල්කරුවන්', affiliateProgram: 'අනුබද්ධ වැඩසටහන', becomePartner: 'හවුල්කරුවෙකු වන්න' },
  sw: { partners: 'Washirika', affiliateProgram: 'Programu ya affiliate', becomePartner: 'Kuwa mshirika' },
  so: { partners: 'Lammaanayaasha', affiliateProgram: 'Barnaamijka affiliate', becomePartner: 'Noqo lammaane' },
  yo: { partners: 'Awọn alabaṣepọ', affiliateProgram: 'Eto affiliate', becomePartner: 'Di alabaṣepọ' },
  zu: { partners: 'Abalingani', affiliateProgram: 'Uhlelo lwama-affiliate', becomePartner: 'Yiba umlingani' },
  gu: { partners: 'ભાગીદારો', affiliateProgram: 'એફિલિએટ પ્રોગ્રામ', becomePartner: 'ભાગીદાર બનો' },
  ha: { partners: 'Abokan hulɗa', affiliateProgram: 'Shirin affiliate', becomePartner: 'Zama abokin hulɗa' },
  ig: { partners: 'Ndị mmekọ', affiliateProgram: 'Mmemme affiliate', becomePartner: 'Bụrụ onye mmekọ' },
  kn: { partners: 'ಪಾಲುದಾರರು', affiliateProgram: 'ಅಫಿಲಿಯೇಟ್ ಪ್ರೋಗ್ರಾಂ', becomePartner: 'ಪಾಲುದಾರರಾಗಿ' },
  km: { partners: 'ដៃគូ', affiliateProgram: 'កម្មវិធីសម្ព័ន្ធ', becomePartner: 'ក្លាយជាដៃគូ' },
  lo: { partners: 'ຄູ່ຮ່ວມງານ', affiliateProgram: 'ໂຄງການແອຟຟິລຽດ', becomePartner: 'ກາຍເປັນຄູ່ຮ່ວມງານ' },
  ml: { partners: 'പങ്കാളികൾ', affiliateProgram: 'അഫിലിയേറ്റ് പ്രോഗ്രാം', becomePartner: 'പങ്കാളിയാകുക' },
  mr: { partners: 'भागीदार', affiliateProgram: 'अॅफिलिएट प्रोग्राम', becomePartner: 'भागीदार व्हा' },
  my: { partners: 'မိတ်ဖက်များ', affiliateProgram: 'မိတ်ဖက်အစီအစဉ်', becomePartner: 'မိတ်ဖက်ဖြစ်လာရန်' },
  pa: { partners: 'ਭਾਈਵਾਲ', affiliateProgram: 'ਅਫੀਲੀਏਟ ਪ੍ਰੋਗਰਾਮ', becomePartner: 'ਭਾਈਵਾਲ ਬਣੋ' },
  ta: { partners: 'பங்குதாரர்கள்', affiliateProgram: 'இணைப்பு நிரல்', becomePartner: 'பங்குதாரராகுங்கள்' },
  te: { partners: 'భాగస్వాములు', affiliateProgram: 'అనుబంధ కార్యక్రమం', becomePartner: 'భాగస్వామి అవ్వండి' },
  tg: { partners: 'Шарикҳо', affiliateProgram: 'Барномаи шарикӣ', becomePartner: 'Шарик шавед' },
};

function escapeDouble(value) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function patchLocale(code, footer) {
  const filePath = join(localesDir, `${code}.ts`);
  let content = readFileSync(filePath, 'utf8');
  for (const [key, value] of Object.entries(footer)) {
    const re = new RegExp(`("${key}"\\s*:\\s*")(?:\\\\.|[^"\\\\])*(")`);
    if (!re.test(content)) {
      console.warn(`missing key ${code}.${key}`);
      continue;
    }
    content = content.replace(re, `$1${escapeDouble(value)}$2`);
  }
  writeFileSync(filePath, content);

  const mapPath = join(i18nMapsDir, `${code}.json`);
  if (existsSync(mapPath)) {
    const map = JSON.parse(readFileSync(mapPath, 'utf8'));
    map[FOOTER_EN.partners] = footer.partners;
    map[FOOTER_EN.affiliateProgram] = footer.affiliateProgram;
    map[FOOTER_EN.becomePartner] = footer.becomePartner;
    writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`);
  }
}

const locales = readdirSync(localesDir)
  .filter((f) => f.endsWith('.ts') && f !== 'en.ts')
  .map((f) => f.replace(/\.ts$/, ''));

let applied = 0;
for (const code of locales) {
  const footer = MANUAL[code] ?? (VARIANT[code] ? MANUAL[VARIANT[code]] : null);
  if (!footer) {
    console.warn(`no curated footer for ${code}`);
    continue;
  }
  patchLocale(code, footer);
  applied += 1;
}

console.log(`applied ${applied}/${locales.length}`);
