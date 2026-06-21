import type { Game, HeroBanner, PromoBlock, Promotion, Provider, SportCategory, SportEvent, Winner } from '@/types';

export const heroBanners: HeroBanner[] = [
  {
    id: 'hero-1',
    title: 'Welcome Bonus up to €500',
    subtitle: 'Plus 250 free spins on your first deposit',
    cta: 'Claim Now',
    gradient: 'from-accent-purple via-accent to-accent-blue',
  },
  {
    id: 'hero-2',
    title: '10,000+ Premium Games',
    subtitle: 'Slots, Live Casino, Jackpots & more',
    cta: 'Play Now',
    gradient: 'from-accent-blue via-accent-purple to-accent',
  },
  {
    id: 'hero-3',
    title: 'Weekly Cashback 15%',
    subtitle: 'Get rewarded every week on your play',
    cta: 'Learn More',
    gradient: 'from-accent-gold via-accent to-accent-purple',
  },
];

const gradients = [
  'from-amber-900/70 to-card',
  'from-yellow-900/60 to-card',
  'from-orange-900/50 to-card',
  'from-amber-800/60 to-card',
  'from-yellow-800/50 to-card',
];

const gameNames = [
  { name: 'Sweet Bonanza', category: 'slots', provider: 'Pragmatic Play' },
  { name: 'Gates of Olympus', category: 'slots', provider: 'Pragmatic Play' },
  { name: 'Lightning Roulette', category: 'live', provider: 'Evolution' },
  { name: 'Crazy Time', category: 'live', provider: 'Evolution' },
  { name: 'Book of Dead', category: 'slots', provider: 'Play\'n GO' },
  { name: 'Starburst', category: 'slots', provider: 'NetEnt' },
  { name: 'Mega Wheel', category: 'live', provider: 'Pragmatic Play' },
  { name: 'Blackjack Live', category: 'live', provider: 'Ezugi' },
  { name: 'Baccarat Live', category: 'live', provider: 'Evolution' },
  { name: 'Big Bass Bonanza', category: 'slots', provider: 'Pragmatic Play' },
  { name: 'Wolf Gold', category: 'slots', provider: 'Pragmatic Play' },
  { name: 'Gonzo Quest', category: 'slots', provider: 'NetEnt' },
  { name: 'Dream Catcher', category: 'live', provider: 'Evolution' },
  { name: 'Monopoly Live', category: 'live', provider: 'Evolution' },
  { name: 'Dead or Alive', category: 'slots', provider: 'NetEnt' },
  { name: 'Mega Moolah', category: 'jackpots', provider: 'Microgaming' },
  { name: 'Jammin Jars', category: 'slots', provider: 'Push Gaming' },
  { name: 'Fire Joker', category: 'slots', provider: 'Play\'n GO' },
  { name: 'Speed Baccarat', category: 'live', provider: 'Pragmatic Play' },
  { name: 'Fruit Party', category: 'slots', provider: 'Pragmatic Play' },
];

export const mockGames: Game[] = gameNames.map((g, i) => ({
  id: i + 1,
  name: g.name,
  thumbnail: null,
  game_code: `mock-${i + 1}`,
  provider: {
    slug: g.provider.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: g.provider,
  },
  gradient: gradients[i % gradients.length],
  isNew: i < 4,
}));

export const mockProviders: Provider[] = [
  { id: 'p1', name: 'Pragmatic Play', gameCount: 320, gradient: 'from-accent/60 to-accent-purple/60' },
  { id: 'p2', name: 'Evolution', gameCount: 180, gradient: 'from-accent-blue/60 to-accent-purple/60' },
  { id: 'p3', name: 'NetEnt', gameCount: 210, gradient: 'from-accent-gold/60 to-accent/60' },
  { id: 'p4', name: 'Play\'n GO', gameCount: 165, gradient: 'from-accent-purple/60 to-accent-blue/60' },
  { id: 'p5', name: 'Microgaming', gameCount: 290, gradient: 'from-accent/60 to-accent-gold/60' },
  { id: 'p6', name: 'Yggdrasil', gameCount: 95, gradient: 'from-accent-blue/60 to-accent/60' },
  { id: 'p7', name: 'Red Tiger', gameCount: 120, gradient: 'from-accent-purple/60 to-accent-gold/60' },
  { id: 'p8', name: 'Hacksaw', gameCount: 78, gradient: 'from-accent-gold/60 to-accent-purple/60' },
];

export const mockSports: SportCategory[] = [
  { id: 's1', name: 'Football', icon: '⚽', gradient: 'from-accent-blue/70 to-accent-purple/70', eventCount: 842 },
  { id: 's2', name: 'Basketball', icon: '🏀', gradient: 'from-accent/70 to-accent-gold/70', eventCount: 156 },
  { id: 's3', name: 'Tennis', icon: '🎾', gradient: 'from-accent-gold/70 to-accent/70', eventCount: 98 },
  { id: 's4', name: 'Esports', icon: '🎮', gradient: 'from-accent-purple/70 to-accent-blue/70', eventCount: 64 },
  { id: 's5', name: 'Ice Hockey', icon: '🏒', gradient: 'from-accent-blue/70 to-accent/70', eventCount: 45 },
  { id: 's6', name: 'MMA', icon: '🥊', gradient: 'from-accent/70 to-accent-purple/70', eventCount: 22 },
];

export const mockEvents: SportEvent[] = [
  { id: 'e1', league: 'Premier League', homeTeam: 'Arsenal', awayTeam: 'Chelsea', homeOdds: '2.10', drawOdds: '3.40', awayOdds: '3.20', startTime: 'Today 20:00' },
  { id: 'e2', league: 'La Liga', homeTeam: 'Barcelona', awayTeam: 'Real Madrid', homeOdds: '2.45', drawOdds: '3.30', awayOdds: '2.80', startTime: 'Today 22:00' },
  { id: 'e3', league: 'NBA', homeTeam: 'Lakers', awayTeam: 'Celtics', homeOdds: '1.95', awayOdds: '1.85', startTime: 'Tomorrow 02:30' },
  { id: 'e4', league: 'Champions League', homeTeam: 'Bayern', awayTeam: 'PSG', homeOdds: '2.20', drawOdds: '3.50', awayOdds: '3.00', startTime: 'Wed 21:00' },
  { id: 'e5', league: 'Serie A', homeTeam: 'Inter', awayTeam: 'Juventus', homeOdds: '2.05', drawOdds: '3.25', awayOdds: '3.60', startTime: 'Sat 18:00' },
];

export const mockWinners: Winner[] = [
  { id: 'w1', player: 'Alex***', game: 'Sweet Bonanza', amount: '12,450.00', currency: 'EUR' },
  { id: 'w2', player: 'Maria***', game: 'Lightning Roulette', amount: '8,200.00', currency: 'EUR' },
  { id: 'w3', player: 'John***', game: 'Gates of Olympus', amount: '25,100.00', currency: 'EUR' },
  { id: 'w4', player: 'Sofia***', game: 'Crazy Time', amount: '5,750.00', currency: 'EUR' },
  { id: 'w5', player: 'Max***', game: 'Mega Moolah', amount: '50,000.00', currency: 'EUR' },
  { id: 'w6', player: 'Elena***', game: 'Book of Dead', amount: '3,420.00', currency: 'EUR' },
];

export const mockPromotions: Promotion[] = [
  { id: 'pr1', title: 'Weekend Reload', subtitle: '50% up to €200 every weekend', cta: 'Get Bonus', gradient: 'from-accent-purple to-accent' },
  { id: 'pr2', title: 'Free Spins Friday', subtitle: '100 free spins on selected slots', cta: 'Spin Now', gradient: 'from-accent-blue to-accent-purple' },
  { id: 'pr3', title: 'VIP Rewards', subtitle: 'Exclusive perks for loyal players', cta: 'Join VIP', gradient: 'from-accent-gold to-accent' },
];

export const mockPromoBlocks: PromoBlock[] = [
  { id: 'pb1', title: 'Live Casino', description: 'Real dealers, real action — play now', gradient: 'from-accent-purple/90 to-card' },
  { id: 'pb2', title: 'Jackpot Hunt', description: 'Progressive jackpots waiting to drop', gradient: 'from-accent-gold/90 to-card' },
  { id: 'pb3', title: 'Sports Betting', description: 'Best odds on top leagues worldwide', gradient: 'from-accent-blue/90 to-card' },
];

export const categoryMenuItems = [
  { id: 'all', label: 'All Games', path: '/' },
  { id: 'slots', label: 'Slots', path: '/category/slots' },
  { id: 'live', label: 'Live Casino', path: '/category/live' },
  { id: 'sports', label: 'Sports', path: '/category/sports' },
  { id: 'jackpots', label: 'Jackpots', path: '/category/jackpots' },
  { id: 'promos', label: 'Bonuses', path: '/bonus' },
  { id: 'new', label: 'New Games', path: '/category/new' },
];
