import { canLoadChat, useCookieConsentStore } from '@/stores/cookieConsentStore';
import { useUiStore } from '@/stores/uiStore';
import { showTawkWidget } from '@/utils/tawkWidget';
import { useLiveChatConfig } from '@/hooks/useLiveChat';

/**
 * Opens live chat only when chat cookies are allowed.
 * Otherwise opens cookie settings so the user can opt in first.
 */
export function useRequestLiveChat() {
  const openLiveChat = useUiStore((s) => s.openLiveChat);
  const level = useCookieConsentStore((s) => s.level);
  const preferences = useCookieConsentStore((s) => s.preferences);
  const openCookieSettings = useCookieConsentStore((s) => s.openSettings);
  const { nativeEnabled } = useLiveChatConfig();

  return () => {
    if (!canLoadChat(level, preferences)) {
      openCookieSettings();
      return;
    }

    openLiveChat();
    if (!nativeEnabled) {
      showTawkWidget();
    }
  };
}
