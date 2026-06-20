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

let vendorsInflight: Promise<GameVendor[]> | null = null;
let typesInflight: Promise<GameType[]> | null = null;

export const useGameStore = create<GameStore>((set, get) => ({
  vendors: [],
  types: [],
  loadingVendors: false,
  loadingTypes: false,
  vendorsFetched: false,
  typesFetched: false,

  fetchVendors: async () => {
    if (get().vendorsFetched) return get().vendors;
    if (vendorsInflight) return vendorsInflight;

    set({ loadingVendors: true });
    vendorsInflight = gameApi
      .getVendors()
      .then((vendors) => {
        set({ vendors, vendorsFetched: true, loadingVendors: false });
        return vendors;
      })
      .catch(() => {
        set({ loadingVendors: false });
        return [] as GameVendor[];
      })
      .finally(() => {
        vendorsInflight = null;
      });

    return vendorsInflight;
  },

  fetchTypes: async () => {
    if (get().typesFetched) return get().types;
    if (typesInflight) return typesInflight;

    set({ loadingTypes: true });
    typesInflight = gameApi
      .getTypes()
      .then((types) => {
        set({ types, typesFetched: true, loadingTypes: false });
        return types;
      })
      .catch(() => {
        set({ loadingTypes: false });
        return [] as GameType[];
      })
      .finally(() => {
        typesInflight = null;
      });

    return typesInflight;
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

export function typeIconSrc(icon: string | null | undefined, slug: string): string {
  const key = resolveTypeIconKey(icon, slug);
  return `/game-type-icons/${key}.svg`;
}

function resolveTypeIconKey(icon: string | null | undefined, slug: string): string {
  if (icon && /^[a-z0-9_]+$/.test(icon)) {
    return icon;
  }
  return slug;
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
