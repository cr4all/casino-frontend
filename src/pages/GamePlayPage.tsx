import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { gameApi } from '@/api/game.api';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageInit } from '@/hooks/useLanguageInit';
import { useScrollToTopOnNavigate } from '@/hooks/useScrollToTopOnNavigate';
import { useTranslation } from '@/hooks/useTranslation';
import { getApiErrorMessage } from '@/utils/apiError';
import { fitGameWindow } from '@/utils/gameWindow';
import { GAME_FOCUS_CHANNEL } from '@/utils/openGameWindow';
import type { Game } from '@/types';

export function GamePlayPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [game, setGame] = useState<Game | null>(null);
  const [launchUrl, setLaunchUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useLanguageInit();
  useScrollToTopOnNavigate();

  useEffect(() => {
    const channel = new BroadcastChannel(GAME_FOCUS_CHANNEL);
    channel.onmessage = (event: MessageEvent<{ type?: string }>) => {
      if (event.data?.type === 'focus') {
        window.focus();
      }
    };
    return () => channel.close();
  }, []);

  useEffect(() => {
    fitGameWindow();
  }, []);

  useEffect(() => {
    if (!launchUrl) return;
    fitGameWindow();
  }, [launchUrl]);

  useEffect(() => {
    window.focus();
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      setError(t('gamePlay.loginRequired'));
      return;
    }
    if (!id) return;

    const gameId = Number(id);

    Promise.all([gameApi.getGame(gameId), gameApi.launch(gameId)])
      .then(([gameData, launchResult]) => {
        setGame(gameData);
        setLaunchUrl(launchResult.launch_url);
        document.title = gameData.name;
      })
      .catch((err) => {
        setError(getApiErrorMessage(err, t('gamePlay.launchError')));
      })
      .finally(() => setLoading(false));
  }, [id, isAuthenticated, t]);

  if (loading) {
    return (
      <div className="flex h-dvh w-dvw flex-col items-center justify-center gap-3 bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />
        <p className="text-sm text-muted">{t('gamePlay.launching')}</p>
      </div>
    );
  }

  if (error || !launchUrl) {
    return (
      <div className="flex h-dvh w-dvw flex-col items-center justify-center gap-4 bg-black px-6 text-center">
        <p className="text-red-400">{error ?? t('gamePlay.launchFailed')}</p>
        <p className="text-sm text-muted">{t('gamePlay.tryAgain')}</p>
        <button
          type="button"
          onClick={() => window.close()}
          className="rounded-lg bg-accent-gold px-6 py-2 text-sm font-bold text-background hover:bg-accent-gold/90"
        >
          {t('gamePlay.closeWindow')}
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-dvh w-dvw overflow-hidden bg-black">
      <button
        type="button"
        onClick={() => window.close()}
        aria-label={t('gamePlay.closeWindow')}
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-lg text-white transition-colors hover:border-accent-gold/50 hover:text-accent-gold"
      >
        ×
      </button>
      <iframe
        src={launchUrl}
        title={game?.name ?? t('gamePlay.defaultName')}
        className="h-full w-full border-0 bg-black"
        allow="fullscreen; autoplay"
      />
    </div>
  );
}
