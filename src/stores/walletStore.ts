import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { walletApi } from '@/api/wallet.api';
import type { WalletBalance } from '@/types';
import { formatBalance } from '@/utils/formatBalance';

export const DEFAULT_CURRENCY = 'USD';

export type WalletBalanceUpdate = WalletBalance & { ledger_id?: number | null };

interface WalletState {
  balance: WalletBalance | null;
  lastLedgerId: number | null;
  isLoading: boolean;
  error: string | null;
  fetchBalance: () => Promise<void>;
  applyBalanceUpdate: (update: WalletBalanceUpdate) => void;
  clear: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: null,
      lastLedgerId: null,
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

      applyBalanceUpdate: (update) => {
        const incomingLedgerId = update.ledger_id ?? null;
        const lastLedgerId = get().lastLedgerId;

        if (
          incomingLedgerId !== null &&
          lastLedgerId !== null &&
          incomingLedgerId <= lastLedgerId
        ) {
          return;
        }

        set({
          lastLedgerId: incomingLedgerId ?? lastLedgerId,
          balance: {
            wallet_id: update.wallet_id,
            player_id: update.player_id,
            currency: update.currency,
            balance: formatBalance(update.balance),
            status: update.status,
          },
          error: null,
        });
      },

      clear: () => set({ balance: null, lastLedgerId: null, isLoading: false, error: null }),
    }),
    {
      name: 'casino-wallet',
      partialize: (state) => ({ balance: state.balance, lastLedgerId: state.lastLedgerId }),
    },
  ),
);
