import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { MobileWalletActionBar } from '@/components/layout/MobileWalletActionBar';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { CookieConsentBanner } from '@/components/common/CookieConsentBanner';
import { CookieSettingsModal } from '@/components/common/CookieSettingsModal';
import { ComingSoonModal } from '@/components/common/Modal';
import { AnnouncementPopupModal } from '@/components/announcement/AnnouncementPopupModal';
import { LevelUpModal } from '@/components/player/LevelUpModal';
import { VipLevelsModal } from '@/components/player/VipLevelsModal';
import { useAuthInit } from '@/hooks/useAuthInit';
import { prefetchDeviceContext } from '@/lib/deviceContext';
import { useCloseLiveChatOnNavigate } from '@/hooks/useCloseLiveChatOnNavigate';
import { useScrollToTopOnNavigate } from '@/hooks/useScrollToTopOnNavigate';
import { useIdleLogout } from '@/hooks/useIdleLogout';
import { useLanguageInit } from '@/hooks/useLanguageInit';
import { useLiveChatSync } from '@/hooks/useLiveChatSync';
import { useSupportTicketSync } from '@/hooks/useSupportTicketSync';
import { useNotificationSync } from '@/hooks/useNotificationSync';
import { useBonusSync } from '@/hooks/useBonusSync';
import { useFavoritesSync } from '@/hooks/useFavoritesSync';
import { usePlayerProfileSync } from '@/hooks/usePlayerProfileSync';
import { usePlayerLevelSync } from '@/hooks/usePlayerLevelSync';
import { useSessionPolicy } from '@/hooks/useSessionPolicy';
import { usePopupAnnouncements } from '@/hooks/usePopupAnnouncements';
import { useWalletSync } from '@/hooks/useWalletSync';
import { useAuthStore } from '@/stores/authStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useGameStore } from '@/stores/gameStore';
import { captureAffiliateReferralFromUrl } from '@/utils/affiliateReferral';
import { usePlatformSectionStore } from '@/stores/platformSectionStore';

export function AppLayout() {
  const { loadSessionPolicy } = useSessionPolicy();

  useEffect(() => {
    prefetchDeviceContext();
  }, []);

  useAuthInit();
  useWalletSync();
  usePlayerProfileSync();
  const { levelUpNotice, dismissLevelUpNotice } = usePlayerLevelSync();
  const [vipBenefitsOpen, setVipBenefitsOpen] = useState(false);
  useNotificationSync();
  useBonusSync();
  useFavoritesSync();
  useLiveChatSync();
  useSupportTicketSync();
  useIdleLogout();
  useLanguageInit();
  useCloseLiveChatOnNavigate();
  useScrollToTopOnNavigate();
  const { activePopup, dismissPopup, userId } = usePopupAnnouncements();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const profile = usePlayerStore((s) => s.profile);
  const isAffiliateUser = user?.role === 'affiliate';
  const syncPlatformSection = usePlatformSectionStore((s) => s.syncFromPathname);

  useEffect(() => {
    syncPlatformSection(location.pathname);
  }, [location.pathname, syncPlatformSection]);

  useEffect(() => {
    void loadSessionPolicy();
    void useGameStore.getState().fetchTypes();
    void useGameStore.getState().fetchVendors();
  }, [loadSessionPolicy]);

  useEffect(() => {
    captureAffiliateReferralFromUrl(searchParams);
  }, [searchParams]);

  if (isAffiliateUser && !location.pathname.startsWith('/affiliate')) {
    return <Navigate to="/affiliate" replace />;
  }

  const isSportsIframeRoute = location.pathname.startsWith('/sports');

  if (isAffiliateUser) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 flex flex-col">
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
        <LoginModal />
        <RegisterModal />
        <ForgotPasswordModal />
        <ComingSoonModal />
        <CookieConsentBanner />
        <CookieSettingsModal />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuToggle={() => setMobileOpen(true)} />
        <main
          className={`flex-1 overflow-x-hidden ${
            isSportsIframeRoute ? 'p-0' : 'p-4 md:p-6'
          } ${isAuthenticated ? 'has-mobile-wallet-bar lg:pb-0' : ''}`}
        >
          <Outlet />
        </main>
        {!isSportsIframeRoute && <Footer />}
        <MobileWalletActionBar />
      </div>

      <LoginModal />
      <RegisterModal />
      <ForgotPasswordModal />
      <ComingSoonModal />
      <CookieConsentBanner />
      <CookieSettingsModal />
      {activePopup && userId != null && (
        <AnnouncementPopupModal popup={activePopup} userId={userId} onDismiss={dismissPopup} />
      )}
      {levelUpNotice && (
        <LevelUpModal
          levelName={levelUpNotice.levelName}
          levelSlug={levelUpNotice.levelSlug}
          onClose={dismissLevelUpNotice}
          onViewBenefits={() => setVipBenefitsOpen(true)}
        />
      )}
      {vipBenefitsOpen && (
        <VipLevelsModal
          currentLevel={profile?.vip_level ?? 0}
          onClose={() => setVipBenefitsOpen(false)}
        />
      )}
    </div>
  );
}
