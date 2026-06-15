import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePlayerStore } from '@/stores/playerStore';
import { canLoadChat, useCookieConsentStore } from '@/stores/cookieConsentStore';
import { useUiStore } from '@/stores/uiStore';
import { hideTawkWidget, isTawkConfigured, showTawkWidget } from '@/utils/tawkWidget';

function isGamePlayPath(pathname: string = window.location.pathname): boolean {
  return /^\/games\/\d+\/play$/.test(pathname);
}

function appendTawkOnLoad(handler: () => void) {
  window.Tawk_API = window.Tawk_API || {};
  const previous = window.Tawk_API.onLoad;
  window.Tawk_API.onLoad = () => {
    previous?.();
    handler();
  };
}

function loadTawkScript() {
  if (!isTawkConfigured()) return;
  if (document.getElementById('tawk-to-script')) return;

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();

  appendTawkOnLoad(() => {
    if (useUiStore.getState().liveChatOpen) {
      showTawkWidget();
    } else {
      hideTawkWidget();
    }
  });

  const script = document.createElement('script');
  script.id = 'tawk-to-script';
  script.async = true;
  script.src = `https://embed.tawk.to/${import.meta.env.VITE_TAWK_PROPERTY_ID}/${import.meta.env.VITE_TAWK_WIDGET_ID}`;
  script.charset = 'UTF-8';
  script.setAttribute('crossorigin', '*');
  document.body.appendChild(script);
}

function setVisitorAttributes(profile: {
  email: string;
  nickname: string | null;
  user_id: number;
  id: number;
  country: string | null;
  currency: string | null;
  kyc_status: string;
}) {
  const name = profile.nickname?.trim() || profile.email;
  const email = profile.email?.trim() || '';

  const attributes: Record<string, string> = {
    name,
    email,
    id: String(profile.user_id ?? profile.id),
    kyc_status: profile.kyc_status,
  };
  if (profile.country) attributes.country = profile.country;
  if (profile.currency) attributes.currency = profile.currency;

  window.Tawk_API?.setAttributes?.(attributes, () => undefined);
}

export function TawkToChat() {
  if (isGamePlayPath()) return null;

  return <TawkToChatInner />;
}

function TawkToChatInner() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const profile = usePlayerStore((s) => s.profile);
  const level = useCookieConsentStore((s) => s.level);
  const preferences = useCookieConsentStore((s) => s.preferences);
  const liveChatOpen = useUiStore((s) => s.liveChatOpen);
  const closeLiveChat = useUiStore((s) => s.closeLiveChat);
  const syncedRef = useRef(false);
  const chatAllowed = canLoadChat(level, preferences);

  useEffect(() => {
    if (!chatAllowed) {
      hideTawkWidget();
      closeLiveChat();
      return;
    }
    loadTawkScript();
  }, [chatAllowed, closeLiveChat]);

  useEffect(() => {
    if (!chatAllowed) return;

    if (liveChatOpen) {
      showTawkWidget();
    } else {
      hideTawkWidget();
    }
  }, [chatAllowed, liveChatOpen]);

  useEffect(() => {
    if (!isTawkConfigured() || !chatAllowed) return;

    if (!isAuthenticated) {
      syncedRef.current = false;
      window.Tawk_API?.logout?.();
      return;
    }

    if (!profile) return;

    const apply = () => {
      setVisitorAttributes(profile);
      syncedRef.current = true;
    };

    if (window.Tawk_API?.setAttributes) {
      apply();
    } else {
      appendTawkOnLoad(apply);
    }
  }, [isAuthenticated, chatAllowed, profile]);

  return null;
}
