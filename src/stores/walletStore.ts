import { create } from 'zustand';
import { walletApi } from '@/api/wallet.api';
import type { WalletBalance } from '@/types';

interface WalletState {
  balance: WalletBalance | null;
  isLoading: boolean;
  error: string | null;
  fetchBalance: () => Promise<void>;
  clear: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: null,
  isLoading: false,
  error: null,

  fetchBalance: async () => {
    set({ isLoading: true, error: null });
    try {
      const balance = await walletApi.getBalance();
      set({ balance, isLoading: false });
    } catch {
      set({ isLoading: false, error: 'Failed to load balance' });
    }
  },

  clear: () => set({ balance: null, isLoading: false, error: null }),
}));
