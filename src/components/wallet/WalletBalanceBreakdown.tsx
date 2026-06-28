import { useEffect, useRef, useState } from 'react';
import { DEFAULT_CURRENCY } from '@/stores/walletStore';
import type { WalletBalance } from '@/types';
import { formatBalance } from '@/utils/formatBalance';
import { useTranslation } from '@/hooks/useTranslation';

interface WalletBalanceBreakdownProps {
  balance: WalletBalance | null;
  currency?: string;
  compact?: boolean;
  showLabel?: boolean;
  displayAmount?: string;
  amountLabel?: string;
}

export function WalletBalanceBreakdown({
  balance,
  currency,
  compact = false,
  showLabel = true,
  displayAmount,
  amountLabel,
}: WalletBalanceBreakdownProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const walletCurrency = currency ?? balance?.currency ?? DEFAULT_CURRENCY;
  const total = displayAmount ?? formatBalance(balance?.balance);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const hasSplit =
    balance != null &&
    (parseFloat(balance.cash_balance) > 0 || parseFloat(balance.bonus_balance) > 0);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => hasSplit && setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={t('wallet.showBreakdown')}
        className={`flex items-center gap-1 text-left ${hasSplit ? 'cursor-pointer' : 'cursor-default'}`}
        disabled={!hasSplit}
      >
        {showLabel && !compact && (
          <span className="mr-2 hidden text-xs text-muted sm:inline">
            {amountLabel ?? t('nav.balance')}
          </span>
        )}
        <span className="font-condensed truncate whitespace-nowrap text-xs font-bold tracking-wide text-accent-gold sm:text-sm">
          {walletCurrency} {total}
        </span>
        {hasSplit && (
          <span className="text-[10px] text-muted" aria-hidden="true">
            {open ? '▲' : '▼'}
          </span>
        )}
      </button>

      {open && balance && (
        <div
          role="region"
          aria-label={t('wallet.balanceBreakdown')}
          className={`absolute z-50 mt-1 min-w-[12rem] rounded-lg border border-white/10 bg-card p-3 shadow-card ${
            compact ? 'right-0' : 'left-0'
          }`}
        >
          <dl className="space-y-2 text-xs">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">{t('wallet.cashBalance')}</dt>
              <dd className="font-mono font-medium text-white">
                {walletCurrency} {formatBalance(balance.cash_balance)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">{t('wallet.bonusBalance')}</dt>
              <dd className="font-mono font-medium text-accent-purple">
                {walletCurrency} {formatBalance(balance.bonus_balance)}
              </dd>
            </div>
            {balance.bonus_locked && (
              <p className="text-[11px] leading-snug text-amber-300/90">{t('wallet.bonusLockedHint')}</p>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
