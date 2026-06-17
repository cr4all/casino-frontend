import type { DepositItem } from '@/api/payment.api';
import { formatBalance } from '@/utils/formatBalance';

export function formatDepositCurrencyAmount(currency: string, amount: string): string {
  return `${currency} ${formatBalance(amount)}`;
}

export function formatDepositReceivedAmount(d: DepositItem): string | null {
  if (d.received_amount) {
    return formatDepositCurrencyAmount(d.currency, d.received_amount);
  }

  if (d.status === 'completed') {
    return formatDepositCurrencyAmount(d.currency, d.amount);
  }

  return null;
}
