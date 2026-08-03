import { useEffect, useState } from 'react';
import { type SportsIframeMode } from '@/api/sports.api';
import { SportsService } from '@/services/SportsService';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useLanguageStore } from '@/stores/languageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { getApiErrorMessage } from '@/utils/apiError';

interface SportsIframePageProps {
  mode: SportsIframeMode;
}

export function SportsIframePage({ mode }: SportsIframePageProps) {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const language = useLanguageStore((s) => s.language);
  const openModal = useUiStore((s) => s.openModal);
  const [launchUrl, setLaunchUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mode === 'history' && !isAuthenticated) {
      setLoading(false);
      setError(t('sports.loginRequired'));
      openModal('login');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setLaunchUrl(null);

    SportsService.launch(mode, { language })
      .then((result) => {
        if (!cancelled) {
          setLaunchUrl(result.launch_url);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, t('sports.error')));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, language, mode, openModal, t]);

  const sportsViewportHeight = isAuthenticated
    ? 'sports-iframe-viewport--with-wallet-bar lg:min-h-[calc(100dvh-3.5rem)] lg:h-auto'
    : 'min-h-[calc(100dvh-3.5rem)]';

  const sportsShellClass = `sports-iframe-shell flex ${sportsViewportHeight} max-w-full min-w-0 flex-col overflow-x-hidden overscroll-x-none bg-background`;

  const pageHeading =
    mode === 'live'
      ? 'Live Sports Betting'
      : mode === 'history'
        ? t('nav.sportsHistory')
        : 'Pre-Match Sports Betting';

  if (loading) {
    return (
      <div className={`${sportsShellClass} items-center justify-center gap-3`}>
        <h1 className="sr-only">{pageHeading}</h1>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />
        <p className="text-sm text-muted">{t('sports.launching')}</p>
      </div>
    );
  }

  if (error || !launchUrl) {
    return (
      <div className={`${sportsShellClass} items-center justify-center gap-3 px-4 text-center`}>
        <h1 className="sr-only">{pageHeading}</h1>
        <p className="text-sm text-red-400">{error ?? t('sports.error')}</p>
      </div>
    );
  }

  return (
    <div className={sportsShellClass}>
      <h1 className="sr-only">{pageHeading}</h1>
      <iframe
        title={t(`nav.${mode === 'live' ? 'inLive' : mode === 'history' ? 'sportsHistory' : 'prematch'}`)}
        src={launchUrl}
        className={`${sportsViewportHeight} w-full max-w-full min-w-0 flex-1 border-0 bg-background`}
        style={{ touchAction: 'pan-y' }}
        allow="fullscreen"
      />
    </div>
  );
}
