import type { GameVendor } from '@/api/game.api';

const BANNER_BY_KEY: Record<string, string> = {
  pragmaticplay: '/providers/pragmatic-play.png',
  booongo: '/providers/booongo.png',
  playngo: '/providers/playngo.png',
};

function normalizeVendorKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function matchBannerKey(vendor: GameVendor): string | null {
  const slugKey = normalizeVendorKey(vendor.slug);
  const nameKey = normalizeVendorKey(vendor.name);

  if (slugKey.includes('pragmatic') || nameKey.includes('pragmatic')) return 'pragmaticplay';
  if (slugKey.includes('booongo') || nameKey.includes('booongo')) return 'booongo';
  if (
    slugKey.includes('playngo') ||
    nameKey.includes('playngo') ||
    slugKey.includes('playgo') ||
    nameKey.includes('playgo')
  ) {
    return 'playngo';
  }

  return BANNER_BY_KEY[slugKey] ? slugKey : BANNER_BY_KEY[nameKey] ? nameKey : null;
}

export function getVendorBannerUrl(vendor: GameVendor): string | null {
  if (vendor.logo_url) return vendor.logo_url;

  const key = matchBannerKey(vendor);
  return key ? BANNER_BY_KEY[key] : null;
}
