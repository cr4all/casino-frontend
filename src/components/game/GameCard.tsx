import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { Game } from '@/types';
import { useAuthStore } from '@/stores/authStore';
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
  const bonusProviderSlugs = useBonusProviderSlugs();
  const thumbnailCandidates = useMemo(() => getGameThumbnailCandidates(game), [game]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
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
    <motion.button
      type="button"
      onClick={handleClick}
      className={`group text-left ${widthClass}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`relative overflow-hidden rounded-xl border border-white/[0.08] bg-card transition-all group-hover:border-accent-gold/30 group-hover:shadow-gold ${
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
          <span className="absolute left-2 top-2 z-10 rounded bg-accent-gold px-1.5 py-0.5 text-[9px] font-bold uppercase text-background">
            {t('gameCard.newBadge')}
          </span>
        )}
        {showBonusBadge && (
          <span className="absolute right-2 top-2 z-10 rounded bg-accent-gold px-1.5 py-0.5 text-[9px] font-bold uppercase text-background">
            {t('gameCard.bonusBadge')}
          </span>
        )}
      </div>
      <div className="mt-2 px-0.5">
        <p className="text-sm font-semibold text-white truncate">{game.name}</p>
        <p className="text-[11px] text-muted truncate">{game.vendor?.name ?? game.type?.name ?? 'Casino'}</p>
      </div>
    </motion.button>
  );
}
