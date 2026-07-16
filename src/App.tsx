import { RouterProvider } from 'react-router-dom';
import { PostHogAnalytics } from '@/components/analytics/PostHogAnalytics';
import { LiveChatPanel } from '@/components/chat/LiveChatPanel';
import { TawkToChat } from '@/components/chat/TawkToChat';
import { useDismissInitialSplash } from '@/hooks/useDismissInitialSplash';
import { router } from '@/router';

export function App() {
  useDismissInitialSplash();

  return (
    <>
      <RouterProvider router={router} />
      <PostHogAnalytics />
      <TawkToChat />
      <LiveChatPanel />
    </>
  );
}
