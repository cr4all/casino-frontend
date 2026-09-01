#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import kn from './rest-i18n-langs/kn.json' with { type: 'json' };
import ta from './rest-i18n-langs/ta.json' with { type: 'json' };
import sw from './rest-i18n-langs/sw.json' with { type: 'json' };
import ka from './rest-i18n-langs/ka.json' with { type: 'json' };

const dir = join(dirname(fileURLToPath(import.meta.url)), 'rest-i18n-langs');

function write(lang, data) {
  writeFileSync(join(dir, `${lang}.json`), `${JSON.stringify(data, null, 2)}\n`);
  console.log('Wrote', lang);
}

// Full native translations — South Asian from kn pattern, others from ta/sw/ka
write('mr', {
  ...kn,
  heroBadge: 'अफिलिएट आणि B2B भागीदारी',
  heroTitle: 'तुमचा ट्रॅफिक दीर्घकालीन उत्पन्नात बदला',
  heroSubtitle:
    'स्लॉट्स, लाइव्ह कसिनो आणि स्पोर्ट्स बेटिंग असलेला संपूर्ण iGaming ब्रँड — पारदर्शक ट्रॅकिंग, लवचिक कमिशन मॉडेल आणि मासिक USD payouts सह प्रचार करा.',
  ctaApply: 'भागीदार व्हण्यासाठी अर्ज करा',
  highlightProducts: 'स्लॉट्स · लाइव्ह कसिनो · स्पोर्ट्स',
  highlightPayout: 'मासिक USD payouts',
  highlightTracking: 'रियल-टाइम आकडेवारी',
  highlightSupport: 'भागीदार सहाय्य',
  commissionTitle: 'स्केलसाठी तयार केलेले कमिशन मॉडेल',
  commissionSubtitle:
    'तुमच्या ट्रॅफिकच्या गुणवत्ता आणि मonetization strategy शी जुळणारी deal structure निवडा. custom rates volume, GEO आणि acquisition channel नुसार negotiate केले जातात.',
  revshareTitle: 'Revenue Share',
  revshareDesc:
    'refer केलेल्या players कडून Net Gaming Revenue (NGR) चा सatat टक्का मिळवा. RevShare cash gameplay GGR वरून bonus cost वजा करून calculate केले जाते — real player value शी aligned.',
  revsharePoint1: 'qualifying player activity वर lifetime revenue share',
  revsharePoint2: 'तumchya portal मध्यe transparent GGR, bonus cost आणि NGR breakdown',
  revsharePoint3: 'SEO, content आणि community-driven traffic साठी ideal',
  cpaDesc:
    'refer केलेल्या player ने qualifying first deposit पूर्ण kele tar fixed one-time payment. predictable upfront returns हवे asel tar perfect.',
  cpaPoint1: 'पहilya qualifying deposit वर single payout',
  cpaPoint2: 'आधic agreed clear qualification rules',
  cpaPoint3: 'paid media आणि high-volume acquisition funnels साठी best',
  hybridDesc:
    'tyach player साठी upfront CPA आणि ongoing RevShare combine kara. active players कडun long-tail earnings आणि immediate cash flow balance kara.',
  hybridPoint1: 'first deposit वर CPA, future activity वर RevShare',
  hybridPoint2: 'traffic profile नुसar flexible split',
  hybridPoint3: 'influencers आणि mixed-channel partners मध्यe popular',
  benefitsTitle: 'iBets24 सोबत का partner वha?',
  benefitsSubtitle:
    'conversion, retention, product depth — referrals play करit rahtil, tumhi earn करit rahil.',
  benefit1Title: 'संपूर्ण product portfolio',
  benefit1Desc:
    'ekach brand वरूn slots, live dealer, crash games, sports betting — pratyek visitor convert karanyache adhik marg.',
  benefit2Title: 'Real-Time Affiliate Portal',
  benefit2Desc:
    'referred players, deposits, turnover, GGR, bonus cost, NGR, commission accruals dedicated dashboard वरूn track kara.',
  benefit3Title: 'Sub-Affiliate Network',
  benefit3Desc:
    'top-level partners sub-affiliates create, manage — controlled commission models, performance visibility.',
  benefit4Title: 'विश्वasार्ह monthly settlements',
  benefit4Desc:
    'closed-month commissions USD payout bank transfer, crypto, e-wallet — minimum thresholds लागu.',
  benefit5Title: 'Compliance-First Operations',
  benefit5Desc:
    'KYC, AML, responsible gaming standards brand protect, long-term player trust, retention maintain.',
  benefit6Title: 'Dedicated Partner Desk',
  benefit6Desc:
    'deal terms, creatives, landing pages, campaign optimization — partnerships team शी directly work kara.',
  howTitle: 'हे कसe कam करte',
  howSubtitle: 'application ते payout — char saral paa.',
  step1Title: 'Apply & Get Approved',
  step1Desc:
    'partners@ibets24.com — traffic sources, target markets, promotional methods. onboarding आधic fit, compliance review.',
  step2Title: 'Tracking Assets मiळvा',
  step2Desc:
    'unique referral code, tracking link, Affiliate Portal access, live performance reporting.',
  step3Title: 'Qualified Players आanha',
  step3Desc:
    'link/code द्वारe traffic. players register, Terms आणि KYC under eligibility meet karave lagte.',
  step4Title: 'Track, Optimize & Get Paid',
  step4Desc:
    'daily player stats monitor, campaigns refine, closed-month commissions minimum threshold — monthly payouts request.',
  portalTitle: 'eka portal madhe sarv kahi',
  portalSubtitle: 'existing affiliates sign in — referrals, stats, payouts manage.',
  portalFeature1: 'copy-ready referral link, code',
  portalFeature2: 'player-level statistics, custom date ranges',
  portalFeature3: 'commission history, available payout balance',
  portalFeature4: 'USD payout details, withdrawal requests',
  portalFeature5: 'sub-affiliate creation, rate management',
  businessTitle: 'इतर business partnerships',
  businessDesc:
    'licensed game providers, payment partners, marketing agencies, technology vendors — fairness, security, responsible gaming.',
  businessCta: 'B2B Proposals pathva',
  ctaTitle: 'ekaatra vadhnyas ready?',
  ctaSubtitle: 'audience, traffic channels sanga — tailored commission terms, next steps.',
  supportNote: 'player account, payment, bonus — support@ibets24.com, partners inbox नahi.',
  backHome: '← home la parat',
});
