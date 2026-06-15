import { create } from 'zustand';
import { notificationApi } from '@/api/notification.api';

interface NotificationState {
  unreadCount: number;
  fetchUnreadCount: () => Promise<void>;
  clear: () => void;
}

let unreadInflight: Promise<void> | null = null;

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,

  fetchUnreadCount: async () => {
    if (unreadInflight) return unreadInflight;

    unreadInflight = (async () => {
      try {
        const data = await notificationApi.getMessages(1, 50);
        set({ unreadCount: data.items.filter((m) => !m.is_read).length });
      } catch {
        set({ unreadCount: 0 });
      } finally {
        unreadInflight = null;
      }
    })();

    return unreadInflight;
  },

  clear: () => set({ unreadCount: 0 }),
}));
