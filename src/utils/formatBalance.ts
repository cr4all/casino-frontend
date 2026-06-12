export function formatBalance(value: string | number | null | undefined): string {
  if (value == null || value === '') return '0.00';

  const num =
    typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));

  if (!Number.isFinite(num)) return '0.00';

  return num.toFixed(2);
}
