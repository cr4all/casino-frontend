import type { LiveChatMessage } from '@/api/liveChat.api';
import { getEcho } from '@/lib/echo';

export interface LiveChatRealtimePayload {
  conversation_id: number;
  player_id: number;
  unread_player_count: number;
  message: LiveChatMessage;
}

export interface LiveChatRealtimeOptions {
  playerId: number;
  onMessage: (payload: LiveChatRealtimePayload) => void;
  onError?: (error: unknown) => void;
}

export function subscribeLiveChat({
  playerId,
  onMessage,
  onError,
}: LiveChatRealtimeOptions): () => void {
  const echo = getEcho();

  if (!echo) {
    onError?.(new Error('Missing Echo instance'));
    return () => undefined;
  }

  const channelName = `live-chat.player.${playerId}`;
  const channel = echo.private(channelName);

  channel.listen('.message.sent', (payload: LiveChatRealtimePayload) => {
    onMessage(payload);
  });

  channel.error((error: unknown) => {
    onError?.(error);
  });

  return () => {
    echo.leave(channelName);
  };
}
