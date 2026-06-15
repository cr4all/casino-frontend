import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { walletApi } from '@/api/wallet.api';
import type { WalletBalance } from '@/types';
import { formatBalance } from '@/utils/formatBalance';
import { reportUserActivity } from '@/utils/userActivity';

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

let balanceInflight: Promise<void> | null = null;

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: null,
      lastLedgerId: null,
      isLoading: false,
      error: null,

      fetchBalance: async () => {
        if (balanceInflight) return balanceInflight;

        set({ isLoading: true, error: null });
        balanceInflight = (async () => {
          try {
            const previousBalance = get().balance?.balance ?? null;
            const balance = await walletApi.getBalance();
            const formattedBalance = formatBalance(balance.balance);

            if (previousBalance !== null && previousBalance !== formattedBalance) {
              reportUserActivity();
            }

            set({
              balance: { ...balance, balance: formattedBalance },
              isLoading: false,
            });
          } catch {
            set({ isLoading: false, error: 'Failed to load balance' });
          } finally {
            balanceInflight = null;
          }
        })();

        return balanceInflight;
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

        reportUserActivity();
      },

      clear: () => set({ balance: null, lastLedgerId: null, isLoading: false, error: null }),
    }),
    {
      name: 'casino-wallet',
      partialize: (state) => ({ balance: state.balance, lastLedgerId: state.lastLedgerId }),
    },
  ),
);
