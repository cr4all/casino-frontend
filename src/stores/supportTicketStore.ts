import { create } from 'zustand';
import { supportTicketsApi } from '@/api/supportTickets.api';

interface SupportTicketState {
  unreadCount: number;
  fetchUnreadCount: () => Promise<void>;
  setUnreadCount: (count: number) => void;
  clear: () => void;
}

export const useSupportTicketStore = create<SupportTicketState>((set) => ({
  unreadCount: 0,

  fetchUnreadCount: async () => {
    try {
      const data = await supportTicketsApi.getUnreadCount();
      set({ unreadCount: data.unread_count });
    } catch {
      // Keep the previous count on transient failures.
    }
  },

  setUnreadCount: (count) => set({ unreadCount: count }),

  clear: () => set({ unreadCount: 0 }),
}));
