import { Link, useLocation } from 'react-router-dom';
import { NavIcon, type NavIconName } from '@/components/common/NavIcon';
import { WalletActionButtons } from '@/components/layout/WalletActionButtons';
import { useTranslation } from '@/hooks/useTranslation';
import { typePath } from '@/stores/gameStore';

interface MobileWalletActionBarProps {
  onMenuToggle?: () => void;
}

interface TabItem {
  id: string;
  labelKey: string;
  icon: NavIconName;
  to?: string;
  isActive: (pathname: string) => boolean;
  onClick?: () => void;
}

const LIVE_CASINO_PATH = typePath('live_casino');

export function MobileWalletActionBar({ onMenuToggle }: MobileWalletActionBarProps) {
  const { t } = useTranslation();
  const location = useLocation();

  const tabs: TabItem[] = [
    {
      id: 'home',
      labelKey: 'nav.home',
      icon: 'home',
      to: '/',
      isActive: (pathname) => pathname === '/',
    },
    {
      id: 'sports',
      labelKey: 'nav.sportsLabel',
      icon: 'sports',
      to: '/sports/prematch',
      isActive: (pathname) => pathname.startsWith('/sports'),
    },
    {
      id: 'casino',
      labelKey: 'nav.casinoLabel',
      icon: 'casino',
      to: '/category/all',
      isActive: (pathname) =>
        pathname.startsWith('/category') && pathname !== LIVE_CASINO_PATH,
    },
    {
      id: 'liveCasino',
      labelKey: 'nav.liveCasino',
      icon: 'liveCasino',
      to: LIVE_CASINO_PATH,
      isActive: (pathname) => pathname === LIVE_CASINO_PATH,
    },
    {
      id: 'menu',
      labelKey: 'nav.menu',
      icon: 'menu',
      isActive: () => false,
      onClick: onMenuToggle,
    },
  ];

  return (
    <div className="mobile-wallet-action-bar fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-background/95 backdrop-blur-md lg:hidden">
      <WalletActionButtons layout="mobile" />
      <nav
        className="grid grid-cols-5 gap-1 px-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5"
        aria-label={t('nav.platformSection')}
      >
        {tabs.map((tab) => {
          const active = tab.isActive(location.pathname);
          const className = `flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 py-2 text-xs font-semibold transition-colors ${
            active ? 'text-accent-gold' : 'text-white/70 hover:text-white'
          }`;

          if (tab.to) {
            return (
              <Link
                key={tab.id}
                to={tab.to}
                className={className}
                aria-current={active ? 'page' : undefined}
              >
                <NavIcon name={tab.icon} className="h-6 w-6" />
                <span className="truncate leading-tight">{t(tab.labelKey)}</span>
              </Link>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              onClick={tab.onClick}
              className={className}
            >
              <NavIcon name={tab.icon} className="h-6 w-6" />
              <span className="truncate leading-tight">{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
