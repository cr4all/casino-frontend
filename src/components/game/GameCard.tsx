import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { motion } from 'framer-motion';
import type { Game } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useUiStore } from '@/stores/uiStore';
import { useBonusProviderSlugs } from '@/hooks/useBonusProviderSlugs';
import { useTranslation } from '@/hooks/useTranslation';
import { getGameThumbnailCandidates } from '@/data/gameThumbnails';
import { gameHasProviderBonus } from '@/utils/bonusAvailability';
import { openGameWindow } from '@/utils/openGameWindow';

interface GameCardProps {
  game: Game;
  variant?: 'slider' | 'grid';
  isNew?: boolean;
}

export function GameCard({ game, variant = 'slider', isNew = false }: GameCardProps) {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openModal = useUiStore((s) => s.openModal);
  const favoriteIds = useFavoritesStore((s) => s.favoriteIds);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = favoriteIds.has(game.id);
  const bonusProviderSlugs = useBonusProviderSlugs();
  const thumbnailCandidates = useMemo(() => getGameThumbnailCandidates(game), [game]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const [toggling, setToggling] = useState(false);
  const widthClass = variant === 'slider' ? 'w-[170px] shrink-0' : 'w-full';

  useEffect(() => {
    setCandidateIndex(0);
    setThumbnailFailed(false);
  }, [game.id, thumbnailCandidates]);

  const handleClick = () => {
    if (!isAuthenticated) {
      openModal('login');
      return;
    }
    openGameWindow(game.id);
  };

  const handleFavoriteClick = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      openModal('login');
      return;
    }

    if (toggling) return;

    setToggling(true);
    try {
      await toggleFavorite(game.id);
    } catch {
      // Optimistic update already rolled back in the store.
    } finally {
      setToggling(false);
    }
  };

  const thumbnailSrc = thumbnailCandidates[candidateIndex] ?? null;
  const showThumbnail = thumbnailSrc !== null && !thumbnailFailed;
  const showBonusBadge = isAuthenticated && gameHasProviderBonus(game.provider?.slug, bonusProviderSlugs);

  const handleImageError = () => {
    if (candidateIndex + 1 < thumbnailCandidates.length) {
      setCandidateIndex((index) => index + 1);
      return;
    }

    setThumbnailFailed(true);
  };

  return (
    <motion.div
      className={`group text-left ${widthClass}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`relative cursor-pointer overflow-hidden rounded-xl border border-white/[0.08] bg-card transition-all group-hover:border-accent-gold/30 group-hover:shadow-gold ${
          variant === 'slider' ? 'h-[120px]' : 'aspect-[4/3]'
        }`}
      >
        {showThumbnail ? (
          <img
            src={thumbnailSrc}
            alt={game.name}
            loading="lazy"
            onError={handleImageError}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient ?? 'from-accent/30 to-accent-purple/30'}`} />
            <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-40">🎲</div>
          </>
        )}
        {(isNew || game.isNew) && (
          <span className="absolute left-2 top-11 z-10 rounded bg-accent-gold px-1.5 py-0.5 text-[9px] font-bold uppercase text-background">
            {t('gameCard.newBadge')}
          </span>
        )}
        {showBonusBadge && (
          <span className="pointer-events-none absolute right-0 top-0 z-10 block h-[2.75rem] w-[2.75rem] overflow-hidden sm:h-[4.25rem] sm:w-[4.25rem]">
            <span className="absolute right-[-0.95rem] top-[0.72rem] w-[4.5rem] rotate-45 bg-gradient-to-r from-accent-gold to-amber-500 py-0.5 text-center text-[8px] font-extrabold uppercase tracking-wide text-background shadow-[0_2px_8px_rgba(0,0,0,0.35)] sm:right-[-1.65rem] sm:top-[1.15rem] sm:w-[7.25rem] sm:py-1.5 sm:text-[11px] sm:tracking-wider">
              {t('gameCard.bonusBadge')}
            </span>
          </span>
        )}
        <button
          type="button"
          aria-label={isFavorite ? t('gameCard.removeFavorite') : t('gameCard.addFavorite')}
          aria-pressed={isFavorite}
          disabled={toggling}
          onClick={handleFavoriteClick}
          className={`absolute left-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full border bg-black/55 backdrop-blur-sm transition-colors disabled:opacity-60 ${
            isFavorite
              ? 'border-white/80 text-red-500 hover:border-white hover:text-red-400'
              : 'border-white/15 text-white hover:border-accent-gold/50 hover:text-accent-gold'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke={isFavorite ? '#ffffff' : 'currentColor'}
            strokeWidth="2"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21s-6.5-4.35-9.33-8.08C.8 10.5 1.24 6.9 4.05 5.2c2.1-1.27 4.68-.7 6.2 1.2 1.52-1.9 4.1-2.47 6.2-1.2 2.81 1.7 3.25 5.3 1.38 7.72C18.5 16.65 12 21 12 21z"
            />
          </svg>
        </button>
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`cursor-pointer px-0.5 ${variant === 'grid' ? 'mt-1.5 sm:mt-2' : 'mt-2'}`}
      >
        <p className="text-sm font-semibold text-white truncate">{game.name}</p>
        <p className="text-[11px] text-muted truncate">{game.vendor?.name ?? game.type?.name ?? 'Casino'}</p>
      </div>
    </motion.div>
  );
}
