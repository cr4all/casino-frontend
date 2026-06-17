const ICON_OVERRIDES: Record<string, string> = {
  MIOTA: 'miota',
  IOTA: 'iota',
};

export function resolveCryptoIconId(code: string): string {
  const upper = code.toUpperCase();

  if (ICON_OVERRIDES[upper]) {
    return ICON_OVERRIDES[upper];
  }

  if (upper.startsWith('USDT')) return 'usdt';
  if (upper.startsWith('USDC')) return 'usdc';

  const base = upper.replace(/(TRC20|ERC20|BEP20|POLYGON|SOL|BSC|ARB|AVAX)$/i, '');
  return base.toLowerCase();
}

export function getCryptoIconUrl(code: string): string {
  const id = resolveCryptoIconId(code);
  return `https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${id}.svg`;
}

export function formatCryptoCurrencyLabel(code: string): string {
  const normalized = code.trim().toLowerCase();
  if (!normalized) return '';

  const parts = normalized.split('_').filter(Boolean);
  if (parts.length === 1) {
    return parts[0].toUpperCase();
  }

  const ticker = parts[0].toUpperCase();
  const network = parts
    .slice(1)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  return `${ticker} (${network})`;
}
