import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { CookieConsentBanner } from '@/components/common/CookieConsentBanner';
import { CookieSettingsModal } from '@/components/common/CookieSettingsModal';
import { ComingSoonModal } from '@/components/common/Modal';
import { useAuthInit } from '@/hooks/useAuthInit';
import { useIdleLogout } from '@/hooks/useIdleLogout';
import { useLanguageInit } from '@/hooks/useLanguageInit';
import { useAuthStore } from '@/stores/authStore';
import { captureAffiliateReferralFromUrl } from '@/utils/affiliateReferral';

export function AppLayout() {
  useAuthInit();
  useIdleLogout();
  useLanguageInit();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isAffiliateUser = user?.role === 'affiliate';

  useEffect(() => {
    captureAffiliateReferralFromUrl(searchParams);
  }, [searchParams]);

  if (isAffiliateUser && location.pathname !== '/affiliate') {
    return <Navigate to="/affiliate" replace />;
  }

  if (isAffiliateUser) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <Outlet />
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
        <main className="flex-1 overflow-x-hidden p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      <LoginModal />
      <RegisterModal />
      <ForgotPasswordModal />
      <ComingSoonModal />
      <CookieConsentBanner />
      <CookieSettingsModal />
    </div>
  );
}
