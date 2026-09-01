import { useAuthStore } from '@/stores/authStore';
import { WalletActionButtons } from '@/components/layout/WalletActionButtons';

export function MobileWalletActionBar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mobile-wallet-action-bar fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-background/95 backdrop-blur-md lg:hidden">
      <WalletActionButtons layout="mobile" />
    </div>
  );
}
