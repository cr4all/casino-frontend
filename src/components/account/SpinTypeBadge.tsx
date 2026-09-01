import { useTranslation } from '@/hooks/useTranslation';
import type { BetFundingSource } from '@/types';

const SPIN_TYPE_STYLES: Record<BetFundingSource, string> = {
  cash: 'spin-type-badge--cash bg-slate-500/15 text-slate-200 border-slate-400/35',
  bonus: 'spin-type-badge--bonus bg-amber-500/15 text-amber-300 border-amber-400/40',
  mixed: 'spin-type-badge--mixed bg-cyan-500/15 text-cyan-300 border-cyan-400/40',
  free_spin: 'spin-type-badge--free-spin bg-violet-500/15 text-violet-300 border-violet-400/40',
};

const SPIN_TYPE_DOTS: Record<BetFundingSource, string> = {
  cash: 'spin-type-dot bg-slate-300',
  bonus: 'spin-type-dot bg-amber-400',
  mixed: 'spin-type-dot bg-gradient-to-r from-slate-300 to-amber-400',
  free_spin: 'spin-type-dot bg-violet-400',
};

function spinTypeLabelKey(source: BetFundingSource): string {
  switch (source) {
    case 'free_spin':
      return 'betHistory.fundingFreeSpin';
    case 'bonus':
      return 'betHistory.fundingBonus';
    case 'mixed':
      return 'betHistory.fundingMixed';
    default:
      return 'betHistory.fundingCash';
  }
}

export function normalizeFundingSource(source: string | undefined | null): BetFundingSource {
  if (source === 'cash' || source === 'bonus' || source === 'mixed' || source === 'free_spin') {
    return source;
  }

  return 'cash';
}

interface SpinTypeBadgeProps {
  fundingSource: string | undefined | null;
}

export function SpinTypeBadge({ fundingSource }: SpinTypeBadgeProps) {
  const { t } = useTranslation();
  const source = normalizeFundingSource(fundingSource);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${SPIN_TYPE_STYLES[source]}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${SPIN_TYPE_DOTS[source]}`} aria-hidden />
      {t(spinTypeLabelKey(source))}
    </span>
  );
}
