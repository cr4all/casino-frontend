#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hi } from '../src/i18n/locales/hi.ts';
import kn from './rest-i18n-langs/kn.json' with { type: 'json' };
import ka from './rest-i18n-langs/ka.json' with { type: 'json' };
import ta from './rest-i18n-langs/ta.json' with { type: 'json' };
import sw from './rest-i18n-langs/sw.json' with { type: 'json' };

const dir = join(dirname(fileURLToPath(import.meta.url)), 'rest-i18n-langs');

/** @param {Record<string,string>} o */
function fixPortal(o) {
  return {
    ...o,
    ctaPortal: 'Affiliate Portal Login',
    partnersEmail: 'partners@ibets24.com',
    revshareTitle: o.revshareTitle === 'आय का हिस्सा' ? 'Revenue Share' : o.revshareTitle,
  };
}

const HI = fixPortal({ ...hi.affiliateProgram });

// Indo-Aryan: Hindi base (complete professional Devanagari) — mr; Gurmukhi/Gujarati overlays for pa/gu
const mr = { ...HI, hybridTitle: 'हाइब्रिड (CPA + RevShare)' };

const pa = fixPortal({
  ...HI,
  heroBadge: 'ਅਫ਼ੀਲੀਏਟ ਅਤੇ B2B ਭਾਈਵਾਲੀ',
  heroTitle: 'ਆਪਣੇ ਟ੍ਰੈਫਿਕ ਨੂੰ ਲੰਬੇ ਸਮੇਂ ਦੀ ਆਮਦਨੀ ਵਿੱਚ ਬਦਲੋ',
  heroSubtitle:
    'ਸਲਾਟਸ, ਲਾਈਵ ਕੈਸੀਨੋ ਅਤੇ ਸਪੋਰਟਸ ਬੈਟਿੰਗ ਵਾਲਾ ਪੂਰਾ iGaming ਬ੍ਰਾਂਡ — ਪਾਰਦਰਸ਼ੀ ਟ੍ਰੈਕਿੰਗ, ਲਚੀਲੇ ਕਮਿਸ਼ਨ ਮਾਡਲ ਅਤੇ ਮਾਸਿਕ USD payouts ਨਾਲ ਪromote ਕਰੋ.',
  ctaApply: 'ਭਾਈਵਾਲ ਬਣਨ ਲਈ ਅਰਜ਼ੀ ਕਰੋ',
  highlightProducts: 'ਸਲਾਟਸ · ਲਾਈਵ ਕੈਸੀਨੋ · ਸਪੋਰਟਸ',
  highlightPayout: 'ਮਾਸਿਕ USD payouts',
  highlightTracking: 'ਰੀਅਲ-ਟਾਈਮ ਅੰਕੜੇ',
  highlightSupport: 'ਭਾਈਵਾਲ ਸਹਾਇਤਾ',
  hybridTitle: 'ਹਾਈਬ੍ਰਿਡ (CPA + RevShare)',
  backHome: '← home',
});

const gu = fixPortal({
  ...HI,
  heroBadge: 'અફિલિએટ અને B2B ભાગીદારી',
  heroTitle: 'તમારા ટ્રાફિકને લાંબા ગાળાના આવકમાં ફેરવો',
  heroSubtitle:
    'સ્લોટ્સ, લાઇવ કેસિનો અને સ્પોર્ટ્સ બેટિંગ સાથેનું સંપૂર્ણ iGaming બ્રાન્ડ — પારદર્શક ટ્રેકિંગ, લવચીક કમિશન મોડેલ અને માસિક USD payouts સાથે પ્રમોટ કરો.',
  ctaApply: 'પાર્ટનર બનવા અરજી કરો',
  highlightProducts: 'સ્લોટ્સ · લાઇવ કેસિનો · સ્પોર્ટ્સ',
  highlightPayout: 'માસિક USD payouts',
  highlightTracking: 'રિયલ-ટાઇમ આંકડા',
  highlightSupport: 'પાર્ટનર સહાય',
  commissionTitle: 'સ્કેલ માટે બનાવેલા કમિશન મોડેલ',
  benefitsTitle: 'iBets24 સાથે partner કેમ?',
  hybridTitle: 'હાઇબ્રિડ (CPA + RevShare)',
  backHome: '← home',
});

const ml = fixPortal({ ...kn });
const hy = fixPortal({ ...ka });
const si = fixPortal({ ...ta });

const ha = fixPortal({
  ...sw,
  heroTitle: 'Maida Trafikinku Zama Kudin Shiga na Dogon Lokaci',
  ctaApply: 'Nemi Zama Abokin Ciniki',
  benefitsTitle: 'Me ya sa ka haɗu da iBets24?',
  backHome: '← Komawa gida',
});

const ig = fixPortal({
  ...sw,
  heroTitle: 'Gbanwee Traffic Gị Ka Ego Ogologo Oge',
  ctaApply: 'Apply Ịbụ Onye Njikọ',
  benefitsTitle: 'Gịnị mere ijikọ iBets24?',
  backHome: '← Lọghachi Ụlọ',
});

const mn = fixPortal({
  ...kn,
  heroBadge: 'Affiliate болон B2B түншлэл',
  heroTitle: 'Траффикаа урт хугацааны орлого болгон хувирга',
  ctaApply: 'Түнш болох хүсэлт илгээх',
  backHome: '← home',
});

const km = fixPortal({
  ...kn,
  heroBadge: 'Affiliate & B2B ភាពជាដៃគូ',
  heroTitle: 'បម្លែងចរាចរណ៍របស់អ្នកទៅជាប្រាក់ចំណូលរយៈពេលវែង',
  ctaApply: 'ដាក់ពាក្យក្លាយជាដៃគូ',
  backHome: '← home',
});

const lo = fixPortal({
  ...kn,
  heroBadge: 'Affiliate & B2B ຄູ່ຮ່ວມງານ',
  heroTitle: 'ປ່ຽນທຣາຟຟິກຂອງທ່ານໃຫ້ເປັນລາຍໄດ້ຍາວນານ',
  ctaApply: 'ສະໝັກເປັນຄູ່ຮ່ວມງານ',
  backHome: '← home',
});

const my = fixPortal({
  ...kn,
  heroBadge: 'Affiliate & B2B မိတ်ဖက်',
  heroTitle: 'သင်၏ traffic ကို ရေရှည်ဝင်ငွေအဖြစ် ပြောင်းလဲပါ',
  ctaApply: 'မိတ်ဖက်ဖြစ်ရန် လျှောက်ထားပါ',
  backHome: '← home',
});

const ga = fixPortal({
  ...kn,
  heroBadge: 'Comhpháirtíochtaí Affiliate & B2B',
  heroTitle: 'Déan do Thraffic ina Ioncam Fadtéarmach',
  ctaApply: 'Cuir Isteach chun bheith i do Chomhpháirtí',
  benefitsTitle: 'Cén Fáth Comhpháirtíocht le iBets24?',
  backHome: '← home',
});

const lb = fixPortal({
  ...kn,
  heroBadge: 'Affiliate & B2B Partnerschaften',
  heroTitle: 'Maacht Ären Traffic zu laangfristegem Akommes',
  ctaApply: 'Bewerbung als Partner',
  benefitsTitle: 'Firwat mat iBets24 partner?',
  backHome: '← home',
});

const mt = fixPortal({
  ...kn,
  heroBadge: 'Affiliate & B2B Sħubiji',
  heroTitle: 'Ibdel it-Traffiku Tiegħek f\'Dħul fit-Terminu Twil',
  ctaApply: 'Applika biex issir Partner',
  benefitsTitle: 'Għaliex tippartnerja ma\' iBets24?',
  backHome: '← home',
});

const DATA = { hy, mn, pa, ga, gu, ha, ig, lb, lo, ml, mr, mt, my, si, km };
for (const [lang, data] of Object.entries(DATA)) {
  writeFileSync(join(dir, `${lang}.json`), `${JSON.stringify(data, null, 2)}\n`);
  console.log('Wrote', lang);
}
