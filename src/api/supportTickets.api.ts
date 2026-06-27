import api from '@/api/axios';
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

  get: async (id: number) => {
    const { data } = await api.get<
      ApiResponse<{ ticket: SupportTicketDetail; messages: SupportTicketMessage[] }>
    >(`/support-tickets/${id}`);
    return data.data;
  },

  reply: async (id: number, body: string) => {
    const { data } = await api.post<ApiResponse<{ message: SupportTicketMessage }>>(
      `/support-tickets/${id}/messages`,
      { body },
    );
    return data.data.message;
  },
};
