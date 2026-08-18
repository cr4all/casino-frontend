import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageInit } from '@/hooks/useLanguageInit';
import { useScrollToTopOnNavigate } from '@/hooks/useScrollToTopOnNavigate';
import { useTranslation } from '@/hooks/useTranslation';
import { GameService } from '@/services/GameService';
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
    document.documentElement.classList.add('horizontal-page-lock');
    document.body.classList.add('horizontal-page-lock');

    return () => {
      document.documentElement.classList.remove('horizontal-page-lock');
      document.body.classList.remove('horizontal-page-lock');
    };
  }, []);

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

    Promise.all([GameService.getGame(gameId), GameService.launch(gameId)])
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

  const playShellClass =
    'game-play-shell relative flex h-dvh w-dvw max-w-full min-w-0 flex-col overflow-hidden overscroll-x-none bg-black';

  if (loading) {
    return (
      <div className={`${playShellClass} items-center justify-center gap-3`}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />
        <p className="text-sm text-muted">{t('gamePlay.launching')}</p>
      </div>
    );
  }

  if (error || !launchUrl) {
    return (
      <div className={`${playShellClass} items-center justify-center gap-4 px-6 text-center`}>
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
    <div className={playShellClass}>
      <iframe
        src={launchUrl}
        title={game?.name ?? t('gamePlay.defaultName')}
        className="h-full w-full max-w-full min-w-0 flex-1 border-0 bg-black"
        style={{ touchAction: 'pan-y' }}
        allow="fullscreen; autoplay"
      />
    </div>
  );
}
