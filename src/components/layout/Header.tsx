import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { DEFAULT_CURRENCY, useWalletStore } from '@/stores/walletStore';
import { formatBalance } from '@/utils/formatBalance';
import { useUiStore } from '@/stores/uiStore';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/common/Button';
import { LanguageSelector } from '@/components/common/LanguageSelector';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const balance = useWalletStore((s) => s.balance);
  const openModal = useUiStore((s) => s.openModal);
  const unreadCount = useUnreadNotifications();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [userMenuOpen]);

  const closeUserMenu = () => setUserMenuOpen(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-white/[0.06] bg-background/95 px-4 backdrop-blur-md md:px-6">
      <button
        type="button"
        onClick={onMenuToggle}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-white lg:hidden"
        aria-label={t('common.openMenu')}
      >
        ☰
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2 md:gap-3">
        <LanguageSelector />

        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-card px-4 py-2">
              <span className="text-xs text-muted hidden sm:inline">{t('nav.balance')}</span>
              <span className="font-condensed text-sm font-bold tracking-wide text-accent-gold">
                {balance?.currency ?? DEFAULT_CURRENCY} {formatBalance(balance?.balance)}
              </span>
            </div>

            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                aria-label={t('nav.profile')}
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                className={`flex h-10 w-10 items-center justify-center rounded-lg border bg-card text-white transition-colors ${
                  userMenuOpen
                    ? 'border-accent-gold/50 text-accent-gold'
                    : 'border-white/10 hover:border-accent-gold/40'
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-white/10 bg-card py-1 shadow-card"
                >
                  <Link
                    to="/profile"
                    role="menuitem"
                    onClick={closeUserMenu}
                    className="block px-4 py-2.5 text-sm text-white hover:bg-surface transition-colors"
                  >
                    {t('nav.profile')}
                  </Link>
                  <Link
                    to="/deposit"
                    role="menuitem"
                    onClick={closeUserMenu}
                    className="block px-4 py-2.5 text-sm text-white hover:bg-surface transition-colors"
                  >
                    {t('nav.depositLabel')}
                  </Link>
                  <Link
                    to="/withdraw"
                    role="menuitem"
                    onClick={closeUserMenu}
                    className="block px-4 py-2.5 text-sm text-white hover:bg-surface transition-colors"
                  >
                    {t('nav.withdrawLabel')}
                  </Link>
                  <Link
                    to="/bonus"
                    role="menuitem"
                    onClick={closeUserMenu}
                    className="block px-4 py-2.5 text-sm text-white hover:bg-surface transition-colors"
                  >
                    {t('nav.bonusesLabel')}
                  </Link>
                  <Link
                    to="/transactions"
                    role="menuitem"
                    onClick={closeUserMenu}
                    className="block px-4 py-2.5 text-sm text-white hover:bg-surface transition-colors"
                  >
                    {t('nav.transactions')}
                  </Link>
                  <Link
                    to="/notifications"
                    role="menuitem"
                    onClick={closeUserMenu}
                    className="block px-4 py-2.5 text-sm text-white hover:bg-surface transition-colors"
                  >
                    {t('nav.noticesLabel')}
                    {unreadCount > 0 && <span className="ml-1 text-accent-gold">({unreadCount})</span>}
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      closeUserMenu();
                      logout();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-surface transition-colors"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Button variant="ghost" className="text-xs" onClick={() => openModal('login')}>
              {t('nav.login')}
            </Button>
            <Button variant="gold" className="text-xs" onClick={() => openModal('register')}>
              {t('nav.register')}
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
