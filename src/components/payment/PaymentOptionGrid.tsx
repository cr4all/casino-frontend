import { useState } from 'react';
import type { PaymentOption } from '@/api/payment.api';
import { CryptoIcon } from '@/components/deposit/CryptoIcon';
import { useTranslation } from '@/hooks/useTranslation';
import { formatPaymentLimit } from '@/utils/formatBalance';

export function PaymentOptionLogo({ option, className }: { option: PaymentOption; className?: string }) {
  const [imgError, setImgError] = useState(false);
  const logoClass = className ?? 'h-10 w-10';

  if (option.kind === 'crypto' && option.logo_key) {
    return <CryptoIcon code={option.logo_key} className={logoClass} />;
  }

  if (option.logo_key && !imgError) {
    return (
      <img
        src={`/payment-logos/${option.logo_key}.svg`}
        alt=""
        className={`${logoClass} shrink-0 rounded-lg border border-white/10 bg-white object-contain p-1.5`}
        onError={() => setImgError(true)}
      />
    );
  }

  const initials = option.label.slice(0, 2).toUpperCase();

  return (
    <span className={`flex ${logoClass} shrink-0 items-center justify-center rounded-md bg-white/10 text-xs font-semibold text-white`}>
      {initials}
    </span>
  );
}

function PaymentOptionMinMax({ option }: { option: PaymentOption }) {
  const { t } = useTranslation();
  const currencySuffix = option.kind === 'local' && option.payment_currency
    ? ` ${option.payment_currency}`
    : '';

  return (
    <p className="text-xs text-muted sm:shrink-0 sm:text-right">
      {t('common.minMax', {
        min: `${t('common.minLabel')}: ${formatPaymentLimit(option.min_amount)}${currencySuffix}`,
        max: option.max_amount
          ? `${t('common.maxLabel')}: ${formatPaymentLimit(option.max_amount)}${currencySuffix}`
          : t('common.noLimit'),
      })}
    </p>
  );
}

export { PaymentOptionMinMax };

export function PaymentOptionSummary({
  option,
  className = 'rounded-lg border border-accent-gold/30 bg-accent-gold/5 p-3',
}: {
  option: PaymentOption;
  className?: string;
}) {
  const { t, tPaymentOptionLabel } = useTranslation();

  return (
    <div className={`flex min-w-0 items-start gap-3 sm:items-center ${className}`}>
      <PaymentOptionLogo option={option} />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{tPaymentOptionLabel(option.label)}</p>
            {option.payment_currency && (
              <p className="text-xs text-muted">
                {t('deposit.paymentCurrency', { currency: option.payment_currency })}
              </p>
            )}
          </div>
          <PaymentOptionMinMax option={option} />
        </div>
      </div>
    </div>
  );
}

interface PaymentOptionGridProps {
  options: PaymentOption[];
  value: string;
  onChange: (key: string) => void;
  onSelect?: (option: PaymentOption) => void;
  variant?: 'grid' | 'list';
  loading?: boolean;
  loadingLabel?: string;
  emptyLabel?: string;
}

export function PaymentOptionGrid({
  options,
  value,
  onChange,
  onSelect,
  variant = 'grid',
  loading = false,
  loadingLabel,
  emptyLabel,
}: PaymentOptionGridProps) {
  const { t, tPaymentOptionLabel } = useTranslation();

  if (loading) {
    return <p className="text-sm text-muted">{loadingLabel ?? t('common.loading')}</p>;
  }

  if (options.length === 0) {
    return <p className="text-sm text-amber-400">{emptyLabel ?? t('deposit.noOptionsForCountry')}</p>;
  }

  const containerClass = variant === 'list'
    ? 'flex flex-col gap-3'
    : 'grid gap-3 sm:grid-cols-2';

  return (
    <div className={containerClass}>
      {options.map((option) => {
        const selected = value === option.key;

        return (
          <button
            key={option.key}
            type="button"
            onClick={() => {
              onChange(option.key);
              onSelect?.(option);
            }}
            className={`flex w-full min-w-0 items-start gap-3 rounded-lg border p-3 text-left transition-colors sm:items-center ${
              selected
                ? 'border-accent-gold/60 bg-accent-gold/10'
                : 'border-white/10 bg-background/50 hover:border-white/20 hover:bg-background'
            }`}
          >
            <PaymentOptionLogo option={option} />
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{tPaymentOptionLabel(option.label)}</p>
                  <p className="text-xs text-muted">{option.payment_currency}</p>
                </div>
                <PaymentOptionMinMax option={option} />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
