import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { playerLevelApi } from '@/api/playerLevel.api';
import { TierIcon } from '@/components/player/TierIcon';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useTranslation } from '@/hooks/useTranslation';
import type { PlayerLevelTier } from '@/types';

interface VipLevelsModalProps {
  currentLevel: number;
  onClose: () => void;
}

export function VipLevelsModal({ currentLevel, onClose }: VipLevelsModalProps) {
  const { t } = useTranslation();
  const [tiers, setTiers] = useState<PlayerLevelTier[]>([]);
  useBodyScrollLock(true);

  useEffect(() => {
    void playerLevelApi.getTiers().then(setTiers).catch(() => setTiers([]));
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[65] overflow-y-auto overscroll-contain">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="relative flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="vip-levels-title"
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-card shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        >
          <div className="border-b border-white/[0.06] px-6 py-4">
            <h2 id="vip-levels-title" className="text-lg font-bold text-white">
              {t('vip.allLevels')}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
            {tiers.map((tier) => {
              const isCurrent = tier.level === currentLevel;
              return (
                <div
                  key={tier.level}
                  className={`flex flex-col items-center rounded-xl border px-3 py-4 text-center ${
                    isCurrent
                      ? 'border-accent-gold/50 bg-accent-gold/10'
                      : 'border-white/10 bg-surface/40'
                  }`}
                >
                  <TierIcon slug={tier.slug} size={36} />
                  <p className="mt-2 text-sm font-medium text-white">{tier.name}</p>
                  {isCurrent && (
                    <span className="mt-1 text-[10px] uppercase tracking-wide text-accent-gold">
                      {t('vip.current')}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-white/[0.06] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white transition-colors hover:bg-surface"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
