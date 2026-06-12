import { create } from 'zustand';
import { gameApi, type GameType, type GameVendor } from '@/api/game.api';

interface GameStore {
  vendors: GameVendor[];
  types: GameType[];
  loadingVendors: boolean;
  loadingTypes: boolean;
  vendorsFetched: boolean;
  typesFetched: boolean;
  fetchVendors: () => Promise<GameVendor[]>;
  fetchTypes: () => Promise<GameType[]>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  vendors: [],
  types: [],
  loadingVendors: false,
  loadingTypes: false,
  vendorsFetched: false,
  typesFetched: false,

  fetchVendors: async () => {
    if (get().vendorsFetched) return get().vendors;
    set({ loadingVendors: true });
    try {
      const vendors = await gameApi.getVendors();
      set({ vendors, vendorsFetched: true, loadingVendors: false });
      return vendors;
    } catch {
      set({ loadingVendors: false });
      return [];
    }
  },

  fetchTypes: async () => {
    if (get().typesFetched) return get().types;
    set({ loadingTypes: true });
    try {
      const types = await gameApi.getTypes();
      set({ types, typesFetched: true, loadingTypes: false });
      return types;
    } catch {
      set({ loadingTypes: false });
      return [];
    }
  },
}));

export function vendorPath(vendorId: number): string {
  return `/category/vendor-${vendorId}`;
}

export function providersPath(): string {
  return '/category/providers';
}

export function typePath(typeSlug: string): string {
  return `/category/type-${typeSlug}`;
}

export function collectionPath(slug: string): string {
  return `/category/collection-${slug}`;
}

export function typeIcon(icon: string | null | undefined, slug: string): string {
  if (icon) return icon;
  if (slug.includes('live')) return '🎰';
  if (slug.includes('slot')) return '🎲';
  if (slug.includes('mini')) return '🍒';
  if (slug.includes('table')) return '🃏';
  if (slug.includes('crash')) return '🚀';
  return '🎮';
}

export function vendorGradient(index: number): string {
  const gradients = [
    'from-accent/60 to-accent-purple/60',
    'from-accent-blue/60 to-accent-purple/60',
    'from-accent-gold/60 to-accent/60',
    'from-accent-purple/60 to-accent-blue/60',
    'from-accent/60 to-accent-gold/60',
    'from-accent-blue/60 to-accent/60',
  ];
  return gradients[index % gradients.length];
}
