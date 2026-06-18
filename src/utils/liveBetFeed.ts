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

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
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
  const betAmount = roundMoney(randomBetween(1, 100));

  let multiplier: number;
  const roll = Math.random();
  if (roll < 0.52) {
    multiplier = 0;
  } else if (roll < 0.68) {
    multiplier = roundMoney(randomBetween(0.1, 0.95));
  } else {
    multiplier = roundMoney(randomBetween(1.05, 12));
  }

  const payout = roundMoney(betAmount * multiplier);
  const isWin = payout > 0;

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
