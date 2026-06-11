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

export interface PlayerProfile {
  id: number;
  user_id: number;
  email: string;
  nickname: string | null;
  country: string | null;
  currency: string | null;
  language: string | null;
  status: string;
  kyc_status: string;
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
  status: string;
}

export interface Transaction {
  id: number;
  type: string;
  amount: string;
  balance_after?: string | null;
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
  win_amount: string;
  net_amount: string;
  status: string;
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
