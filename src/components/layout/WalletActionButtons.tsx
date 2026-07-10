import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';

interface WalletActionButtonsProps {
  layout: 'header' | 'mobile';
}

export function WalletActionButtons({ layout }: WalletActionButtonsProps) {
  const { t } = useTranslation();

  if (layout === 'header') {
    return (
      <div className="hidden shrink-0 items-center gap-1.5 md:flex">
        <Link
          to="/deposit"
          className="inline-flex h-9 items-center justify-center rounded-lg bg-accent-gold px-3 text-xs font-semibold text-background transition-opacity hover:opacity-90"
        >
          {t('nav.depositLabel')}
        </Link>
        <Link
          to="/withdraw"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 bg-card px-3 text-xs font-semibold text-white transition-colors hover:border-accent-gold/40"
        >
          {t('nav.withdrawLabel')}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <Link
        to="/deposit"
        className="inline-flex h-11 items-center justify-center rounded-lg bg-accent-gold text-sm font-semibold text-background transition-opacity hover:opacity-90"
      >
        {t('nav.depositLabel')}
      </Link>
      <Link
        to="/withdraw"
        className="inline-flex h-11 items-center justify-center rounded-lg border border-white/10 bg-card text-sm font-semibold text-white transition-colors hover:border-accent-gold/40"
      >
        {t('nav.withdrawLabel')}
      </Link>
    </div>
  );
}
