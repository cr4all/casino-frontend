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

export interface LiveChatMessage {
  id: number;
  sender_type: 'player' | 'admin';
  body: string;
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

  getMessages: async (afterId?: number) => {
    const { data } = await api.get<ApiResponse<{ conversation_id: number; items: LiveChatMessage[] }>>(
      '/live-chat/messages',
      { params: afterId ? { after_id: afterId } : undefined },
    );
    return data.data;
  },

  sendMessage: async (body: string) => {
    const { data } = await api.post<ApiResponse<{ conversation_id: number; message: LiveChatMessage }>>(
      '/live-chat/messages',
      { body },
    );
    return data.data;
  },

  getUnreadCount: async () => {
    const { data } = await api.get<ApiResponse<{ unread_count: number }>>('/live-chat/unread');
    return data.data;
  },
};
