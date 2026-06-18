export function formatBalance(value: string | number | null | undefined): string {
  if (value == null || value === '') return '0.00';

  const num =
    typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));

  if (!Number.isFinite(num)) return '0.00';

  return num.toFixed(2);
}

/** Integer display with thousand separators for payment min/max limits. */
export function formatPaymentLimit(value: string | number | null | undefined): string {
  if (value == null || value === '') return '0';

  const num =
    typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));

  if (!Number.isFinite(num)) return '0';

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(num));
}
