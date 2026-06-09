import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/stores/walletStore';

export function useAuthInit() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchBalance = useWalletStore((s) => s.fetchBalance);
  const clearWallet = useWalletStore((s) => s.clear);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBalance();
    } else {
      clearWallet();
    }
  }, [isAuthenticated, fetchBalance, clearWallet]);
}
