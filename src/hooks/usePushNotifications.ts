import { useEffect, useRef } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { notificationApi } from '@/api/notification.api';
import { usePlayerSession } from '@/hooks/usePlayerSession';
import { router } from '@/router';
import { getNativePlatform, isNativeApp } from '@/utils/capacitor';

/**
 * Registers the native device for FCM/APNs push and syncs the token to the API
 * while the player is logged in. Opens /notifications when a notice push is tapped.
 */
export function usePushNotifications() {
  const { hasHydrated, enabled } = usePlayerSession();
  const tokenRef = useRef<string | null>(null);
  const syncedTokenRef = useRef<string | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    if (!hasHydrated || !isNativeApp()) {
      return;
    }

    const platform = getNativePlatform();
    if (platform !== 'android' && platform !== 'ios') {
      return;
    }

    let cancelled = false;
    const handles: Array<{ remove: () => Promise<void> }> = [];

    const syncToken = (token: string) => {
      if (!enabledRef.current || cancelled || token === syncedTokenRef.current) {
        return;
      }
      syncedTokenRef.current = token;
      void notificationApi.registerDeviceToken(token, platform).catch(() => {
        syncedTokenRef.current = null;
      });
    };

    const setup = async () => {
      const permission = await PushNotifications.requestPermissions();
      if (cancelled || permission.receive !== 'granted') {
        return;
      }

      handles.push(
        await PushNotifications.addListener('registration', (event) => {
          const token = event.value?.trim();
          if (!token || cancelled) {
            return;
          }
          tokenRef.current = token;
          syncToken(token);
        }),
      );

      handles.push(
        await PushNotifications.addListener('registrationError', () => {
          tokenRef.current = null;
          syncedTokenRef.current = null;
        }),
      );

      handles.push(
        await PushNotifications.addListener('pushNotificationActionPerformed', () => {
          void router.navigate('/notifications');
        }),
      );

      await PushNotifications.register();
    };

    void setup();

    return () => {
      cancelled = true;
      for (const handle of handles) {
        void handle.remove();
      }
    };
  }, [hasHydrated]);

  useEffect(() => {
    if (!enabled || !tokenRef.current) {
      return;
    }
    const platform = getNativePlatform();
    if (platform !== 'android' && platform !== 'ios') {
      return;
    }
    if (tokenRef.current === syncedTokenRef.current) {
      return;
    }
    const token = tokenRef.current;
    syncedTokenRef.current = token;
    void notificationApi.registerDeviceToken(token, platform).catch(() => {
      syncedTokenRef.current = null;
    });
  }, [enabled]);
}
