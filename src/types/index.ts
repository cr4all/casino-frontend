export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface User {
  id: number;
  email: string;
  role?: string;
}

export interface WithdrawalEligibility {
  allowed: boolean;
  unlimited: boolean;
  max_amount: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  kyc_verified: boolean;
  requires_verification: boolean;
  email_verified_limit: string;
  phone_verified_limit: string;
}

export interface PlayerProfile {
  id: number;
  user_id: number;
  email: string;
  email_verified?: boolean;
  nickname: string | null;
  phone: string | null;
  phone_verified?: boolean;
  country: string | null;
  country_name: string | null;
  currency: string | null;
  language: string | null;
  status: string;
  kyc_status: string;
  withdrawal_eligibility?: WithdrawalEligibility | null;
  vip_level?: number;
  vip_level_name?: string;
  vip_level_slug?: string;
}

export interface PlayerLevelTier {
  level: number;
  name: string;
  slug: string;
  sort_order: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

export interface WalletBalance {
  wallet_id: number;
  player_id: number;
  currency: string;
  balance: string;
  cash_balance: string;
  bonus_balance: string;
  withdrawable_balance: string;
  withdrawable_cash_balance: string;
  withdrawable_bonus_balance: string;
  bonus_locked: boolean;
  status: string;
}

export type BetFundingSource = 'cash' | 'bonus' | 'mixed' | 'free_spin';
export type WalletBucket = 'cash' | 'bonus';

export interface Transaction {
  id: number;
  type: string;
  amount: string;
  balance_after?: string | null;
  cash_balance_after?: string | null;
  bonus_balance_after?: string | null;
  funding_source?: BetFundingSource | null;
  wallet_bucket?: WalletBucket | null;
  status: string;
  description: string | null;
  reference_type?: string | null;
  reference_id?: string | null;
  created_at: string | null;
}

export interface BetHistoryItem {
  id: number;
  round_id: string;
  game: {
    id: number | null;
    name: string;
    provider: string | null;
  };
  bet_amount: string;
  bet_cash_amount?: string;
  bet_bonus_amount?: string;
  win_amount: string;
  net_amount: string;
  status: string;
  funding_source: BetFundingSource;
  spin_type?: string;
  currency: string;
  played_at: string | null;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaginatedTransactions {
  items: Transaction[];
  pagination: PaginationMeta;
}

export interface PaginatedBetHistory {
  items: BetHistoryItem[];
  pagination: PaginationMeta;
}

export interface Game {
  id: number;
  name: string;
  name_ko?: string | null;
  thumbnail: string | null;
  game_code: string;
  symbol?: string | null;
  vendor?: { id: number; slug: string; name: string } | null;
  provider?: { slug: string; name: string } | null;
  type?: { id: number; slug: string; name: string } | null;
  gradient?: string;
  isNew?: boolean;
}

export interface Provider {
  id: string;
  name: string;
  gameCount: number;
  gradient: string;
}

export interface SportCategory {
  id: string;
  name: string;
  icon: string;
  gradient: string;
  eventCount: number;
}

export interface SportEvent {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeOdds: string;
  drawOdds?: string;
  awayOdds: string;
  startTime: string;
}

export interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  gradient: string;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  gradient: string;
}

export interface Winner {
  id: string;
  player: string;
  game: string;
  amount: string;
  currency: string;
}

export interface PromoBlock {
  id: string;
  title: string;
  description: string;
  gradient: string;
}
