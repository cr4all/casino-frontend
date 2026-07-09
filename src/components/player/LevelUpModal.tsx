import { useCallback, useId } from 'react';
import { LogoMark } from '@/components/common/Logo';
import { TierIcon } from '@/components/player/TierIcon';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useTranslation } from '@/hooks/useTranslation';

interface LevelUpModalProps {
  levelName: string;
  levelSlug: string;
  onClose: () => void;
  onViewBenefits?: () => void;
}

export function LevelUpModal({ levelName, levelSlug, onClose, onViewBenefits }: LevelUpModalProps) {
  const { t } = useTranslation();
  const gradientId = useId().replace(/:/g, '');
  useBodyScrollLock(true);

  const handleViewBenefits = useCallback(() => {
    onClose();
    onViewBenefits?.();
  }, [onClose, onViewBenefits]);

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto overscroll-contain">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="relative flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="level-up-title"
          className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-card shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        >
          <div className="h-1 bg-gradient-to-r from-accent-gold/20 via-accent-gold to-accent-gold/20" />

          <div className="border-b border-white/[0.06] bg-surface/40 px-6 pb-5 pt-6 text-center">
            <div className="mb-4 flex justify-center">
              <LogoMark gradientId={gradientId} height={32} className="block h-8 w-auto opacity-80" />
            </div>
            <div className="mb-4 flex justify-center">
              <TierIcon slug={levelSlug} size={56} />
            </div>
            <h2 id="level-up-title" className="text-xl font-bold text-white">
              {t('vip.levelUpTitle')}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {t('vip.levelUpMessage', { level: levelName })}
            </p>
          </div>

          <div className="flex flex-col gap-2 px-6 py-5">
            {onViewBenefits && (
              <button
                type="button"
                onClick={handleViewBenefits}
                className="w-full rounded-lg bg-accent-gold px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                {t('vip.viewBenefits')}
              </button>
            )}
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
    </div>
  );
}
