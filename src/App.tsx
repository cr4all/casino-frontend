import { RouterProvider } from 'react-router-dom';
import { LiveChatPanel } from '@/components/chat/LiveChatPanel';
import { MobileAppUpdater } from '@/components/mobile/MobileAppUpdater';
import { TawkToChat } from '@/components/chat/TawkToChat';
import { MarketingPixel } from '@/modules/marketing';
import { useAndroidBackButton } from '@/hooks/useAndroidBackButton';
import { useDismissInitialSplash } from '@/hooks/useDismissInitialSplash';
import { useThemeInit } from '@/hooks/useThemeInit';
import { router } from '@/router';

export function App() {
  useThemeInit();
  useDismissInitialSplash();
  useAndroidBackButton();

  return (
    <>
      <RouterProvider router={router} />
      <MobileAppUpdater />
      <TawkToChat />
      <LiveChatPanel />
      <MarketingPixel />
    </>
  );
}
