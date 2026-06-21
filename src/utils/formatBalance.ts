export function formatBalance(value: string | number | null | undefined): string {
  if (value == null || value === '') return '0.00';

  const num =
    typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));

  if (!Number.isFinite(num)) return '0.00';

  return num.toFixed(2);
}

export function formatPercent(value: string | number | null | undefined): string {
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

/** Normalizes decimal amounts in notification copy (e.g. 100.0000 → 100.00). */
export function formatNotificationText(text: string): string {
  return text.replace(
    /\b(\d{1,3}(?:,\d{3})*|\d+)\.\d+\b/g,
    (match) => formatBalance(match),
  );
}
