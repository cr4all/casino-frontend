import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { useCookieConsentStore } from '@/stores/cookieConsentStore';

export function CookieConsentBanner() {
  const { t } = useTranslation();
  const level = useCookieConsentStore((s) => s.level);
  const hasHydrated = useCookieConsentStore((s) => s.hasHydrated);
  const acceptAll = useCookieConsentStore((s) => s.acceptAll);
  const acceptNecessary = useCookieConsentStore((s) => s.acceptNecessary);
  const openSettings = useCookieConsentStore((s) => s.openSettings);

  if (!hasHydrated || level !== 'pending') return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-x-0 bottom-0 z-[80] border-t border-white/10 bg-card/95 p-4 shadow-card backdrop-blur-md md:p-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 id="cookie-consent-title" className="text-base font-bold text-white">
            {t('cookies.title')}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {t('cookies.description')}{' '}
            <Link to="/cookies" className="text-accent-gold hover:underline">
              {t('cookies.policyLink')}
            </Link>
          </p>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <Button
            variant="secondary"
            className="w-full border-white/20 md:w-auto"
            onClick={openSettings}
          >
            {t('cookies.settings')}
          </Button>
          <Button
            variant="secondary"
            className="w-full border-white/20 text-accent-gold md:w-auto"
            onClick={acceptNecessary}
          >
            {t('cookies.necessaryOnly')}
          </Button>
          <Button variant="gold" className="w-full md:w-auto" onClick={acceptAll}>
            {t('cookies.accept')}
          </Button>
        </div>
      </div>
    </div>
  );
}
