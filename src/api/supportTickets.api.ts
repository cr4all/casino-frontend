import api from '@/api/axios';
import type { SupportAttachment } from '@/api/liveChat.api';
import type { ApiResponse } from '@/types';

export type SupportTicketCategory = 'account' | 'payment' | 'bonus' | 'game' | 'other';
export type SupportTicketStatus = 'open' | 'pending' | 'resolved' | 'closed';

export interface SupportTicketSummary {
  id: number;
  subject: string;
  category: SupportTicketCategory;
  status: SupportTicketStatus;
  priority: string;
  unread_player_count: number;
  last_message_at: string | null;
  created_at: string | null;
}

export interface SupportTicketMessage {
  id: number;
  sender_type: 'player' | 'admin';
  body: string;
  attachments?: SupportAttachment[];
  created_at: string | null;
}

export interface SupportTicketDetail extends SupportTicketSummary {
  closed_at: string | null;
}

export const supportTicketsApi = {
  list: async (status?: SupportTicketStatus) => {
    const { data } = await api.get<
      ApiResponse<{
        items: SupportTicketSummary[];
        pagination: {
          current_page: number;
          last_page: number;
          per_page: number;
          total: number;
        };
      }>
    >('/support-tickets', { params: status ? { status } : undefined });
    return data.data;
  },

  create: async (payload: { subject: string; category: SupportTicketCategory; body: string }) => {
    const { data } = await api.post<ApiResponse<{ ticket: SupportTicketDetail }>>('/support-tickets', payload);
    return data.data.ticket;
  },

  get: async (id: number, params?: { after_id?: number; before_id?: number }) => {
    const { data } = await api.get<
      ApiResponse<{ ticket: SupportTicketDetail; messages: SupportTicketMessage[]; has_more: boolean }>
    >(`/support-tickets/${id}`, { params });
    return data.data;
  },

  reply: async (id: number, payload: { body?: string; file?: File }) => {
    const formData = new FormData();
    if (payload.body?.trim()) {
      formData.append('body', payload.body.trim());
    }
    if (payload.file) {
      formData.append('file', payload.file);
    }

    const { data } = await api.post<ApiResponse<{ message: SupportTicketMessage }>>(
      `/support-tickets/${id}/messages`,
      formData,
    );
    return data.data.message;
  },

  getUnreadCount: async () => {
    const { data } = await api.get<ApiResponse<{ unread_count: number }>>('/support-tickets/unread');
    return data.data;
  },
};
