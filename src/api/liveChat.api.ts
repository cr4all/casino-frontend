import api from '@/api/axios';
import type { ApiResponse } from '@/types';

export interface LiveChatConfig {
  enabled: boolean;
  provider?: 'native';
  tawk: {
    configured: boolean;
    property_id?: string;
    widget_id?: string;
  };
}

export interface SupportAttachment {
  id: number;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  url: string;
}

export interface LiveChatMessage {
  id: number;
  sender_type: 'player' | 'admin';
  body: string;
  attachments?: SupportAttachment[];
  created_at: string | null;
}

export interface LiveChatConversation {
  id: number;
  status: string;
  unread_player_count: number;
  last_message_at: string | null;
}

export const liveChatApi = {
  getConfig: async () => {
    const { data } = await api.get<ApiResponse<LiveChatConfig>>('/live-chat/config');
    return data.data;
  },

  getConversation: async () => {
    const { data } = await api.get<ApiResponse<LiveChatConversation>>('/live-chat/conversation');
    return data.data;
  },

  getMessages: async (params?: { after_id?: number; before_id?: number }) => {
    const { data } = await api.get<ApiResponse<{ conversation_id: number; items: LiveChatMessage[]; has_more: boolean }>>(
      '/live-chat/messages',
      { params },
    );
    return data.data;
  },

  sendMessage: async (payload: { body?: string; file?: File }) => {
    const formData = new FormData();
    if (payload.body?.trim()) {
      formData.append('body', payload.body.trim());
    }
    if (payload.file) {
      formData.append('file', payload.file);
    }

    const { data } = await api.post<ApiResponse<{ conversation_id: number; message: LiveChatMessage }>>(
      '/live-chat/messages',
      formData,
    );
    return data.data;
  },

  getUnreadCount: async () => {
    const { data } = await api.get<ApiResponse<{ unread_count: number }>>('/live-chat/unread');
    return data.data;
  },
};
