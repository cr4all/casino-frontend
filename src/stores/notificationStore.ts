import { create } from 'zustand';
import { notificationApi } from '@/api/notification.api';
import { hasAccessToken } from '@/stores/authStore';

interface NotificationState {
  unreadCount: number;
  fetchUnreadCount: () => Promise<void>;
  setUnreadCount: (count: number) => void;
  markMessageRead: () => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,

  fetchUnreadCount: async () => {
    if (!hasAccessToken()) return;

    try {
      const data = await notificationApi.getMessages(1, 50);
      set({ unreadCount: data.items.filter((m) => !m.is_read).length });
    } catch {
      // Keep the previous count on transient failures.
    }
  },

  setUnreadCount: (count) => set({ unreadCount: count }),

  markMessageRead: () => {
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) }));
  },

  clear: () => set({ unreadCount: 0 }),
}));
