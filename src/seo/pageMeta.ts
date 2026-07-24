import { absoluteUrl } from './site';

export interface PageMeta {
  title: string;
  description: string;
  canonicalPath: string;
}

const HOME_META: PageMeta = {
  title: 'Online Casino, Live Casino & Sports Betting | iBets24',
  description:
    'Play online casino games, live casino, poker, slots, table games and sports betting at iBets24. Enjoy secure gaming, fast payouts and premium casino entertainment.',
  canonicalPath: '/',
};

/** Exact pathname → meta from On-page Optimization Report (Ibets24.com). */
const PAGE_META_BY_PATH: Record<string, PageMeta> = {
  '/': HOME_META,
  '/faq': {
    title: 'FAQ – Online Casino Help & Support | iBets24',
    description:
      'Find answers about online casino games, live casino, poker, sports betting, deposits, withdrawals, bonuses and account management at iBets24.',
    canonicalPath: '/faq',
  },
  '/contact': {
    title: 'Contact iBets24 – Online Casino Customer Support',
    description:
      'Contact the iBets24 support team for assistance with your online casino account, live casino games, sports betting, payments and technical questions.',
    canonicalPath: '/contact',
  },
  '/partners': {
    title: 'Partners & Affiliates | Business Partnerships | iBets24',
    description:
      'Partner with iBets24 through our affiliate program and B2B partnerships. Contact partners@ibets24.com for affiliate, media, payment and technology collaboration.',
    canonicalPath: '/partners',
  },
  '/about': {
    title: 'About iBets24 – Trusted Online Casino Platform',
    description:
      'Learn about iBets24, a trusted online casino offering live casino, poker, sports betting, slots and secure gaming with leading casino providers.',
    canonicalPath: '/about',
  },
  '/terms': {
    title: 'Terms & Conditions | iBets24 Online Casino',
    description:
      'Read the iBets24 Terms & Conditions covering online casino games, sports betting, player accounts, bonuses, payments and responsible gaming.',
    canonicalPath: '/terms',
  },
  '/privacy': {
    title: 'Privacy Policy | iBets24',
    description:
      'Learn how iBets24 collects, stores and protects your personal information while using our online casino, live casino and sports betting platform.',
    canonicalPath: '/privacy',
  },
  '/responsible-gaming': {
    title: 'Responsible Gaming | Safe Online Casino | iBets24',
    description:
      'Discover responsible gaming tools, player protection measures and support resources to help maintain a safe and enjoyable online casino experience.',
    canonicalPath: '/responsible-gaming',
  },
  '/aml': {
    title: 'Anti-Money Laundering Policy | iBets24',
    description:
      'Read the Anti-Money Laundering (AML) Policy explaining how iBets24 protects players and complies with international gaming regulations.',
    canonicalPath: '/aml',
  },
  '/cookies': {
    title: 'Website Cookie Policy | iBets24',
    description:
      'Learn how cookies improve your browsing experience, personalize content and enhance security while using the iBets24 online casino platform.',
    canonicalPath: '/cookies',
  },
  '/category/type-slot': {
    title: 'Online Slot Games | Best Slot Casino Games | iBets24',
    description:
      'Play exciting online slot games featuring jackpots, bonus rounds and premium themes. Enjoy the best online casino slots at iBets24.',
    canonicalPath: '/category/type-slot',
  },
  '/category/type-live_casino': {
    title: 'Live Casino Games | Real Dealer Casino | iBets24',
    description:
      'Experience live casino games with professional dealers. Play blackjack, roulette, baccarat and more in real time at iBets24. Real Dealer Casino.',
    canonicalPath: '/category/type-live_casino',
  },
  '/category/type-mini_game': {
    title: 'Best Mini Casino Games Online | iBets24',
    description:
      'Play exciting mini casino games online with fast gameplay, rewarding features and instant entertainment at iBets24. Best Mini Casino Games Online.',
    canonicalPath: '/category/type-mini_game',
  },
  '/category/type-table': {
    title: 'Online Table Games | Blackjack, Roulette & More | iBets24',
    description:
      'Enjoy online table games including blackjack, roulette, baccarat and poker. Play premium casino table games securely at iBets24. Best Blackjack, Roulette & More.',
    canonicalPath: '/category/type-table',
  },
  '/category/type-crash': {
    title: 'Online Crash Games | Fast Casino Action | iBets24',
    description:
      'Play exciting online crash games with instant action, thrilling multipliers and rewarding gameplay only at iBets24. Best Online Crash Games and Fast Casino Action.',
    canonicalPath: '/category/type-crash',
  },
  '/category/type-fishing': {
    title: 'Online Fish Games | Fish Shooting Casino Games | iBets24',
    description:
      'Play online fish games featuring immersive fish shooting gameplay, best exciting rewards and premium casino entertainment at iBets24.',
    canonicalPath: '/category/type-fishing',
  },
  '/sports/prematch': {
    title: 'Pre-Match Sports Betting | Best Odds & Markets | iBets24',
    description:
      'Place pre-match sports bets on football, cricket, basketball, tennis and more at iBets24. Get competitive odds, diverse betting markets and a secure sportsbook experience.',
    canonicalPath: '/sports/prematch',
  },
  '/sports/live': {
    title: 'Live Sports Betting | Football, Cricket & More | iBets24',
    description:
      'Bet on live sports with real-time odds at iBets24. Enjoy live betting on football, cricket, basketball, tennis and more with fast markets and secure gameplay.',
    canonicalPath: '/sports/live',
  },
};

export function getPageMeta(pathname: string): PageMeta {
  const normalized = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return PAGE_META_BY_PATH[normalized] ?? HOME_META;
}

export function getCanonicalHref(meta: PageMeta): string {
  return absoluteUrl(meta.canonicalPath);
}

export { HOME_META, PAGE_META_BY_PATH };
