import { useCallback, useEffect, useRef, useState } from 'react';
import { liveChatApi, type LiveChatConfig, type LiveChatMessage } from '@/api/liveChat.api';
import { subscribeLiveChat } from '@/api/liveChatRealtime';
import { useAuthStore } from '@/stores/authStore';
import { useLiveChatStore } from '@/stores/liveChatStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useUiStore } from '@/stores/uiStore';

let configCache: LiveChatConfig | null = null;
let configPromise: Promise<LiveChatConfig> | null = null;

export function useLiveChatConfig() {
  const [config, setConfig] = useState<LiveChatConfig | null>(configCache);
  const [loading, setLoading] = useState(!configCache);

  useEffect(() => {
    if (configCache) {
      setConfig(configCache);
      setLoading(false);
      return;
    }

    if (!configPromise) {
      configPromise = liveChatApi.getConfig();
    }

    configPromise
      .then((value) => {
        configCache = value;
        setConfig(value);
      })
      .catch(() => {
        setConfig({ enabled: false, tawk: { configured: false } });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { config, loading, nativeEnabled: Boolean(config?.enabled) };
}

export function useLiveChat(active: boolean) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const playerId = usePlayerStore((s) => s.profile?.id);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<LiveChatMessage[]>([]);

  const mergeMessages = useCallback((incoming: LiveChatMessage[]) => {
    if (!incoming.length) return;

    setMessages((current) => {
      const known = new Set(current.map((m) => m.id));
      const next = [...current];

      for (const message of incoming) {
        if (!known.has(message.id)) {
          next.push(message);
        }
      }

      next.sort((a, b) => a.id - b.id);
      messagesRef.current = next;
      return next;
    });
  }, []);

  const loadMessages = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      await liveChatApi.getConversation();
      const result = await liveChatApi.getMessages();
      messagesRef.current = result.items;
      setMessages(result.items);
      useLiveChatStore.getState().setUnreadCount(0);
    } catch {
      setError('load_failed');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!active || !isAuthenticated) return;
    void loadMessages();
  }, [active, isAuthenticated, loadMessages]);

  useEffect(() => {
    if (!active || !isAuthenticated || !playerId) return;

    const unsubscribe = subscribeLiveChat({
      playerId,
      onMessage: (payload) => {
        mergeMessages([payload.message]);
        if (payload.message.sender_type === 'admin' && !useUiStore.getState().liveChatOpen) {
          useLiveChatStore.getState().setUnreadCount(payload.unread_player_count);
        }
      },
    });

    const pollTimer = window.setInterval(() => {
      if (!useUiStore.getState().liveChatOpen) {
        void useLiveChatStore.getState().fetchUnreadCount();
        return;
      }

      void liveChatApi.getMessages(messagesRef.current.at(-1)?.id).then((result) => {
        mergeMessages(result.items);
      }).catch(() => undefined);
    }, 3000);

    return () => {
      unsubscribe();
      window.clearInterval(pollTimer);
    };
  }, [active, isAuthenticated, mergeMessages, playerId]);

  const sendMessage = useCallback(async (body: string) => {
    const trimmed = body.trim();
    if (!trimmed || sending) return false;

    setSending(true);
    setError(null);

    try {
      const result = await liveChatApi.sendMessage(trimmed);
      mergeMessages([result.message]);
      return true;
    } catch {
      setError('send_failed');
      return false;
    } finally {
      setSending(false);
    }
  }, [mergeMessages, sending]);

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    reload: loadMessages,
  };
}
