import { useEffect, useRef } from 'react';
import { playerApi } from '@/api/wallet.api';
import { useAuthStore } from '@/stores/authStore';

const propertyId = import.meta.env.VITE_TAWK_PROPERTY_ID;
const widgetId = import.meta.env.VITE_TAWK_WIDGET_ID;

function appendTawkOnLoad(handler: () => void) {
  window.Tawk_API = window.Tawk_API || {};
  const previous = window.Tawk_API.onLoad;
  window.Tawk_API.onLoad = () => {
    previous?.();
    handler();
  };
}

function loadTawkScript() {
  if (!propertyId || !widgetId) return;
  if (document.getElementById('tawk-to-script')) return;

  window.Tawk_API = window.Tawk_API || {};
  window.Tawk_LoadStart = new Date();

  // Collapse greeting preview on load; keep corner chat bubble only.
  appendTawkOnLoad(() => {
    const minimize = () => window.Tawk_API?.minimize?.();
    minimize();
    window.setTimeout(minimize, 100);
  });

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
  const syncedRef = useRef(false);

  useEffect(() => {
    loadTawkScript();
  }, []);

  useEffect(() => {
    if (!propertyId || !widgetId) return;

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
  }, [isAuthenticated]);

  return null;
}
