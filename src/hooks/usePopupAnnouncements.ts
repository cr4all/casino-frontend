import { useCallback, useEffect, useState } from 'react';
import { notificationApi, type AnnouncementPopup } from '@/api/notification.api';
import { useAuthStore } from '@/stores/authStore';
import { filterSnoozedPopups } from '@/utils/popupSnooze';

export function usePopupAnnouncements() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.user?.id);
  const [queue, setQueue] = useState<AnnouncementPopup[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || userId == null) {
      setQueue([]);
      setLoaded(false);
      return;
    }

    let cancelled = false;

    notificationApi
      .getPopups()
      .then((items) => {
        if (!cancelled) {
          setQueue(filterSnoozedPopups(userId, items));
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, userId]);

  const dismissPopup = useCallback((popupId: number) => {
    setQueue((prev) => prev.filter((popup) => popup.id !== popupId));
  }, []);

  const activePopup = loaded ? queue[0] ?? null : null;

  return { activePopup, dismissPopup, userId };
}
