import { RouterProvider } from 'react-router-dom';
import { LiveChatPanel } from '@/components/chat/LiveChatPanel';
import { TawkToChat } from '@/components/chat/TawkToChat';
import { router } from '@/router';

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <TawkToChat />
      <LiveChatPanel />
    </>
  );
}
