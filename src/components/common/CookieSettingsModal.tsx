import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (settingsOpen) {
      setDraft(preferences);
    }
  }, [settingsOpen, preferences]);

  const toggle = (key: keyof CookiePreferences) => {
    setDraft((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Modal
      isOpen={settingsOpen}
      onClose={closeSettings}
      title={t('cookies.settingsTitle')}
    >
      <p className="mb-4 text-sm text-muted">{t('cookies.settingsDescription')}</p>

      <div className="space-y-3">
        <label className="flex items-start gap-3 rounded-lg border border-white/10 bg-background/50 p-3">
          <input
            type="checkbox"
            checked
            disabled
            className="mt-0.5 accent-accent-gold"
          />
          <div>
            <p className="text-sm font-medium text-white">{t('cookies.necessaryTitle')}</p>
            <p className="mt-1 text-xs text-muted">{t('cookies.necessaryDescription')}</p>
          </div>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-background/50 p-3">
          <input
            type="checkbox"
            checked={draft.analytics}
            onChange={() => toggle('analytics')}
            className="mt-0.5 accent-accent-gold"
          />
          <div>
            <p className="text-sm font-medium text-white">{t('cookies.analyticsTitle')}</p>
            <p className="mt-1 text-xs text-muted">{t('cookies.analyticsDescription')}</p>
          </div>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-background/50 p-3">
          <input
            type="checkbox"
            checked={draft.chat}
            onChange={() => toggle('chat')}
            className="mt-0.5 accent-accent-gold"
          />
          <div>
            <p className="text-sm font-medium text-white">{t('cookies.chatTitle')}</p>
            <p className="mt-1 text-xs text-muted">{t('cookies.chatDescription')}</p>
          </div>
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button variant="secondary" fullWidth onClick={() => savePreferences(draft)}>
          {t('cookies.savePreferences')}
        </Button>
        <Button variant="gold" fullWidth onClick={acceptAll}>
          {t('cookies.acceptAll')}
        </Button>
      </div>
    </Modal>
  );
}
