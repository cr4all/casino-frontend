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

const messagesInflight = new Map<string, Promise<PaginatedMessages>>();

export const notificationApi = {
  getMessages: async (page = 1, perPage = 20) => {
    const key = `${page}:${perPage}`;
    const inflight = messagesInflight.get(key);
    if (inflight) return inflight;

    const promise = api
      .get<ApiResponse<PaginatedMessages>>('/notifications/messages', {
        params: { page, per_page: perPage },
      })
      .then(({ data }) => data.data)
      .finally(() => {
        if (messagesInflight.get(key) === promise) {
          messagesInflight.delete(key);
        }
      });

    messagesInflight.set(key, promise);
    return promise;
  },
};
