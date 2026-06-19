import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AffiliateDashboardPage } from '@/pages/AffiliateDashboardPage';
import { HomePage } from '@/pages/HomePage';
import { CategoryPage } from '@/pages/CategoryPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { DepositPage } from '@/pages/DepositPage';
import { WithdrawPage } from '@/pages/WithdrawPage';
import { BonusPage } from '@/pages/BonusPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { BetHistoryPage } from '@/pages/BetHistoryPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { GamePlayPage } from '@/pages/GamePlayPage';
import { CookiePolicyPage } from '@/pages/CookiePolicyPage';
import { LegalDocumentPage } from '@/pages/legal/LegalDocumentPage';

export const router = createBrowserRouter([
  {
    path: '/games/:id/play',
    element: <GamePlayPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'category/:category', element: <CategoryPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'deposit', element: <DepositPage /> },
      { path: 'withdraw', element: <WithdrawPage /> },
      { path: 'bonus', element: <BonusPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'bets', element: <BetHistoryPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'affiliate', element: <AffiliateDashboardPage /> },
      { path: 'cookies', element: <CookiePolicyPage /> },
      { path: 'about', element: <LegalDocumentPage pageId="about" /> },
      { path: 'terms', element: <LegalDocumentPage pageId="terms" /> },
      { path: 'privacy', element: <LegalDocumentPage pageId="privacy" /> },
      { path: 'responsible-gaming', element: <LegalDocumentPage pageId="responsibleGaming" /> },
      { path: 'faq', element: <LegalDocumentPage pageId="faq" /> },
      { path: 'contact', element: <LegalDocumentPage pageId="contact" /> },
      { path: 'aml', element: <LegalDocumentPage pageId="aml" /> },
    ],
  },
]);
