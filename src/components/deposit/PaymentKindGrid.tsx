import { useTranslation } from '@/hooks/useTranslation';
import type { PaymentKind } from '@/utils/depositOptions';

interface PaymentKindGridProps {
  counts: Record<PaymentKind, number>;
  onSelect: (kind: PaymentKind) => void;
  loading?: boolean;
  localEnabled?: boolean;
}

const KIND_ORDER: PaymentKind[] = ['crypto', 'local', 'credit_card', 'manual'];

const KIND_ICONS: Record<Exclude<PaymentKind, 'credit_card'>, string> = {
  crypto: '₿',
  local: '🏦',
  manual: '📋',
};

export function PaymentKindGrid({ counts, onSelect, loading = false, localEnabled = true }: PaymentKindGridProps) {
  const { t, tPaymentType } = useTranslation();

  if (loading) {
    return <p className="text-sm text-muted">{t('common.loadingPaymentMethods')}</p>;
  }

  const kindLabels: Record<PaymentKind, string> = {
    crypto: tPaymentType('crypto'),
    local: tPaymentType('local'),
    credit_card: tPaymentType('credit_card'),
    manual: tPaymentType('manual'),
  };

  const countLabels: Record<PaymentKind, (count: number) => string> = {
    crypto: (count) => t('deposit.kindCountCrypto', { count }),
    local: (count) => count > 0
      ? t('deposit.kindCountLocal', { count })
      : t('deposit.selectLocalCountry'),
    credit_card: (count) => t('deposit.kindCountCreditCard', { count }),
    manual: () => t('deposit.kindCountManual'),
  };

  return (
    <div className="flex flex-col gap-3">
      {KIND_ORDER.map((kind) => {
        const count = counts[kind];
        const disabled = kind === 'local' ? !localEnabled : count === 0;

        return (
          <button
            key={kind}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(kind)}
            className={`flex w-full min-w-0 items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
              disabled
                ? 'cursor-not-allowed border-white/5 bg-background/30 opacity-50'
                : 'border-white/10 bg-background/50 hover:border-white/20 hover:bg-background'
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/10 text-lg">
              {kind === 'credit_card' ? (
                <img
                  src="/payment-logos/visa-mastercard.svg"
                  alt=""
                  className="h-5 w-auto max-w-[2.5rem] object-contain"
                />
              ) : (
                KIND_ICONS[kind]
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">{kindLabels[kind]}</p>
              <p className="text-xs text-muted">
                {disabled ? t('deposit.kindUnavailable') : countLabels[kind](count)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
