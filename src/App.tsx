import { RouterProvider } from 'react-router-dom';
import { LiveChatPanel } from '@/components/chat/LiveChatPanel';
import { TawkToChat } from '@/components/chat/TawkToChat';
import { useDismissInitialSplash } from '@/hooks/useDismissInitialSplash';
import { router } from '@/router';

export function App() {
  useDismissInitialSplash();

  return (
    <>
      <RouterProvider router={router} />
      <TawkToChat />
      <LiveChatPanel />
    </>
  );
}
