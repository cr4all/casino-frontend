import api from '@/api/axios';
import type { ApiResponse } from '@/types';

export interface InternalMessage {
  id: number;
  subject: string;
  body: string;
  is_read: boolean;
  source?: 'system' | 'announcement';
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

function clearMessagesCache() {
  messagesInflight.clear();
}

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

  markAsRead: async (messageId: number) => {
    const { data } = await api.post<ApiResponse<{ id: number; is_read: boolean }>>(
      `/notifications/messages/${messageId}/read`,
    );
    clearMessagesCache();
    return data.data;
  },

  markAnnouncementRead: async (announcementId: number) => {
    const { data } = await api.post<ApiResponse<{ id: number; is_read: boolean }>>(
      `/notifications/announcements/${announcementId}/read`,
    );
    clearMessagesCache();
    return data.data;
  },

  getPopups: async () => {
    const { data } = await api.get<
      ApiResponse<{
        items: AnnouncementPopup[];
      }>
    >('/notifications/popups');
    return data.data.items;
  },

  dismissPopup: async (popupId: number) => {
    const { data } = await api.post<ApiResponse<{ id: number; dismissed_at: string | null }>>(
      `/notifications/popups/${popupId}/dismiss`,
    );
    return data.data;
  },
};

export interface AnnouncementPopup {
  id: number;
  title: string;
  body: string;
  starts_at: string | null;
  ends_at: string | null;
  published_at: string | null;
}
