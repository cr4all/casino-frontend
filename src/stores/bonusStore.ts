import { create } from 'zustand';
import { bonusApi } from '@/api/bonus.api';
import { hasAccessToken } from '@/stores/authStore';
import {
  collectBonusProviderSlugs,
  countClaimableFreeSpinBonuses,
} from '@/utils/bonusAvailability';

interface BonusState {
  claimableFreeSpinCount: number;
  bonusProviderSlugs: string[];
  fetchBonusState: () => Promise<void>;
  setClaimableFreeSpinCount: (count: number) => void;
  setBonusProviderSlugs: (slugs: string[]) => void;
  clear: () => void;
}

export const useBonusStore = create<BonusState>((set) => ({
  claimableFreeSpinCount: 0,
  bonusProviderSlugs: [],

  fetchBonusState: async () => {
    if (!hasAccessToken()) return;

    try {
      const [available, active] = await Promise.all([
        bonusApi.getAvailable(),
        bonusApi.getActive(),
      ]);

      set({
        claimableFreeSpinCount: countClaimableFreeSpinBonuses(available),
        bonusProviderSlugs: collectBonusProviderSlugs(available, active),
      });
    } catch {
      // Keep the previous state on transient failures.
    }
  },

  setClaimableFreeSpinCount: (count) => set({ claimableFreeSpinCount: count }),

  setBonusProviderSlugs: (slugs) => set({ bonusProviderSlugs: slugs }),

  clear: () => set({ claimableFreeSpinCount: 0, bonusProviderSlugs: [] }),
}));
