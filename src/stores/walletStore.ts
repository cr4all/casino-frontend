import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { walletApi } from '@/api/wallet.api';
import type { WalletBalance } from '@/types';
import { formatBalance } from '@/utils/formatBalance';

export const DEFAULT_CURRENCY = 'USD';

interface WalletState {
  balance: WalletBalance | null;
  isLoading: boolean;
  error: string | null;
  fetchBalance: () => Promise<void>;
  clear: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      balance: null,
      isLoading: false,
      error: null,

      fetchBalance: async () => {
        set({ isLoading: true, error: null });
        try {
          const balance = await walletApi.getBalance();
          set({
            balance: { ...balance, balance: formatBalance(balance.balance) },
            isLoading: false,
          });
        } catch {
          set({ isLoading: false, error: 'Failed to load balance' });
        }
      },

      clear: () => set({ balance: null, isLoading: false, error: null }),
    }),
    {
      name: 'casino-wallet',
      partialize: (state) => ({ balance: state.balance }),
    },
  ),
);
