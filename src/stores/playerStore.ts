import { create } from 'zustand';
import { playerApi } from '@/api/wallet.api';
import { hasAccessToken } from '@/stores/authStore';
import type { PlayerProfile } from '@/types';

interface PlayerState {
  profile: PlayerProfile | null;
  isLoading: boolean;
  fetchProfile: (force?: boolean) => Promise<PlayerProfile | null>;
  setProfile: (profile: Partial<PlayerProfile> | null) => void;
  clear: () => void;
}

let profileInflight: Promise<PlayerProfile | null> | null = null;

export const usePlayerStore = create<PlayerState>((set, get) => ({
  profile: null,
  isLoading: false,

  fetchProfile: async (force = false) => {
    if (!hasAccessToken()) {
      return null;
    }

    if (!force && get().profile) {
      return get().profile;
    }

    if (profileInflight) {
      return profileInflight;
    }

    set({ isLoading: true });
    profileInflight = (async () => {
      try {
        const profile = await playerApi.getMe();
        set({ profile, isLoading: false });
        return profile;
      } catch {
        set({ isLoading: false });
        return null;
      } finally {
        profileInflight = null;
      }
    })();

    return profileInflight;
  },

  setProfile: (profile) =>
    set((state) => {
      if (!profile) return { profile: null };
      if (!state.profile) return { profile: profile as PlayerProfile };
      return { profile: { ...state.profile, ...profile } };
    }),
  clear: () => set({ profile: null, isLoading: false }),
}));
