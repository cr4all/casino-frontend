import type { PaymentOption } from '@/api/payment.api';

export type PaymentKind = 'crypto' | 'local' | 'manual' | 'credit_card';

export const POPULAR_CRYPTO_CODES = ['btc', 'eth', 'usdt', 'usdc', 'ltc', 'trx', 'bnb', 'sol'];

export function groupOptionsByKind(options: PaymentOption[]) {
  return {
    crypto: options.filter((o) => o.kind === 'crypto'),
    local: options.filter((o) => o.kind === 'local'),
    credit_card: options.filter((o) => o.kind === 'credit_card'),
    manual: options.filter((o) => o.kind === 'manual'),
  };
}

export function filterCryptoOptions(options: PaymentOption[], query: string): PaymentOption[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return options;

  return options.filter((option) => {
    const label = option.label.toLowerCase();
    const payCurrency = (option.pay_currency ?? '').toLowerCase();
    const logoKey = (option.logo_key ?? '').toLowerCase();
    return label.includes(trimmed) || payCurrency.includes(trimmed) || logoKey.includes(trimmed);
  });
}

export function sortCryptoOptionsPopularFirst(options: PaymentOption[]): PaymentOption[] {
  return [...options].sort((a, b) => {
    const aCode = (a.pay_currency ?? a.logo_key ?? '').toLowerCase();
    const bCode = (b.pay_currency ?? b.logo_key ?? '').toLowerCase();
    const aIndex = POPULAR_CRYPTO_CODES.indexOf(aCode);
    const bIndex = POPULAR_CRYPTO_CODES.indexOf(bCode);

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.label.localeCompare(b.label);
  });
}

export function getOptionsForKind(options: PaymentOption[], kind: PaymentKind): PaymentOption[] {
  return options.filter((o) => o.kind === kind);
}
