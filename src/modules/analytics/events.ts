export enum CasinoAnalyticsEvent {
  LoginCompleted = 'login_completed',
  RegisterCompleted = 'register_completed',
  Logout = 'logout',

  DepositSubmitted = 'deposit_submitted',
  WithdrawSubmitted = 'withdraw_submitted',
  BonusClaimed = 'bonus_claimed',
  GameLaunchClicked = 'game_launch_clicked',
  GameLaunched = 'game_launched',
  SportsLaunched = 'sports_launched',
  BetHistoryViewed = 'bet_history_viewed',

  EmailVerificationRequested = 'email_verification_requested',
  EmailVerified = 'email_verified',
  PhoneVerificationRequested = 'phone_verification_requested',
  PhoneVerified = 'phone_verified',
  KycStarted = 'kyc_started',
  KycStatusUpdated = 'kyc_status_updated',
  PasswordChanged = 'password_changed',
  ProfileUpdated = 'profile_updated',

  PageView = '$pageview',
}

export type VerificationChannel = 'email' | 'phone';

export type CasinoAnalyticsEventProperties = {
  [CasinoAnalyticsEvent.LoginCompleted]: Record<string, never>;
  [CasinoAnalyticsEvent.RegisterCompleted]: Record<string, never>;
  [CasinoAnalyticsEvent.Logout]: Record<string, never>;

  [CasinoAnalyticsEvent.DepositSubmitted]: {
    deposit_id: number;
    amount: string;
    currency?: string;
    option_key: string;
    country: string;
    status: string;
  };
  [CasinoAnalyticsEvent.WithdrawSubmitted]: {
    withdrawal_id: number;
    amount: string;
    option_key: string;
    country: string;
    status: string;
  };
  [CasinoAnalyticsEvent.BonusClaimed]: {
    policy_id: number;
    bonus_id: number;
    amount: string;
    status: string;
  };
  [CasinoAnalyticsEvent.GameLaunchClicked]: {
    game_id: number;
  };
  [CasinoAnalyticsEvent.GameLaunched]: {
    game_id: number;
  };
  [CasinoAnalyticsEvent.SportsLaunched]: {
    mode: string;
    language?: string;
  };
  [CasinoAnalyticsEvent.BetHistoryViewed]: {
    tab: 'bets' | 'sports_bets';
    page?: number;
  };

  [CasinoAnalyticsEvent.EmailVerificationRequested]: {
    channel: 'email';
  };
  [CasinoAnalyticsEvent.EmailVerified]: {
    channel: 'email';
  };
  [CasinoAnalyticsEvent.PhoneVerificationRequested]: {
    channel: 'phone';
  };
  [CasinoAnalyticsEvent.PhoneVerified]: {
    channel: 'phone';
  };
  [CasinoAnalyticsEvent.KycStarted]: {
    kyc_status: string;
  };
  [CasinoAnalyticsEvent.KycStatusUpdated]: {
    kyc_status: string;
    previous_kyc_status?: string;
  };
  [CasinoAnalyticsEvent.PasswordChanged]: Record<string, never>;
  [CasinoAnalyticsEvent.ProfileUpdated]: {
    fields: string[];
  };

  [CasinoAnalyticsEvent.PageView]: {
    $current_url: string;
  };
};
