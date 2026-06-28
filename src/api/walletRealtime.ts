import type { WalletBalanceUpdate } from '@/stores/walletStore';
import { getEcho } from '@/lib/echo';

export interface WalletRealtimeOptions {
  playerId: number;
  onBalance: (update: WalletBalanceUpdate) => void;
  onConnected?: () => void;
  onError: (error: unknown) => void;
}

function normalizeBalancePayload(payload: WalletBalanceUpdate): WalletBalanceUpdate {
  const total = payload.balance;
  const cash = payload.cash_balance ?? total;
  const bonus = payload.bonus_balance ?? '0';

  return {
    ...payload,
    cash_balance: cash,
    bonus_balance: bonus,
    withdrawable_balance: payload.withdrawable_balance ?? total,
    withdrawable_cash_balance: payload.withdrawable_cash_balance ?? cash,
    withdrawable_bonus_balance: payload.withdrawable_bonus_balance ?? '0',
    bonus_locked: payload.bonus_locked ?? false,
  };
}

export function subscribeWalletBalance({
  playerId,
  onBalance,
  onConnected,
  onError,
}: WalletRealtimeOptions): () => void {
  const echo = getEcho();

  if (!echo) {
    onError(new Error('Missing Echo instance'));
    return () => undefined;
  }

  const channelName = `wallet.player.${playerId}`;
  const channel = echo.private(channelName);

  channel.listen('.balance.updated', (payload: WalletBalanceUpdate) => {
    onBalance(normalizeBalancePayload(payload));
  });

  channel.subscribed(() => {
    onConnected?.();
  });

  channel.error((error: unknown) => {
    onError(error);
  });

  return () => {
    echo.leave(channelName);
  };
}
