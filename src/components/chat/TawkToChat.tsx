import { useEffect, useRef } from 'react';
import { playerApi } from '@/api/wallet.api';
import { router } from '@/router';
import { useAuthStore } from '@/stores/authStore';
import { canLoadChat, useCookieConsentStore } from '@/stores/cookieConsentStore';

const propertyId = import.meta.env.VITE_TAWK_PROPERTY_ID;
const widgetId = import.meta.env.VITE_TAWK_WIDGET_ID;

const COLLAPSE_RETRY_MS = [0, 100, 300, 600, 1200];

function ensureWidgetCollapsed() {
  const collapse = () => {
    window.Tawk_API?.showWidget?.();
    window.Tawk_API?.minimize?.();
  };

  for (const delay of COLLAPSE_RETRY_MS) {
    window.setTimeout(collapse, delay);
  }
}

function appendTawkOnLoad(handler: () => void) {
  window.Tawk_API = window.Tawk_API || {};
  const previous = window.Tawk_API.onLoad;
  window.Tawk_API.onLoad = () => {
    previous?.();
    handler();
  };
}

function configureTawkBehavior() {
  window.Tawk_API = window.Tawk_API || {};

  appendTawkOnLoad(() => {
    ensureWidgetCollapsed();
  });

  const previousSystemMessage = window.Tawk_API.onChatMessageSystem;
  window.Tawk_API.onChatMessageSystem = (message) => {
    previousSystemMessage?.(message);
    ensureWidgetCollapsed();
  };
}

function loadTawkScript() {
  if (!propertyId || !widgetId) return;
  if (document.getElementById('tawk-to-script')) {
    ensureWidgetCollapsed();
    return;
  }

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();
  configureTawkBehavior();

  const script = document.createElement('script');
  script.id = 'tawk-to-script';
  script.async = true;
  script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const level = useCookieConsentStore((s) => s.level);
  const preferences = useCookieConsentStore((s) => s.preferences);
  const syncedRef = useRef(false);
  const chatAllowed = canLoadChat(level, preferences);

  useEffect(() => {
    if (!chatAllowed) return;
    loadTawkScript();
  }, [chatAllowed]);

  useEffect(() => {
    if (!chatAllowed) return;

    return router.subscribe(() => {
      ensureWidgetCollapsed();
    });
  }, [chatAllowed]);

  useEffect(() => {
    if (!propertyId || !widgetId || !chatAllowed) return;

    if (!isAuthenticated) {
      syncedRef.current = false;
      window.Tawk_API?.logout?.();
      return;
    }

    let cancelled = false;

    const syncVisitor = async () => {
      try {
        const profile = await playerApi.getMe();
        if (cancelled) return;

        const apply = () => {
          if (cancelled) return;
          setVisitorAttributes(profile);
          syncedRef.current = true;
        };

        if (window.Tawk_API?.setAttributes) {
          apply();
        } else {
          appendTawkOnLoad(apply);
        }
      } catch {
        syncedRef.current = false;
      }
    };

    syncVisitor();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, chatAllowed]);

  return null;
}
