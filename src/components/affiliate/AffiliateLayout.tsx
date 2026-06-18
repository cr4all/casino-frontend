import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Logo } from '@/components/common/Logo';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { to: '/affiliate', end: true, key: 'dashboard' },
  { to: '/affiliate/tracking', key: 'tracking' },
  { to: '/affiliate/marketing', key: 'marketing' },
  { to: '/affiliate/statistics', key: 'statistics' },
  { to: '/affiliate/players', key: 'players' },
  { to: '/affiliate/earnings', key: 'earnings' },
  { to: '/affiliate/payments', key: 'payments' },
  { to: '/affiliate/invoices', key: 'invoices' },
  { to: '/affiliate/referrals', key: 'referrals' },
  { to: '/affiliate/support', key: 'support' },
] as const;

export function AffiliateLayout() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== 'affiliate') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl flex-col gap-6 lg:flex-row">
      <aside className="w-full shrink-0 lg:w-56">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Logo className="h-8" />
          <span className="text-xs uppercase tracking-wide text-muted">{t('affiliate.portal')}</span>
        </div>
        <nav className="flex flex-wrap gap-1 lg:flex-col">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : undefined}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-accent/15 font-medium text-accent'
                    : 'text-muted hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {t(`affiliate.nav.${item.key}`)}
            </NavLink>
          ))}
        </nav>
        <Button variant="secondary" className="mt-4 w-full lg:w-auto" onClick={() => logout()}>
          {t('affiliate.logout')}
        </Button>
      </aside>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
