import { useEffect, useRef, useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { useTranslation } from '@/hooks/useTranslation';
import {
  useCookieConsentStore,
  type CookiePreferences,
} from '@/stores/cookieConsentStore';

export function CookieSettingsModal() {
  const { t } = useTranslation();
  const settingsOpen = useCookieConsentStore((s) => s.settingsOpen);
  const preferences = useCookieConsentStore((s) => s.preferences);
  const closeSettings = useCookieConsentStore((s) => s.closeSettings);
  const savePreferences = useCookieConsentStore((s) => s.savePreferences);
  const acceptAll = useCookieConsentStore((s) => s.acceptAll);

  const [draft, setDraft] = useState<CookiePreferences>(preferences);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (settingsOpen && !wasOpenRef.current) {
      setDraft({
        analytics: preferences.analytics,
        chat: preferences.chat,
      });
    }
    wasOpenRef.current = settingsOpen;
  }, [settingsOpen, preferences.analytics, preferences.chat]);

  const setPreference = (key: keyof CookiePreferences, value: boolean) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    savePreferences({
      analytics: draft.analytics,
      chat: draft.chat,
    });
  };

  return (
    <Modal
      isOpen={settingsOpen}
      onClose={closeSettings}
      title={t('cookies.settingsTitle')}
    >
      <p className="mb-4 text-sm text-muted">{t('cookies.settingsDescription')}</p>

      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-background/50 p-3">
          <input
            id="cookie-necessary"
            type="checkbox"
            checked
            disabled
            className="mt-0.5 accent-accent-gold"
          />
          <label htmlFor="cookie-necessary" className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white">{t('cookies.necessaryTitle')}</p>
            <p className="mt-1 text-xs text-muted">{t('cookies.necessaryDescription')}</p>
          </label>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-background/50 p-3">
          <input
            id="cookie-analytics"
            type="checkbox"
            checked={draft.analytics}
            onChange={(e) => setPreference('analytics', e.target.checked)}
            className="mt-0.5 accent-accent-gold"
          />
          <label htmlFor="cookie-analytics" className="min-w-0 flex-1 cursor-pointer">
            <p className="text-sm font-medium text-white">{t('cookies.analyticsTitle')}</p>
            <p className="mt-1 text-xs text-muted">{t('cookies.analyticsDescription')}</p>
          </label>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-background/50 p-3">
          <input
            id="cookie-chat"
            type="checkbox"
            checked={draft.chat}
            onChange={(e) => setPreference('chat', e.target.checked)}
            className="mt-0.5 accent-accent-gold"
          />
          <label htmlFor="cookie-chat" className="min-w-0 flex-1 cursor-pointer">
            <p className="text-sm font-medium text-white">{t('cookies.chatTitle')}</p>
            <p className="mt-1 text-xs text-muted">{t('cookies.chatDescription')}</p>
          </label>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="secondary" fullWidth onClick={handleSave}>
          {t('cookies.savePreferences')}
        </Button>
        <Button type="button" variant="gold" fullWidth onClick={acceptAll}>
          {t('cookies.acceptAll')}
        </Button>
      </div>
    </Modal>
  );
}
