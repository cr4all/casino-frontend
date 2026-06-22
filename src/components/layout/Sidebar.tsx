import { type MouseEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { canLoadChat, useCookieConsentStore } from '@/stores/cookieConsentStore';
import { useUiStore } from '@/stores/uiStore';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { useClaimableFreeSpinCount } from '@/hooks/useClaimableFreeSpinCount';
import { useGameTypes } from '@/hooks/useGameTypes';
import { useTranslation } from '@/hooks/useTranslation';
import { GameTypeIcon } from '@/components/common/GameTypeIcon';
import { typePath } from '@/stores/gameStore';
import { Logo } from '@/components/common/Logo';
import { NavBadgeIcon, sidebarBadgeIconClassName, type NavIconName } from '@/components/common/NavIcon';
import { hideTawkWidget, showTawkWidget } from '@/utils/tawkWidget';
import { useLiveChatConfig } from '@/hooks/useLiveChat';
import { useLiveChatStore } from '@/stores/liveChatStore';

interface StaticNavItem {
  id: string;
  labelKey: string;
  sublabelKey: string;
  icon: NavIconName;
  path: string;
  auth?: boolean;
}

const accountItems: StaticNavItem[] = [
  { id: 'deposit', labelKey: 'nav.deposit', sublabelKey: 'nav.depositLabel', icon: 'deposit', path: '/deposit', auth: true },
  { id: 'withdraw', labelKey: 'nav.withdraw', sublabelKey: 'nav.withdrawLabel', icon: 'withdraw', path: '/withdraw', auth: true },
  { id: 'transactions', labelKey: 'nav.history', sublabelKey: 'nav.transactions', icon: 'transactions', path: '/transactions', auth: true },
  { id: 'notices', labelKey: 'nav.notices', sublabelKey: 'nav.noticesLabel', icon: 'notices', path: '/notifications', auth: true },
  { id: 'bonus', labelKey: 'nav.bonuses', sublabelKey: 'nav.bonusesLabel', icon: 'bonus', path: '/bonus', auth: true },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { t, tGameType } = useTranslation();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openModal = useUiStore((s) => s.openModal);
  const liveChatOpen = useUiStore((s) => s.liveChatOpen);
  const openLiveChat = useUiStore((s) => s.openLiveChat);
  const closeLiveChat = useUiStore((s) => s.closeLiveChat);
  const level = useCookieConsentStore((s) => s.level);
  const preferences = useCookieConsentStore((s) => s.preferences);
  const openCookieSettings = useCookieConsentStore((s) => s.openSettings);
  const unreadCount = useUnreadNotifications();
  const claimableFreeSpinCount = useClaimableFreeSpinCount();
  const { types } = useGameTypes();
  const chatAllowed = canLoadChat(level, preferences);
  const { nativeEnabled } = useLiveChatConfig();
  const liveChatUnreadCount = useLiveChatStore((s) => s.unreadCount);

  const isPathActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleNavClick = () => {
    closeLiveChat();
    hideTawkWidget();
    onNavigate?.();
  };

  const handleAuthClick = (item: StaticNavItem, e: MouseEvent<HTMLAnchorElement>) => {
    if (item.auth && !isAuthenticated) {
      e.preventDefault();
      openModal('login');
      handleNavClick();
    }
  };

  const handleLiveChatClick = () => {
    if (!chatAllowed) {
      openCookieSettings();
      onNavigate?.();
      return;
    }
    openLiveChat();
    if (!nativeEnabled) {
      showTawkWidget();
    }
    onNavigate?.();
  };

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-white/[0.06] bg-sidebar">
      <div className="px-4 py-5">
        <Logo fill onClick={handleNavClick} />
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2">
        <Link
          to="/category/all"
          onClick={handleNavClick}
          className={`group relative flex items-center gap-3 rounded-md px-3 py-3 transition-all ${
            location.pathname === '/category/all' || location.pathname === '/'
              ? 'sidebar-active text-accent-gold'
              : 'text-white hover:bg-card/60'
          }`}
        >
          <NavBadgeIcon name="home" />
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
              onClick={handleNavClick}
              className={`group relative flex items-center gap-3 rounded-md px-3 py-3 transition-all ${
                active ? 'sidebar-active text-accent-gold' : 'text-white hover:bg-card/60'
              }`}
            >
              <GameTypeIcon slug={type.slug} icon={type.icon} className={sidebarBadgeIconClassName} />
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold tracking-wide truncate ${active ? 'text-accent-gold' : 'text-white'}`}>
                  {typeName}
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
          const showBadge =
            (item.id === 'notices' && unreadCount > 0)
            || (item.id === 'bonus' && claimableFreeSpinCount > 0);
          const badgeCount = item.id === 'notices' ? unreadCount : claimableFreeSpinCount;

          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={(e) => {
                handleAuthClick(item, e);
                if (!item.auth || isAuthenticated) {
                  handleNavClick();
                }
              }}
              className={`group relative flex items-center gap-3 rounded-md px-3 py-3 transition-all ${
                active ? 'sidebar-active text-accent-gold' : 'text-white hover:bg-card/60'
              }`}
            >
              <NavBadgeIcon name={item.icon} />
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold tracking-wide ${active ? 'text-accent-gold' : 'text-white'}`}>
                  {t(item.labelKey)}
                </p>
                <p className="text-[10px] text-muted truncate">{t(item.sublabelKey)}</p>
              </div>
              {showBadge && (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent-gold px-1.5 text-[10px] font-bold leading-none text-background">
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={handleLiveChatClick}
          className={`group relative flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition-all ${
            liveChatOpen ? 'sidebar-active text-accent-gold' : 'text-white hover:bg-card/60'
          }`}
        >
          <NavBadgeIcon name="liveChat" />
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-bold tracking-wide ${liveChatOpen ? 'text-accent-gold' : 'text-white'}`}>
              {t('nav.liveChat')}
            </p>
            <p className="text-[10px] text-muted truncate">{t('nav.liveChatLabel')}</p>
          </div>
          {nativeEnabled && !liveChatOpen && liveChatUnreadCount > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent-gold px-1.5 text-[10px] font-bold leading-none text-background">
              {liveChatUnreadCount > 99 ? '99+' : liveChatUnreadCount}
            </span>
          )}
        </button>
      </nav>

      <div className="border-t border-white/[0.06] p-4">
        <p className="text-[10px] text-muted text-center">{t('nav.playResponsibly')}</p>
      </div>
    </aside>
  );
}
