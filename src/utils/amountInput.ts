export function parseAmountInput(value: string): number {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatAmountInput(value: number): string {
  if (value <= 0) return '';
  const fixed = value.toFixed(4).replace(/\.?0+$/, '');
  return fixed.includes('.') ? fixed : value.toFixed(2);
}

export function addToAmountInput(current: string, delta: number): string {
  const next = parseAmountInput(current) + delta;
  return formatAmountInput(next);
}
