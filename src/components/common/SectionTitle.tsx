import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';

interface SectionTitleProps {
  title: string;
  showAllPath?: string;
  onPrev?: () => void;
  onNext?: () => void;
  showArrows?: boolean;
}

export function SectionTitle({
  title,
  showAllPath,
  onPrev,
  onNext,
  showArrows = true,
}: SectionTitleProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="h-5 w-1 rounded-full bg-accent-gold" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-white md:text-base">
          {title}
        </h2>
      </div>
      <div className="flex items-center gap-2">
        {showAllPath && (
          <Link
            to={showAllPath}
            className="text-xs font-semibold text-accent-gold hover:text-accent-gold/80 transition-colors"
          >
            {t('common.viewAllArrow')}
          </Link>
        )}
        {showArrows && onPrev && onNext && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={onPrev}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-card text-white hover:border-accent-gold/30 transition-colors"
              aria-label={t('common.previous')}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={onNext}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-card text-white hover:border-accent-gold/30 transition-colors"
              aria-label={t('common.next')}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
