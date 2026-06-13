import type { WalletBalanceUpdate } from '@/stores/walletStore';
import { getEcho } from '@/lib/echo';

export interface WalletRealtimeOptions {
  playerId: number;
  onBalance: (update: WalletBalanceUpdate) => void;
  onConnected?: () => void;
  onError: (error: unknown) => void;
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
    onBalance(payload);
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
