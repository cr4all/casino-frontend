import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/stores/walletStore';
import { useUiStore } from '@/stores/uiStore';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { Button } from '@/components/common/Button';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const balance = useWalletStore((s) => s.balance);
  const openModal = useUiStore((s) => s.openModal);
  const unreadCount = useUnreadNotifications();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-white/[0.06] bg-background/95 px-4 backdrop-blur-md md:px-6">
      <button
        type="button"
        onClick={onMenuToggle}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-white lg:hidden"
        aria-label="Open menu"
      >
        ☰
      </button>

      <div className="flex-1 lg:hidden">
        <span className="text-sm font-bold italic text-white">Casino</span>
        <span className="text-sm font-bold italic text-accent-gold">24</span>
      </div>

      <div className="hidden flex-1 lg:block" />

      <div className="flex items-center gap-2 md:gap-3">
        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-card px-4 py-2">
              <span className="text-xs text-muted hidden sm:inline">Balance</span>
              <span className="text-sm font-bold text-accent-gold">
                {balance?.currency ?? 'EUR'} {balance?.balance ?? '0.00'}
              </span>
            </div>

            <div className="relative group">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-card text-white hover:border-accent-gold/40 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <div className="absolute right-0 top-full mt-2 hidden w-48 rounded-lg border border-white/10 bg-card py-1 shadow-card group-hover:block z-50">
                <Link to="/profile" className="block px-4 py-2.5 text-sm text-white hover:bg-surface transition-colors">
                  Profile
                </Link>
                <Link to="/deposit" className="block px-4 py-2.5 text-sm text-white hover:bg-surface transition-colors">
                  Deposit
                </Link>
                <Link to="/withdraw" className="block px-4 py-2.5 text-sm text-white hover:bg-surface transition-colors">
                  Withdraw
                </Link>
                <Link to="/bonus" className="block px-4 py-2.5 text-sm text-white hover:bg-surface transition-colors">
                  Bonuses
                </Link>
                <Link to="/bets" className="block px-4 py-2.5 text-sm text-white hover:bg-surface transition-colors">
                  Bet History
                </Link>
                <Link to="/transactions" className="block px-4 py-2.5 text-sm text-white hover:bg-surface transition-colors">
                  Transactions
                </Link>
                <Link to="/notifications" className="block px-4 py-2.5 text-sm text-white hover:bg-surface transition-colors">
                  Notices
                  {unreadCount > 0 && <span className="ml-1 text-accent-gold">({unreadCount})</span>}
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-surface transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <Button variant="ghost" className="text-xs" onClick={() => openModal('login')}>
              Login
            </Button>
            <Button variant="gold" className="text-xs" onClick={() => openModal('register')}>
              Register
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
