import api from '@/api/axios';
import type { ApiResponse } from '@/types';

export interface InternalMessage {
  id: number;
  subject: string;
  body: string;
  is_read: boolean;
  created_at: string | null;
}

export interface PaginatedMessages {
  items: InternalMessage[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export const notificationApi = {
  getMessages: async (page = 1, perPage = 20) => {
    const { data } = await api.get<ApiResponse<PaginatedMessages>>('/notifications/messages', {
      params: { page, per_page: perPage },
    });
    return data.data;
  },
};
