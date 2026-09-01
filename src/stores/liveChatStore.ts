import { create } from 'zustand';
import { liveChatApi } from '@/api/liveChat.api';
import { hasAccessToken } from '@/stores/authStore';

interface LiveChatState {
  unreadCount: number;
  fetchUnreadCount: () => Promise<void>;
  setUnreadCount: (count: number) => void;
  clear: () => void;
}

export const useLiveChatStore = create<LiveChatState>((set) => ({
  unreadCount: 0,

  fetchUnreadCount: async () => {
    if (!hasAccessToken()) return;

    try {
      const config = await liveChatApi.getConfig();
      if (!config.enabled) {
        set({ unreadCount: 0 });
        return;
      }

      const data = await liveChatApi.getUnreadCount();
      set({ unreadCount: data.unread_count });
    } catch {
      // Keep the previous count on transient failures.
    }
  },

  setUnreadCount: (count) => set({ unreadCount: count }),

  clear: () => set({ unreadCount: 0 }),
}));
