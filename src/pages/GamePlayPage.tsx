import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { gameApi } from '@/api/game.api';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/stores/walletStore';
import { useUiStore } from '@/stores/uiStore';
import { getApiErrorMessage } from '@/utils/apiError';
import { vendorPath } from '@/stores/gameStore';
import type { Game } from '@/types';

export function GamePlayPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openModal = useUiStore((s) => s.openModal);
  const fetchBalance = useWalletStore((s) => s.fetchBalance);
  const [game, setGame] = useState<Game | null>(null);
  const [launchUrl, setLaunchUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      openModal('login');
      navigate('/', { replace: true });
      return;
    }
    if (!id) return;

    const gameId = Number(id);

    Promise.all([gameApi.getGame(gameId), gameApi.launch(gameId)])
      .then(([gameData, launchResult]) => {
        setGame(gameData);
        setLaunchUrl(launchResult.launch_url);
        fetchBalance();
      })
      .catch((err) => {
        setError(getApiErrorMessage(err, 'Failed to launch game.'));
      })
      .finally(() => setLoading(false));
  }, [id, isAuthenticated, navigate, openModal, fetchBalance]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-gold border-t-transparent" />
        <p className="text-muted text-sm">Launching game...</p>
      </div>
    );
  }

  if (error || !launchUrl) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-card py-12 text-center">
        <p className="text-red-400 mb-2">{error ?? 'Launch failed'}</p>
        <p className="text-muted text-sm mb-6">Please try again or contact support.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-lg bg-accent-gold px-6 py-2 text-sm font-bold text-background hover:bg-accent-gold/90"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            to={game?.vendor?.id ? vendorPath(game.vendor.id) : '/category/all'}
            className="text-xs text-muted hover:text-accent-gold"
          >
            ← Back to lobby
          </Link>
          <h1 className="mt-1 text-lg font-bold text-white">{game?.name ?? 'Game'}</h1>
          {game?.vendor?.name && <p className="text-xs text-muted">{game.vendor.name}</p>}
        </div>
      </div>

      <iframe
        src={launchUrl}
        title={game?.name ?? 'Game'}
        className="w-full rounded-xl border border-white/[0.08] bg-black min-h-[500px] h-[calc(100vh-160px)]"
        allow="fullscreen; autoplay; payment"
      />
    </div>
  );
}
