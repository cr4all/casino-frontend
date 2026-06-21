import type { Game } from '@/types';

export interface LiveBetEntry {
  id: string;
  game: Game;
  userHidden: boolean;
  username: string;
  time: Date;
  betAmount: number;
  multiplier: number;
  payout: number;
  isWin: boolean;
}

const VISIBLE_USERS = [
  'LuckyAce',
  'SpinKing',
  'NightWolf',
  'GoldRush',
  'CryptoFox',
  'BetMaster',
  'SlotQueen',
  'RollHigh',
  'NeonPlayer',
  'JackpotJoe',
  'VegaStar',
  'ChipHunter',
  'RoyalBet',
  'TurboWin',
  'MoonGambler',
];

/** Preset bet levels between $5 and $20 — amounts players can actually select in-game. */
const BETTABLE_STAKES = [5, 7.5, 10, 12.5, 15, 17.5, 20] as const;

/** Weighted toward common whole-dollar presets; half-dollar totals appear less often. */
const BET_STAKES: number[] = [
  5, 5, 5, 5,
  10, 10, 10, 10,
  15, 15, 15,
  20, 20, 20,
  7.5, 7.5,
  12.5, 12.5,
  17.5,
];

const STAKES_BY_TYPE: Record<string, readonly number[]> = {
  slot: BET_STAKES,
  live_casino: BETTABLE_STAKES,
  table: BETTABLE_STAKES,
  crash: [5, 5, 10, 10, 15, 15, 20, 20],
  mini_game: BETTABLE_STAKES,
  fishing: BETTABLE_STAKES,
};

const DEFAULT_STAKES = BET_STAKES;

/** Slot-style win multipliers — mostly small wins, occasional medium hits. */
const WIN_MULTIPLIERS = [
  1.2, 1.4, 1.5, 1.6, 1.8, 2, 2.2, 2.5, 3, 3.5, 4, 5, 6, 8, 10, 12, 15, 20, 25, 50,
];

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function stakesForGame(game: Game): readonly number[] {
  const slug = game.type?.slug ?? 'slot';
  return STAKES_BY_TYPE[slug] ?? DEFAULT_STAKES;
}

function pickBetAmount(game: Game): number {
  return pickRandom(stakesForGame(game));
}

function pickMultiplier(isCrash: boolean): number {
  const roll = Math.random();

  if (roll < 0.55) {
    return 0;
  }

  if (isCrash) {
    if (roll < 0.85) {
      return roundMoney(randomBetween(1.05, 3.5));
    }
    return roundMoney(randomBetween(3.5, 15));
  }

  if (roll < 0.88) {
    return pickRandom(WIN_MULTIPLIERS.filter((m) => m <= 5));
  }

  if (roll < 0.97) {
    return pickRandom(WIN_MULTIPLIERS.filter((m) => m <= 15));
  }

  return pickRandom(WIN_MULTIPLIERS);
}

export function maskUsername(username: string): string {
  if (!username) return '';
  return `${username.charAt(0)}...`;
}

export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function createLiveBetEntry(games: Game[]): LiveBetEntry | null {
  if (games.length === 0) return null;

  const game = pickRandom(games);
  const userHidden = Math.random() < 0.32;
  const username = userHidden ? '' : pickRandom(VISIBLE_USERS);
  const betAmount = pickBetAmount(game);
  const isCrash = game.type?.slug === 'crash';

  const multiplier = pickMultiplier(isCrash);
  const payout = multiplier > 0 ? roundMoney(betAmount * multiplier) : 0;
  const isWin = multiplier >= 1;

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    game,
    userHidden,
    username,
    time: new Date(),
    betAmount,
    multiplier,
    payout,
    isWin,
  };
}

export function seedLiveBetEntries(games: Game[], count: number): LiveBetEntry[] {
  const entries: LiveBetEntry[] = [];
  for (let i = 0; i < count; i += 1) {
    const entry = createLiveBetEntry(games);
    if (!entry) break;
    entry.time = new Date(Date.now() - i * randomBetween(4000, 18000));
    entries.push(entry);
  }
  return entries;
}
