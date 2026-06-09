import { type MouseEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { useGameVendors } from '@/hooks/useGameVendors';
import { useGameTypes } from '@/hooks/useGameTypes';
import { typeIcon, typePath, vendorPath } from '@/stores/gameStore';

interface StaticNavItem {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  path: string;
  auth?: boolean;
}

const accountItems: StaticNavItem[] = [
  { id: 'deposit', label: 'DEPOSIT', sublabel: 'Deposit', icon: '💳', path: '/deposit', auth: true },
  { id: 'withdraw', label: 'WITHDRAW', sublabel: 'Withdraw', icon: '💸', path: '/withdraw', auth: true },
  { id: 'bets', label: 'BET HISTORY', sublabel: 'Game bets', icon: '🎰', path: '/bets', auth: true },
  { id: 'transactions', label: 'HISTORY', sublabel: 'Transactions', icon: '📋', path: '/transactions', auth: true },
  { id: 'notices', label: 'NOTICES', sublabel: 'Notices', icon: '🔔', path: '/notifications', auth: true },
  { id: 'bonus', label: 'BONUSES', sublabel: 'Bonuses', icon: '🎁', path: '/bonus', auth: true },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openModal = useUiStore((s) => s.openModal);
  const unreadCount = useUnreadNotifications();
  const { vendors } = useGameVendors();
  const { types } = useGameTypes();

  const isPathActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleAuthClick = (item: StaticNavItem, e: MouseEvent<HTMLAnchorElement>) => {
    if (item.auth && !isAuthenticated) {
      e.preventDefault();
      openModal('login');
      onNavigate?.();
    }
  };

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-white/[0.06] bg-sidebar">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-0.5 px-5 py-6">
        <span className="text-xl font-bold italic tracking-tight text-white">Casino</span>
        <span className="text-xl font-bold italic tracking-tight text-accent-gold">24</span>
        <span className="text-sm text-muted">.com</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2">
        <Link
          to="/category/all"
          onClick={onNavigate}
          className={`group relative flex items-center gap-3 rounded-md px-3 py-3 transition-all ${
            location.pathname === '/category/all' || location.pathname === '/'
              ? 'sidebar-active text-accent-gold'
              : 'text-white hover:bg-card/60'
          }`}
        >
          <span className="text-xl leading-none">🏠</span>
          <div>
            <p className="text-xs font-bold tracking-wide">ALL GAMES</p>
            <p className="text-[10px] text-muted">Browse all</p>
          </div>
        </Link>

        {types.map((type) => {
          const path = typePath(type.slug);
          const active = isPathActive(path);
          return (
            <Link
              key={type.id}
              to={path}
              onClick={onNavigate}
              className={`group relative flex items-center gap-3 rounded-md px-3 py-3 transition-all ${
                active ? 'sidebar-active text-accent-gold' : 'text-white hover:bg-card/60'
              }`}
            >
              <span className="text-xl leading-none">{typeIcon(type.icon, type.slug)}</span>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold tracking-wide truncate ${active ? 'text-accent-gold' : 'text-white'}`}>
                  {type.name.toUpperCase()}
                </p>
                <p className="text-[10px] text-muted">{type.game_count} games</p>
              </div>
            </Link>
          );
        })}

        {vendors.length > 0 && (
          <>
            <div className="my-2 border-t border-white/[0.06]" />
            <p className="px-3 py-1 text-[10px] font-bold tracking-wider text-muted">PROVIDERS</p>
            {vendors.slice(0, 8).map((vendor) => {
              const path = vendorPath(vendor.id);
              const active = isPathActive(path);
              return (
                <Link
                  key={vendor.id}
                  to={path}
                  onClick={onNavigate}
                  className={`group relative flex items-center gap-3 rounded-md px-3 py-2.5 transition-all ${
                    active ? 'sidebar-active text-accent-gold' : 'text-white hover:bg-card/60'
                  }`}
                >
                  <span className="text-lg leading-none">🎮</span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[11px] font-bold tracking-wide truncate ${active ? 'text-accent-gold' : 'text-white'}`}>
                      {vendor.name}
                    </p>
                    <p className="text-[10px] text-muted">{vendor.game_count} games</p>
                  </div>
                </Link>
              );
            })}
          </>
        )}

        <div className="my-2 border-t border-white/[0.06]" />

        {accountItems.map((item) => {
          const active = isPathActive(item.path);
          const showBadge = item.id === 'notices' && unreadCount > 0;

          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={(e) => { handleAuthClick(item, e); onNavigate?.(); }}
              className={`group relative flex items-center gap-3 rounded-md px-3 py-3 transition-all ${
                active ? 'sidebar-active text-accent-gold' : 'text-white hover:bg-card/60'
              }`}
            >
              <span className="relative text-xl leading-none">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold tracking-wide ${active ? 'text-accent-gold' : 'text-white'}`}>
                  {item.label}
                </p>
                <p className="text-[10px] text-muted truncate">{item.sublabel}</p>
              </div>
              {showBadge && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.06] p-4">
        <p className="text-[10px] text-muted text-center">18+ · Play Responsibly</p>
      </div>
    </aside>
  );
}
