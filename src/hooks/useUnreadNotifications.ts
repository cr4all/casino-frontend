import { useNotificationStore } from '@/stores/notificationStore';

export function useUnreadNotifications(): number {
  return useNotificationStore((s) => s.unreadCount);
}
