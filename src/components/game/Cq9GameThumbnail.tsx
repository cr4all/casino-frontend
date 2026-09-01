import { useEffect, useMemo, useState } from 'react';
import type { Game } from '@/types';
import { getCq9OverlayCandidates } from '@/data/gameThumbnails';

interface Cq9GameThumbnailProps {
  game: Game;
  alt: string;
  className?: string;
  onFailed?: () => void;
}

/**
 * CQ9 demo lobby style: background (zoomed) + icon overlay, keyed by gamecode.
 * Falls back to archived /providers/cq9_ single images when overlay assets are missing.
 */
export function Cq9GameThumbnail({ game, alt, className = '', onFailed }: Cq9GameThumbnailProps) {
  const candidates = useMemo(() => getCq9OverlayCandidates(game), [game]);
  const [bgIndex, setBgIndex] = useState(0);
  const [iconIndex, setIconIndex] = useState(0);
  const [legacyIndex, setLegacyIndex] = useState(0);
  const [bgFailed, setBgFailed] = useState(false);
  const [iconFailed, setIconFailed] = useState(false);
  const [legacyFailed, setLegacyFailed] = useState(false);

  useEffect(() => {
    setBgIndex(0);
    setIconIndex(0);
    setLegacyIndex(0);
    setBgFailed(false);
    setIconFailed(false);
    setLegacyFailed(false);
  }, [game.id, candidates]);

  const bgSrc = candidates && !bgFailed ? candidates.backgrounds[bgIndex] ?? null : null;
  const iconSrc = candidates && !iconFailed ? candidates.icons[iconIndex] ?? null : null;
  const overlayReady = bgSrc !== null && iconSrc !== null;
  const legacySrc =
    candidates && !overlayReady && !legacyFailed ? candidates.legacy[legacyIndex] ?? null : null;
  const totallyFailed = !candidates || (!overlayReady && (legacyFailed || legacySrc === null));

  useEffect(() => {
    if (totallyFailed) {
      onFailed?.();
    }
  }, [totallyFailed, onFailed]);

  if (!candidates || totallyFailed) {
    return null;
  }

  const handleBgError = () => {
    if (bgIndex + 1 < candidates.backgrounds.length) {
      setBgIndex((i) => i + 1);
      return;
    }
    setBgFailed(true);
  };

  const handleIconError = () => {
    if (iconIndex + 1 < candidates.icons.length) {
      setIconIndex((i) => i + 1);
      return;
    }
    setIconFailed(true);
  };

  const handleLegacyError = () => {
    if (legacyIndex + 1 < candidates.legacy.length) {
      setLegacyIndex((i) => i + 1);
      return;
    }
    setLegacyFailed(true);
  };

  if (overlayReady) {
    return (
      <div className={`absolute inset-0 overflow-hidden bg-black ${className}`.trim()} aria-label={alt}>
        <img
          src={bgSrc}
          alt=""
          loading="lazy"
          onError={handleBgError}
          className="pointer-events-none absolute left-1/2 top-1/2 h-full w-full max-w-none -translate-x-1/2 -translate-y-1/2 scale-[1.8] object-cover"
        />
        <img
          src={iconSrc}
          alt={alt}
          loading="lazy"
          onError={handleIconError}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 object-contain"
        />
      </div>
    );
  }

  if (legacySrc) {
    return (
      <img
        src={legacySrc}
        alt={alt}
        loading="lazy"
        onError={handleLegacyError}
        className={`absolute inset-0 h-full w-full object-contain bg-black ${className}`.trim()}
      />
    );
  }

  return null;
}
