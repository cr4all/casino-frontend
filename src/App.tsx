import { RouterProvider } from 'react-router-dom';
import { LiveChatPanel } from '@/components/chat/LiveChatPanel';
import { TawkToChat } from '@/components/chat/TawkToChat';
import { MarketingPixel } from '@/modules/marketing';
import { useDismissInitialSplash } from '@/hooks/useDismissInitialSplash';
import { useThemeInit } from '@/hooks/useThemeInit';
import { router } from '@/router';

export function App() {
  useThemeInit();
  useDismissInitialSplash();

  return (
    <>
      <RouterProvider router={router} />
      <TawkToChat />
      <LiveChatPanel />
      <MarketingPixel />
    </>
  );
}
