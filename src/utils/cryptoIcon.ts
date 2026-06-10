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
