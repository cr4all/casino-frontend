import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { walletApi } from '@/api/wallet.api';
import type { WalletBalance } from '@/types';
import { formatBalance } from '@/utils/formatBalance';
import { reportUserActivity } from '@/utils/userActivity';

export const DEFAULT_CURRENCY = 'USD';

export type WalletBalanceUpdate = WalletBalance & {
  ledger_id?: number | null;
  event_type?: string | null;
};

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

function formatWalletBalanceFields(balance: WalletBalance): WalletBalance {
  return {
    ...balance,
    balance: formatBalance(balance.balance),
    cash_balance: formatBalance(balance.cash_balance),
    bonus_balance: formatBalance(balance.bonus_balance),
    withdrawable_balance: formatBalance(balance.withdrawable_balance),
    withdrawable_cash_balance: formatBalance(balance.withdrawable_cash_balance),
    withdrawable_bonus_balance: formatBalance(balance.withdrawable_bonus_balance),
  };
}

function normalizeWalletBalance(
  update: Partial<WalletBalance> & Pick<WalletBalance, 'wallet_id' | 'player_id' | 'currency' | 'status'>,
  previous: WalletBalance | null,
): WalletBalance {
  const total = update.balance ?? previous?.balance ?? '0';
  const cash = update.cash_balance ?? previous?.cash_balance ?? total;
  const bonus = update.bonus_balance ?? previous?.bonus_balance ?? '0';

  return {
    wallet_id: update.wallet_id,
    player_id: update.player_id,
    currency: update.currency,
    status: update.status,
    balance: total,
    cash_balance: cash,
    bonus_balance: bonus,
    withdrawable_balance: update.withdrawable_balance ?? previous?.withdrawable_balance ?? total,
    withdrawable_cash_balance:
      update.withdrawable_cash_balance ?? previous?.withdrawable_cash_balance ?? cash,
    withdrawable_bonus_balance:
      update.withdrawable_bonus_balance ?? previous?.withdrawable_bonus_balance ?? '0',
    bonus_locked: update.bonus_locked ?? previous?.bonus_locked ?? false,
  };
}

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
            const formattedBalance = formatWalletBalanceFields(balance);

            if (previousBalance !== null && previousBalance !== formattedBalance.balance) {
              reportUserActivity();
            }

            set({
              balance: formattedBalance,
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

        const normalized = normalizeWalletBalance(update, get().balance);

        set({
          lastLedgerId: incomingLedgerId ?? lastLedgerId,
          balance: formatWalletBalanceFields(normalized),
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
