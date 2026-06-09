import { RouterProvider } from 'react-router-dom';
import { TawkToChat } from '@/components/chat/TawkToChat';
import { router } from '@/router';

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <TawkToChat />
    </>
  );
}
