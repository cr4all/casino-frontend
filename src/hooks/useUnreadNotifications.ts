import { useEffect, useState } from 'react';
import { notificationApi } from '@/api/notification.api';
import { useAuthStore } from '@/stores/authStore';

export function useUnreadNotifications(): number {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setCount(0);
      return;
    }
    notificationApi
      .getMessages(1, 50)
      .then((data) => setCount(data.items.filter((m) => !m.is_read).length))
      .catch(() => setCount(0));
  }, [isAuthenticated]);

  return count;
}
