import { type MouseEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { useGameTypes } from '@/hooks/useGameTypes';
import { useTranslation } from '@/hooks/useTranslation';
import { typeIcon, typePath } from '@/stores/gameStore';
import { Logo } from '@/components/common/Logo';

interface StaticNavItem {
  id: string;
  labelKey: string;
  sublabelKey: string;
  icon: string;
  path: string;
  auth?: boolean;
}

const accountItems: StaticNavItem[] = [
  { id: 'deposit', labelKey: 'nav.deposit', sublabelKey: 'nav.depositLabel', icon: '💳', path: '/deposit', auth: true },
  { id: 'withdraw', labelKey: 'nav.withdraw', sublabelKey: 'nav.withdrawLabel', icon: '💸', path: '/withdraw', auth: true },
  { id: 'transactions', labelKey: 'nav.history', sublabelKey: 'nav.transactions', icon: '📋', path: '/transactions', auth: true },
  { id: 'notices', labelKey: 'nav.notices', sublabelKey: 'nav.noticesLabel', icon: '🔔', path: '/notifications', auth: true },
  { id: 'bonus', labelKey: 'nav.bonuses', sublabelKey: 'nav.bonusesLabel', icon: '🎁', path: '/bonus', auth: true },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { t, tGameType } = useTranslation();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openModal = useUiStore((s) => s.openModal);
  const unreadCount = useUnreadNotifications();
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
      <div className="px-5 py-6">
        <Logo height={36} onClick={onNavigate} />
      </div>

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
            <p className="text-xs font-bold tracking-wide">{t('nav.allGames')}</p>
            <p className="text-[10px] text-muted">{t('nav.browseAll')}</p>
          </div>
        </Link>

        {types.map((type) => {
          const path = typePath(type.slug);
          const active = isPathActive(path);
          const typeName = tGameType(type.slug, type.name);
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
                  {typeName.toUpperCase()}
                </p>
                <p className="text-[10px] text-muted">
                  {t('common.gamesCount', { count: type.game_count })}
                </p>
              </div>
            </Link>
          );
        })}

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
                  {t(item.labelKey)}
                </p>
                <p className="text-[10px] text-muted truncate">{t(item.sublabelKey)}</p>
              </div>
              {showBadge && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.06] p-4">
        <p className="text-[10px] text-muted text-center">{t('nav.playResponsibly')}</p>
      </div>
    </aside>
  );
}
