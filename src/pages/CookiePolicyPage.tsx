import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useCookieConsentStore } from '@/stores/cookieConsentStore';

export function CookiePolicyPage() {
  const { t } = useTranslation();
  const openSettings = useCookieConsentStore((s) => s.openSettings);

  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="mb-4 text-2xl font-bold text-white">{t('cookies.policyPageTitle')}</h1>
      <div className="space-y-4 text-sm text-muted">
        <p>{t('cookies.policyIntro')}</p>
        <p>{t('cookies.policyNecessary')}</p>
        <p>{t('cookies.policyAnalytics')}</p>
        <p>{t('cookies.policyChat')}</p>
      </div>
      <button
        type="button"
        onClick={openSettings}
        className="mt-6 text-sm text-accent-gold hover:underline"
      >
        {t('cookies.managePreferences')}
      </button>
      <div className="mt-4">
        <Link to="/" className="text-sm text-accent hover:underline">
          {t('cookies.backHome')}
        </Link>
      </div>
    </div>
  );
}
