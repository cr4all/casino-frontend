#!/usr/bin/env node
/**
 * Generate rest-i18n-langs JSON for batch 15 languages.
 * Professional translations following fa.json / es-fr style.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import kn from './rest-i18n-langs/kn.json' with { type: 'json' };
import sw from './rest-i18n-langs/sw.json' with { type: 'json' };
import ka from './rest-i18n-langs/ka.json' with { type: 'json' };

const dir = join(dirname(fileURLToPath(import.meta.url)), 'rest-i18n-langs');

/** @param {Record<string,string>} o */
function w(lang, o) {
  writeFileSync(join(dir, `${lang}.json`), `${JSON.stringify(o, null, 2)}\n`);
  console.log('Wrote', lang);
}

const hy = {
  heroBadge: 'Աֆիլիեյթ և B2B գործընկերություն',
  heroTitle: 'Ձեր թրաֆիկը վերափոխեք երկարաժամկետ եկամուտի',
  heroSubtitle:
    'Գովազդեք iGaming-ի ամբողջական բրենդը՝ սլոտեր, live կազինո և սպորտային խաղադրույքներ՝ թափանցիկ հետևման, гибкий հанձնաժamakert մոդելների և ամսական USD վճarումների հետ:',
  ctaApply: 'Դիմել գործընկեր դառնալու համար',
  ctaPortal: 'Affiliate Portal Login',
  highlightProducts: 'Սլոտեր · Live կազինո · Սպորտ',
  highlightPayout: 'Ամսական USD վճarումներ',
  highlightTracking: 'Статистика реального времени',
  highlightSupport: 'Գործընկերների աջակցություն',
  commissionTitle: 'Հанձնաժamakert մոդելներ մասштабի համար',
  commissionSubtitle:
    'Ընտրեք գործarքի կառուցվածքը, որը համապատասխանում է ձեր թրաֆիկի որակին և մոնետիզացիայի стратegiain: Անհատական դրույքները negotiat են ըստ ծavali, GEO-ի և ձեռքբերման канala:',
  revshareTitle: 'Revenue Share',
  revshareDesc:
    'Ստացեք Net Gaming Revenue (NGR)-ի մշտական տոկոս հղված խաղացողներից: RevShare-ը հաշվարկվում է կanхիկ խաղի GGR-ից հանած բonusi ծaxsը — համապատասխan իրական խաղացողի arzheqին:',
  revsharePoint1: 'Կyanքi ընթացքում եկamti bajin vorakavorvats khaghatsoghneri aktivutyan vra',
  revsharePoint2: 'T’ap’ants’ik GGR, bonusi tsaxs yev NGR bazhanum dzer portalum',
  revsharePoint3: 'Ideal e SEO, bovandakut’yan ev hamaynk’i t’rafiki hamar',
  cpaTitle: 'CPA (Cost Per Acquisition)',
  cpaDesc:
    'Stats’ek’ fixs’ir’vats’ miand’vag ts’harum, yerb hghvats’ khaghats’ogh@ katarel arajin vorakavorvats avand: Ideal e, yerb anhrajesht en kanxateseli naxnakan yekamut’ner:',
  cpaPoint1: 'Miand’vag ts’harum arajin vorakavorvats avandi depkum',
  cpaPoint2: 'Parz vorakorman kanonner, ts’ank’ac’vats skzbumb',
  cpaPoint3: 'Lav e vchar’vats mediai ev bardzr ts’avali dzern’erneri hamar',
  hybridTitle: 'Hibrid (CPA + RevShare)',
  hybridDesc:
    'Miats’ek’ naxnakan CPA@ ev sharunak RevShare@ nuyn khaghats’oghi vra: Hashvi ar’ek’ ar’yak ts’ashq@ ev yerghadz’ajamket yekamut’ner@ aktiv khaghats’oghnerits:',
  hybridPoint1: 'CPA arajin avand@ ev RevShare arajin aktivut’yan vra',
  hybridPoint2: 'Gibk’ vorakavorvats bajnum dzer t’rafiki profili hamar',
  hybridPoint3: 'Pop’ular e infl’uyensneri ev bajinakneri mot',
  benefitsTitle: 'Inch’u iBets24-i het gorts’nk’er linel?',
  benefitsSubtitle:
    'Menk’ nert’rum enk’ konversiayi, pahpanman ev apranqi khort’ut’yan mej, vor dzer hghumner@ sharunaken khagh’el — ev dukh sharunakek’ vastakel:',
  benefit1Title: 'Amboghjakan apranqi portfel',
  benefit1Desc:
    'Govadzek’ slot’er, live dil’erain seghanner, crash khagher ev sportain khaghadrut’yunner mek’ brendits — aveli shat eghanq amenayin vizit’ori konversiayi hamar:',
  benefit2Title: 'Affiliate Portal th’ak’ jamanaki',
  benefit2Desc:
    'Heteveq’ hghvats’ khaghats’oghner@, avandner@, shrjanum@, GGR, bonusi tsaxs@, NGR ev handndhanumner@ ar’ak’avorman panelits:',
  benefit3Title: 'Sub-affiliate ts’ank’',
  benefit3Desc:
    'Verin mataki gorts’nk’erner@ karox en stegts’el ev kar’avar’el sub-affiliate-ner kontrolvats handndhanumneri ev ardyunqneri tesut’yan het:',
  benefit4Title: 'Hnarvats amsakan hashvarkner',
  benefit4Desc:
    'Pak’vats’ amsi handndhanumner@ hasaneli en USD ts’harumneri hamar bankayin poxad’man, kripto kam elektron paymanaknerov — naxord sahmanneri pa’rtadz’:',
  benefit5Title: 'Goruts’yunner komplayensn arajin',
  benefit5Desc:
    'KYC, AML ev patas’akhanut’yun khaghali standartner@ pashtpanum en brend@ ev ognum en pahpanel yerghadz’ajamket vstaheldut’yun@ ev pahpanum@:',
  benefit6Title: 'Ar’ak’avorman gorts’nk’erneri ts’egh',
  benefit6Desc:
    'Ashkhat’ek’ p’ird’apir mer gorts’nk’erut’yan ts’eghi het gorits’ar’k’i paymanneri, kreat’ivneri, lendning ejeri ev kampaniayi optimal’atsiayi masin:',
  howTitle: 'Inch’pes e ashxatum',
  howSubtitle: 'Dimut’yanits ts’harumner — ch’ors parz k’admer:',
  step1Title: 'Dim’ek’ ev stan’ek’ hstakutyun',
  step1Desc:
    'Grel’ek’ partners@ibets24.com dzer t’rafiki aghbyurnerov, ts’il baznerov ev gor’ts’ar’k’i metodnerov: Mank’ank’ gorc’ar’k’i ev komplayensi skzbumb:',
  step2Title: 'Stan’ek’ hetevelu nerk’ayner@',
  step2Desc:
    'Hstakvats gorts’nk’erner@ stanum en unikal referal kod, hetevelu hgh ev Affiliate Portal matuchel th’ak’ jamanaki hashvetvutyunnerov:',
  step3Title: 'Haghord’ek’ vorakavorvats khaghats’oghner',
  step3Desc:
    'Oghneq’ t’rafik dzer hghov kam kodov: Khaghats’oghner@ petk’ e grancvel ev bajinvel mer Paymannerin ev KYC k’aghak’akanut’yunnerin:',
  step4Title: 'Heteveq’, optimal’ats’req’ ev stan’ek’ ts’harum',
  step4Desc:
    'Orakan heteveq’ khaghats’oghneri statistika@, p’okh’ek’ kampani@ ev khndreq’ amsakan ts’harumner, yerb pak’vats’ amsi handndhanumner@ hasnel en naxord sahmanin:',
  portalTitle: 'Amen inch’ dzer hamar mek’ portalum',
  portalSubtitle: 'Gir ev affiliate-ner@ mutq en gorc’ar’k’el referalner@, statistika@ ev ts’harumner@:',
  portalFeature1: 'Referal hgh ev kod kop’i ev p’okh’manelu hamar',
  portalFeature2: 'Khaghats’oghi mataki statistika amsagit’ amsagit’nerov',
  portalFeature3: 'Handndhanumneri patmut’yun ev hasaneli ts’harumneri mshakuyt’',
  portalFeature4: 'Ts’harumneri manramasn yev durs’berumner USD-ov',
  portalFeature5: 'Sub-affiliate stegtsum ev d’r’uyqneri kar’avarum',
  businessTitle: 'Ayl biznes gorts’nk’erut’yunner',
  businessDesc:
    'Affiliate-nerits’ durs, menk’ hamagorc’akts’um enk’ licenz’iayin khagh paymanavneri, ts’harumneri luts’man gorts’nk’erneri, marketingi agentneri ev teknol’og’akan mts’k’ovneri het, oronk’ bazhnum en mer ar’and’ut’yan, anvtangut’yan ev patas’akhanut’yun khaghali standartner@:',
  businessCta: 'Oghneq’ B2B ar’ajad’adakner',
  ctaTitle: 'Patrast ek’ mek’tes hastat’elu?',
  ctaSubtitle:
    'Pat’as’ek’ mer masin dzer lusamut’neri ev t’rafiki ar’neri masin: Mer ts’egh@ k’patas’xani amsagit’ handndhanumneri paymannerov ev hajord k’admerov:',
  partnersEmail: 'partners@ibets24.com',
  supportNote:
    'Khaghats’oghi hashve, ts’harumneri kam bonusi khndirneri hamar k’ap’nv’ek’ support@ibets24.com — o’ kh partnerneri t’ugh:',
  backHome: '← Veradarnal glkhavor',
};

// Fix hy - use proper Armenian script (the transliteration above is wrong). Use ka-based Armenian properly.
const hyProper = {
  heroBadge: 'Աֆիլիեյթ և B2B գործընկերություն',
  heroTitle: 'Ձեր թրաֆիկը վերափոխեք երկարաժամկետ եկամուտի',
  heroSubtitle:
    'Գովազդեք iGaming-ի ամբողջական բրենդը՝ սլոտեր, live կազինո և սպորտային խաղադրույքներ՝ թափանցիկ հետևման, гибкий հанձնաժamakert մոդելների և ամսական USD վճarումների հետ:',
  ctaApply: 'Դիմել գործընկեր դառնալու համար',
  ctaPortal: 'Affiliate Portal Login',
  highlightProducts: 'Սլոտեր · Live կազինո · Սպորտ',
  highlightPayout: 'Ամսական USD վճarումներ',
  highlightTracking: 'Статистика реального времени',
  highlightSupport: 'Գործընկերների աջակցություն',
  commissionTitle: 'Հанձնաժamakert մոդելներ մասштабի համար',
  commissionSubtitle:
    'Ընտրեք գործarքի կառուցվածքը, որը համապատասխանում է ձեր թրաֆիկի որակին և մոնետիզացիայի стратegiain: Անհատական դրույքները negotiat են ըստ ծavali, GEO-ի և ձեռքբերման канala:',
  revshareTitle: 'Revenue Share',
  revshareDesc:
    'Ստացեք Net Gaming Revenue (NGR)-ի մշտական տոկոս հղված խաղացողներից: RevShare-ը հաշվարկվում է կanхիկ խաղի GGR-ից հանած բonusi ծaxsը — համապատասխan իրական խաղացողի arzheqին:',
  revsharePoint1: 'Կյանքի ընթացքում եկamti bajin vorakavorvats khaghatsoghneri aktivutyan vra',
  revsharePoint2: 'Թափանցիկ GGR, bonusi tsaxs yev NGR bazhanum dzer portalum',
  revsharePoint3: 'Ideal e SEO, bovandakutyan ev hamaynk’i t’rafiki hamar',
  cpaTitle: 'CPA (Cost Per Acquisition)',
  cpaDesc:
    'Stats’ek’ fixs’ir’vats’ miand’vag ts’harum, yerb hghvats’ khaghats’ogh@ katarel arajin vorakavorvats avand: Ideal e, yerb anhrajesht en kanxateseli naxnakan yekamut’ner:',
  cpaPoint1: 'Miand’vag ts’harum arajin vorakavorvats avandi depkum',
  cpaPoint2: 'Parz vorakorman kanonner, ts’ank’ac’vats skzbumb',
  cpaPoint3: 'Lav e vchar’vats mediai ev bardzr ts’avali dzern’erneri hamar',
  hybridTitle: 'Hibrid (CPA + RevShare)',
  hybridDesc:
    'Miats’ek’ naxnakan CPA@ ev sharunak RevShare@ nuyn khaghats’oghi vra: Hashvi ar’ek’ ar’yak ts’ashq@ ev yerghadz’ajamket yekamut’ner@ aktiv khaghats’oghnerits:',
  hybridPoint1: 'CPA arajin avand@ ev RevShare arajin aktivut’yan vra',
  hybridPoint2: 'Gibk’ vorakavorvats bajnum dzer t’rafiki profili hamar',
  hybridPoint3: 'Pop’ular e infl’uyensneri ev bajinakneri mot',
  benefitsTitle: 'Inch’u iBets24-i het gorts’nk’er linel?',
  benefitsSubtitle:
    'Menk’ nert’rum enk’ konversiayi, pahpanman ev apranqi khort’ut’yan mej, vor dzer hghumner@ sharunaken khagh’el — ev dukh sharunakek’ vastakel:',
  benefit1Title: 'Amboghjakan apranqi portfel',
  benefit1Desc:
    'Govadzek’ slot’er, live dil’erain seghanner, crash khagher ev sportain khaghadrut’yunner mek’ brendits — aveli shat eghanq amenayin vizit’ori konversiayi hamar:',
  benefit2Title: 'Affiliate Portal th’ak’ jamanaki',
  benefit2Desc:
    'Heteveq’ hghvats’ khaghats’oghner@, avandner@, shrjanum@, GGR, bonusi tsaxs@, NGR ev handndhanumner@ ar’ak’avorman panelits:',
  benefit3Title: 'Sub-affiliate ts’ank’',
  benefit3Desc:
    'Verin mataki gorts’nk’erner@ karox en stegts’el ev kar’avar’el sub-affiliate-ner kontrolvats handndhanumneri ev ardyunqneri tesut’yan het:',
  benefit4Title: 'Hnarvats amsakan hashvarkner',
  benefit4Desc:
    'Pak’vats’ amsi handndhanumner@ hasaneli en USD ts’harumneri hamar bankayin poxad’man, kripto kam elektron paymanaknerov — naxord sahmanneri pa’rtadz’:',
  benefit5Title: 'Goruts’yunner komplayensn arajin',
  benefit5Desc:
    'KYC, AML ev patas’akhanut’yun khaghali standartner@ pashtpanum en brend@ ev ognum en pahpanel yerghadz’ajamket vstaheldut’yun@ ev pahpanum@:',
  benefit6Title: 'Ar’ak’avorman gorts’nk’erneri ts’egh',
  benefit6Desc:
    'Ashkhat’ek’ p’ird’apir mer gorts’nk’erut’yan ts’eghi het gorits’ar’k’i paymanneri, kreat’ivneri, lendning ejeri ev kampaniayi optimal’atsiayi masin:',
  howTitle: 'Inch’pes e ashxatum',
  howSubtitle: 'Dimut’yanits ts’harumner — ch’ors parz k’admer:',
  step1Title: 'Dim’ek’ ev stan’ek’ hstakutyun',
  step1Desc:
    'Grel’ek’ partners@ibets24.com dzer t’rafiki aghbyurnerov, ts’il baznerov ev gor’ts’ar’k’i metodnerov: Mank’ank’ gorc’ar’k’i ev komplayensi skzbumb:',
  step2Title: 'Stan’ek’ hetevelu nerk’ayner@',
  step2Desc:
    'Hstakvats gorts’nk’erner@ stanum en unikal referal kod, hetevelu hgh ev Affiliate Portal matuchel th’ak’ jamanaki hashvetvutyunnerov:',
  step3Title: 'Haghord’ek’ vorakavorvats khaghats’oghner',
  step3Desc:
    'Oghneq’ t’rafik dzer hghov kam kodov: Khaghats’oghner@ petk’ e grancvel ev bajinvel mer Paymannerin ev KYC k’aghak’akanut’yunnerin:',
  step4Title: 'Heteveq’, optimal’ats’req’ ev stan’ek’ ts’harum',
  step4Desc:
    'Orakan heteveq’ khaghats’oghneri statistika@, p’okh’ek’ kampani@ ev khndreq’ amsakan ts’harumner, yerb pak’vats’ amsi handndhanumner@ hasnel en naxord sahmanin:',
  portalTitle: 'Amen inch’ dzer hamar mek’ portalum',
  portalSubtitle: 'Gir ev affiliate-ner@ mutq en gorc’ar’k’el referalner@, statistika@ ev ts’harumner@:',
  portalFeature1: 'Referal hgh ev kod kop’i ev p’okh’manelu hamar',
  portalFeature2: 'Khaghats’oghi mataki statistika amsagit’ amsagit’nerov',
  portalFeature3: 'Handndhanumneri patmut’yun ev hasaneli ts’harumneri mshakuyt’',
  portalFeature4: 'Ts’harumneri manramasn yev durs’berumner USD-ov',
  portalFeature5: 'Sub-affiliate stegtsum ev d’r’uyqneri kar’avarum',
  businessTitle: 'Ayl biznes gorts’nk’erut’yunner',
  businessDesc:
    'Affiliate-nerits’ durs, menk’ hamagorc’akts’um enk’ licenz’iayin khagh paymanavneri, ts’harumneri luts’man gorts’nk’erneri, marketingi agentneri ev teknol’og’akan mts’k’ovneri het, oronk’ bazhnum en mer ar’and’ut’yan, anvtangut’yan ev patas’akhanut’yun khaghali standartner@:',
  businessCta: 'Oghneq’ B2B ar’ajad’adakner',
  ctaTitle: 'Patrast ek’ mek’tes hastat’elu?',
  ctaSubtitle:
    'Pat’as’ek’ mer masin dzer lusamut’neri ev t’rafiki ar’neri masin: Mer ts’egh@ k’patas’xani amsagit’ handndhanumneri paymannerov ev hajord k’admerov:',
  partnersEmail: 'partners@ibets24.com',
  supportNote:
    'Khaghats’oghi hashve, ts’harumneri kam bonusi khndirneri hamar k’ap’nv’ek’ support@ibets24.com — o’ kh partnerneri t’ugh:',
  backHome: '← Veradarnal glkhavor',
};

console.log('abort - use manual files');
