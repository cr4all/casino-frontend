import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Game } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { openGameWindow } from '@/utils/openGameWindow';

interface GameCardProps {
  game: Game;
  variant?: 'slider' | 'grid';
  isNew?: boolean;
}

export function GameCard({ game, variant = 'slider', isNew = false }: GameCardProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openModal = useUiStore((s) => s.openModal);
  const [imgError, setImgError] = useState(false);
  const widthClass = variant === 'slider' ? 'w-[170px] shrink-0' : 'w-full';

  const handleClick = () => {
    if (!isAuthenticated) {
      openModal('login');
      return;
    }
    openGameWindow(game.id);
  };

  const showThumbnail = game.thumbnail && !imgError;

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
            src={game.thumbnail!}
            alt={game.name}
            loading="lazy"
            onError={() => setImgError(true)}
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
            New
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
