import { type MouseEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { useClaimableFreeSpinCount } from '@/hooks/useClaimableFreeSpinCount';
import { useGameTypes } from '@/hooks/useGameTypes';
import { useLiveChatConfig } from '@/hooks/useLiveChat';
import { useRequestLiveChat } from '@/hooks/useRequestLiveChat';
import { useTranslation } from '@/hooks/useTranslation';
import { GameTypeIcon } from '@/components/common/GameTypeIcon';
import { typePath } from '@/stores/gameStore';
import { Logo } from '@/components/common/Logo';
import { NavBadgeIcon, NavIcon, sidebarBadgeIconClassName, sidebarIconClassName, type NavIconName } from '@/components/common/NavIcon';
import { hideTawkWidget } from '@/utils/tawkWidget';
import { useLiveChatStore } from '@/stores/liveChatStore';
import { useSupportTicketStore } from '@/stores/supportTicketStore';
import { usePlatformSectionStore } from '@/stores/platformSectionStore';
import { PlatformSectionToggle } from '@/components/layout/PlatformSectionToggle';

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
  { id: 'supportTickets', labelKey: 'nav.supportTickets', sublabelKey: 'nav.supportTicketsLabel', icon: 'supportTickets', path: '/support-tickets', auth: true },
  { id: 'bonus', labelKey: 'nav.bonuses', sublabelKey: 'nav.bonusesLabel', icon: 'bonus', path: '/bonus', auth: true },
];

const sportsItems: StaticNavItem[] = [
  { id: 'prematch', labelKey: 'nav.prematch', sublabelKey: 'nav.prematchLabel', icon: 'prematch', path: '/sports/prematch' },
  { id: 'inLive', labelKey: 'nav.inLive', sublabelKey: 'nav.inLiveLabel', icon: 'inLive', path: '/sports/live' },
  { id: 'sportsHistory', labelKey: 'nav.sportsHistory', sublabelKey: 'nav.sportsHistoryLabel', icon: 'sportsHistory', path: '/sports/history', auth: true },
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
  const closeLiveChat = useUiStore((s) => s.closeLiveChat);
  const requestLiveChat = useRequestLiveChat();
  const unreadCount = useUnreadNotifications();
  const claimableFreeSpinCount = useClaimableFreeSpinCount();
  const { types } = useGameTypes();
  const { nativeEnabled } = useLiveChatConfig();
  const liveChatUnreadCount = useLiveChatStore((s) => s.unreadCount);
  const supportTicketUnreadCount = useSupportTicketStore((s) => s.unreadCount);
  const section = usePlatformSectionStore((s) => s.section);
  const setSection = usePlatformSectionStore((s) => s.setSection);

  const isPathActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const handleNavClick = () => {
    closeLiveChat();
    hideTawkWidget();
    onNavigate?.();
  };

  const handleCasinoNavClick = () => {
    setSection('casino');
    handleNavClick();
  };

  const handleAuthClick = (item: StaticNavItem, e: MouseEvent<HTMLAnchorElement>) => {
    if (item.auth && !isAuthenticated) {
      e.preventDefault();
      openModal('login');
      handleNavClick();
    }
  };

  const handleLiveChatClick = () => {
    requestLiveChat();
    onNavigate?.();
  };

  const renderNavLink = (item: StaticNavItem, active: boolean, useInlineIcon = false) => (
    <Link
      key={item.id}
      to={item.path}
      onClick={(e) => {
        setSection('sports');
        handleAuthClick(item, e);
        if (!item.auth || isAuthenticated) {
          handleNavClick();
        }
      }}
      className={`group relative flex items-center gap-3 rounded-md px-3 py-3 transition-all ${
        active ? 'sidebar-active text-accent-gold' : 'text-white hover:bg-card/60'
      }`}
    >
      {useInlineIcon ? (
        <NavIcon name={item.icon} className={`${sidebarIconClassName} text-accent-gold`} />
      ) : (
        <NavBadgeIcon name={item.icon} />
      )}
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-bold tracking-wide truncate ${active ? 'text-accent-gold' : 'text-white'}`}>
          {t(item.labelKey)}
        </p>
        <p className="text-[10px] text-muted truncate">{t(item.sublabelKey)}</p>
      </div>
    </Link>
  );

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-white/[0.06] bg-sidebar">
      <div className="px-4 py-5">
        <Logo fill onClick={handleNavClick} />
      </div>

      <div className="px-3 pb-3">
        <PlatformSectionToggle section={section} onChange={setSection} />
      </div>

      <nav
        id={section === 'casino' ? 'sidebar-panel-casino' : 'sidebar-panel-sports'}
        role="tabpanel"
        aria-labelledby={section === 'casino' ? 'sidebar-tab-casino' : 'sidebar-tab-sports'}
        className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2"
      >
        {section === 'casino' ? (
          <>
            <Link
              to="/category/all"
              onClick={handleCasinoNavClick}
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

            <Link
              to="/category/favorites"
              onClick={(e) => {
                if (!isAuthenticated) {
                  e.preventDefault();
                  openModal('login');
                  handleNavClick();
                  return;
                }
                handleCasinoNavClick();
              }}
              className={`group relative flex items-center gap-3 rounded-md px-3 py-3 transition-all ${
                isPathActive('/category/favorites')
                  ? 'sidebar-active text-accent-gold'
                  : 'text-white hover:bg-card/60'
              }`}
            >
              <NavIcon
                name="favorites"
                className={`${sidebarIconClassName} text-accent-gold`}
                fill="var(--color-accent-gold)"
              />
              <div>
                <p className="text-xs font-bold tracking-wide">{t('nav.favorites')}</p>
                <p className="text-[10px] text-muted">{t('nav.favoritesLabel')}</p>
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
                  onClick={handleCasinoNavClick}
                  className={`group relative flex items-center gap-3 rounded-md px-3 py-3 transition-all ${
                    active ? 'sidebar-active text-accent-gold' : 'text-white hover:bg-card/60'
                  }`}
                >
                  <GameTypeIcon slug={type.slug} icon={type.icon} className={sidebarBadgeIconClassName} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold tracking-wide truncate uppercase ${active ? 'text-accent-gold' : 'text-white'}`}>
                      {typeName}
                    </p>
                    <p className="text-[10px] text-muted">
                      {t('common.gamesCount', { count: type.game_count })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </>
        ) : (
          sportsItems.map((item) => renderNavLink(item, isPathActive(item.path), true))
        )}

        <div className="my-2 border-t border-white/[0.06]" />

        {accountItems.map((item) => {
          const active = isPathActive(item.path);
          const showBadge =
            (item.id === 'notices' && unreadCount > 0)
            || (item.id === 'bonus' && claimableFreeSpinCount > 0)
            || (item.id === 'supportTickets' && supportTicketUnreadCount > 0);
          const badgeCount =
            item.id === 'notices'
              ? unreadCount
              : item.id === 'bonus'
                ? claimableFreeSpinCount
                : supportTicketUnreadCount;

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
