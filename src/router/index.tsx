import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { CategoryPage } from '@/pages/CategoryPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { DepositPage } from '@/pages/DepositPage';
import { WithdrawPage } from '@/pages/WithdrawPage';
import { BonusPage } from '@/pages/BonusPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { GamePlayPage } from '@/pages/GamePlayPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'category/:category', element: <CategoryPage /> },
      { path: 'games/:id/play', element: <GamePlayPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'deposit', element: <DepositPage /> },
      { path: 'withdraw', element: <WithdrawPage /> },
      { path: 'bonus', element: <BonusPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
    ],
  },
]);
