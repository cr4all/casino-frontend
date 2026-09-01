import { useEffect } from 'react';
import { usePlayerSession } from '@/hooks/usePlayerSession';
import { useWalletStore } from '@/stores/walletStore';

export function useAuthInit() {
  const { hasHydrated, enabled } = usePlayerSession();
  const fetchBalance = useWalletStore((s) => s.fetchBalance);
  const clearWallet = useWalletStore((s) => s.clear);

  useEffect(() => {
    if (!hasHydrated) return;

    if (enabled) {
      fetchBalance();
    } else {
      clearWallet();
    }
  }, [hasHydrated, enabled, fetchBalance, clearWallet]);
}
