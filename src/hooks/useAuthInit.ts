import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/stores/walletStore';

export function useAuthInit() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const fetchBalance = useWalletStore((s) => s.fetchBalance);
  const clearWallet = useWalletStore((s) => s.clear);

  useEffect(() => {
    if (isAuthenticated && user?.role !== 'affiliate') {
      fetchBalance();
    } else {
      clearWallet();
    }
  }, [isAuthenticated, user?.role, fetchBalance, clearWallet]);
}
