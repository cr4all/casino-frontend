import { useEffect, useState } from 'react';
import { sportsApi, type SportsIframeMode } from '@/api/sports.api';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useTranslation } from '@/hooks/useTranslation';
import { getApiErrorMessage } from '@/utils/apiError';

interface SportsIframePageProps {
  mode: SportsIframeMode;
}

export function SportsIframePage({ mode }: SportsIframePageProps) {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openModal = useUiStore((s) => s.openModal);
  const [launchUrl, setLaunchUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      setError(t('sports.loginRequired'));
      openModal('login');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setLaunchUrl(null);

    sportsApi
      .launch(mode)
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
  }, [isAuthenticated, mode, openModal, t]);

  const sportsViewportHeight = 'min-h-[calc(100dvh-3.5rem)]';

  if (loading) {
    return (
      <div className={`flex ${sportsViewportHeight} flex-col items-center justify-center gap-3 bg-background`}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />
        <p className="text-sm text-muted">{t('sports.launching')}</p>
      </div>
    );
  }

  if (error || !launchUrl) {
    return (
      <div className={`flex ${sportsViewportHeight} flex-col items-center justify-center gap-3 bg-background px-4 text-center`}>
        <p className="text-sm text-red-400">{error ?? t('sports.error')}</p>
      </div>
    );
  }

  return (
    <div className={`flex ${sportsViewportHeight} flex-col bg-background`}>
      <iframe
        title={t(`nav.${mode === 'live' ? 'inLive' : mode === 'history' ? 'sportsHistory' : 'prematch'}`)}
        src={launchUrl}
        className={`${sportsViewportHeight} w-full flex-1 border-0 bg-background`}
        allow="fullscreen"
      />
    </div>
  );
}
