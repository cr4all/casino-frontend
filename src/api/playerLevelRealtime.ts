import { getEcho } from '@/lib/echo';

export interface PlayerVipLevelUpdate {
  player_id: number;
  previous_level: number;
  vip_level: number;
  vip_level_name: string;
  vip_level_slug: string;
}

export interface PlayerLevelRealtimeOptions {
  playerId: number;
  onLevelUpdate: (update: PlayerVipLevelUpdate) => void;
  onConnected?: () => void;
  onError: (error: unknown) => void;
}

export function subscribePlayerVipLevel({
  playerId,
  onLevelUpdate,
  onConnected,
  onError,
}: PlayerLevelRealtimeOptions): () => void {
  const echo = getEcho();

  if (!echo) {
    onError(new Error('Missing Echo instance'));
    return () => undefined;
  }

  const channelName = `player.${playerId}`;
  const channel = echo.private(channelName);

  channel.listen('.vip.level.updated', (payload: PlayerVipLevelUpdate) => {
    onLevelUpdate(payload);
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
