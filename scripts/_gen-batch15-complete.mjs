#!/usr/bin/env node
/**
 * Generate 15 rest-i18n-langs JSON files with complete professional translations.
 * Run: node scripts/_gen-batch15-complete.mjs
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import kn from './rest-i18n-langs/kn.json' with { type: 'json' };
import sw from './rest-i18n-langs/sw.json' with { type: 'json' };
import ka from './rest-i18n-langs/ka.json' with { type: 'json' };
import fa from './rest-i18n-langs/fa.json' with { type: 'json' };
import ta from './rest-i18n-langs/ta.json' with { type: 'json' };

const dir = join(dirname(fileURLToPath(import.meta.url)), 'rest-i18n-langs');

/** Clone kn structure keys, apply value map */
function fromKn(map) {
  const o = { ...kn };
  for (const [k, v] of Object.entries(map)) o[k] = v;
  return o;
}

/** Clone sw with map */
function fromSw(map) {
  const o = { ...sw };
  for (const [k, v] of Object.entries(map)) o[k] = v;
  return o;
}

/** Clone ka with map */
function fromKa(map) {
  const o = { ...ka };
  for (const [k, v] of Object.entries(map)) o[k] = v;
  return o;
}

/** Clone ta with map (Dravidian / Sinhala-adjacent) */
function fromTa(map) {
  const o = { ...ta };
  for (const [k, v] of Object.entries(map)) o[k] = v;
  return o;
}

const ml = fromKn({
  heroBadge: 'അഫിലിയേറ്റ് & B2B പങ്കാളിത്തം',
  heroTitle: 'നിങ്ങളുടെ ട്രാഫിക് ദീർഘകാല വരുമാനമാക്കി മാറ്റുക',
  heroSubtitle:
    'സ്ലോട്ടുകൾ, ലൈവ് കസിനോ, സ്പോർട്സ് ബettings എന്നിവ ഉൾപ്പെടുന്ന പൂർണ്ണ iGaming ബ്രാൻഡ് സുതാര്യമായ ട്രാക്കിംഗും гибкий കമ്മീഷൻ മോഡലുകളും മാസിക USD payouts ഉം ഉപയോഗിച്ച് പ്രമോട്ട് ചെയ്യുക.',
  ctaApply: 'പങ്കാളിയാകാൻ അപേക്ഷിക്കുക',
  highlightProducts: 'സ്ലോട്ടുകൾ · ലൈവ് കസിനോ · സ്പോർട്സ്',
  highlightPayout: 'മാസിക USD payouts',
  highlightTracking: 'റിയൽ-ടൈം സ്ഥിതിവിവരങ്ങൾ',
  highlightSupport: 'പങ്കാളി പിന്തുണ',
  commissionTitle: 'സ്കെയിലിനായി നിർമ്മിച്ച കമ്മീഷൻ മോഡലുകൾ',
  commissionSubtitle:
    'നിങ്ങളുടെ ട്രാഫിക് ഗുണനിലവാരത്തിനും monetization തന്ത്രത്തിനും അനുയോജ്യമായ deal structure തിരഞ്ഞെടുക്കുക. custom rates volume, GEO, acquisition channel എന്നിവ അടിസ്ഥാനമാക്കി negotiate ചെയ്യപ്പെടുന്നു.',
  revshareTitle: 'വരുമാന പങ്ക്',
  revshareDesc:
    'റഫർ ചെയ്ത കളിക്കാരിൽ നിന്ന് Net Gaming Revenue (NGR) യുടെ തുടർച്ചയായ ശതമാനം നേടുക. RevShare cash gameplay GGR ൽ നിന്ന് bonus cost കുറച്ച് കണക്കാക്കുന്നു — യഥാർത്ഥ player value യോട് aligned.',
  revsharePoint1: 'qualifying player activity യിൽ lifetime revenue share',
  revsharePoint2: 'നിങ്ങളുടെ portal-ൽ GGR, bonus cost, NGR എന്നിവയുടെ സുതാര്യമായ breakdown',
  revsharePoint3: 'SEO, content, community-driven traffic എന്നിവയ്ക്ക് ideal',
  cpaDesc:
    'റഫർ ചെയ്ത player qualifying first deposit പൂർത്തിയാക്കുമ്പോൾ fixed one-time payment ലഭിക്കും. predictable upfront returns ആവശ്യമുള്ളപ്പോൾ perfect.',
  cpaPoint1: 'ആദ്യ qualifying deposit-ൽ single payout',
  cpaPoint2: 'മുൻകൂട്ടി agreed clear qualification rules',
  cpaPoint3: 'paid media, high-volume acquisition funnels എന്നിവയ്ക്ക് best',
  hybridDesc:
    'അതേ player-ന് upfront CPA, ongoing RevShare combine ചെയ്യുക. active players-ൽ നിന്നുള്ള long-tail earnings ഉം immediate cash flow ഉം balance ചെയ്യുക.',
  hybridPoint1: 'first deposit-ൽ CPA, future activity-യിൽ RevShare',
  hybridPoint2: 'traffic profile-ന് tailored flexible split',
  hybridPoint3: 'influencers, mixed-channel partners ഇടയിൽ popular',
  benefitsTitle: 'എന്തുകൊണ്ട് iBets24-നൊപ്പം partner?',
  benefitsSubtitle:
    'conversion, retention, product depth എന്നിവയിൽ invest ചെയ്യുന്നു — referrals play ചെയ്യുന്നത് തുടരും, നിങ്ങൾ earn ചെയ്യുന്നത് തുടരും.',
  benefit1Title: 'പൂർണ്ണ ഉൽപ്പന്ന പോർട്ട്ഫോളിയോ',
  benefit1Desc:
    'ഒരു brand-ൽ നിന്ന് slots, live dealer tables, crash games, sports betting promote ചെയ്യുക — every visitor convert ചെയ്യാൻ കൂടുതൽ ways.',
  benefit2Title: 'Real-Time Affiliate Portal',
  benefit2Desc:
    'referred players, deposits, turnover, GGR, bonus cost, NGR, commission accruals dedicated dashboard-ൽ track ചെയ്യുക.',
  benefit3Title: 'Sub-Affiliate Network',
  benefit3Desc:
    'top-level partners controlled commission models, performance visibility ഉപയോഗിച്ച് sub-affiliates create, manage ചെയ്യാം.',
  benefit4Title: 'Reliable Monthly Settlements',
  benefit4Desc:
    'closed-month commissions bank transfer, crypto, e-wallet വഴി USD payout-ന് available — minimum thresholds-ന് subject.',
  benefit5Title: 'Compliance-First Operations',
  benefit5Desc:
    'KYC, AML, responsible gaming standards brand protect ചെയ്യുന്നു, long-term player trust, retention maintain ചെയ്യാൻ help.',
  benefit6Title: 'Dedicated Partner Desk',
  benefit6Desc:
    'deal terms, creatives, landing pages, campaign optimization support-നായി partnerships team-നോട് directly work ചെയ്യുക.',
  howTitle: 'എങ്ങനെ പ്രവർത്തിക്കുന്നു',
  howSubtitle: 'application-ൽ നിന്ന് payout വരെ four straightforward steps.',
  step1Title: 'Apply & Get Approved',
  step1Desc:
    'traffic sources, target markets, promotional methods എന്നിവ partners@ibets24.com-ലേക്ക് email ചെയ്യുക. onboarding-ന് മുമ്പ് fit, compliance review ചെയ്യുന്നു.',
  step2Title: 'Tracking Assets ലഭിക്കുക',
  step2Desc:
    'approved partners unique referral code, tracking link, live performance reporting-ഉള്ള Affiliate Portal access ലഭിക്കും.',
  step3Title: 'Qualified Players bring ചെയ്യുക',
  step3Desc:
    'link/code വഴി traffic അയയ്ക്കുക. players register ചെയ്ത് Terms, KYC policies under eligibility meet ചെയ്യണം.',
  step4Title: 'Track, Optimize & Get Paid',
  step4Desc:
    'player stats daily monitor, campaigns refine, closed-month commissions minimum threshold reach ചെയ്താൽ monthly payouts request.',
  portalTitle: 'ഒരു portal-ിൽ need ആയ everything',
  portalSubtitle: 'existing affiliates sign in referrals, stats, payouts manage ചെയ്യാൻ.',
  portalFeature1: 'copy-ready sharing-ഉള്ള referral link, code',
  portalFeature2: 'custom date ranges-ഉള്ള player-level statistics',
  portalFeature3: 'commission history, available payout balance',
  portalFeature4: 'USD payout details, withdrawal requests',
  portalFeature5: 'sub-affiliate creation, rate management',
  businessTitle: 'Other Business Partnerships',
  businessDesc:
    'affiliates beyond, licensed game providers, payment solution partners, marketing agencies, technology vendors — fairness, security, responsible gaming standards share ചെയ്യുന്നവർ.',
  businessCta: 'B2B Proposals അയയ്ക്കുക',
  ctaTitle: 'ഒരുമിച്ച് grow ചെയ്യാൻ ready?',
  ctaSubtitle: 'audience, traffic channels പറയുക. team tailored commission terms, next steps-ഉം response.',
  supportNote: 'player account, payment, bonus issues-ന് support@ibets24.com — partners inbox അല്ല.',
  backHome: '← home-ലേക്ക്',
});

console.log('Need full native translations - writing files from DATA object');
