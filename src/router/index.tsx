import { createBrowserRouter, Navigate } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AffiliateDashboardPage } from '@/pages/AffiliateDashboardPage';
import { HomePage } from '@/pages/HomePage';
import { CategoryPage } from '@/pages/CategoryPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { DepositPage } from '@/pages/DepositPage';
import { WithdrawPage } from '@/pages/WithdrawPage';
import { BonusPage } from '@/pages/BonusPage';
import { InviteFriendPage } from '@/pages/InviteFriendPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { SupportTicketsPage } from '@/pages/SupportTicketsPage';
import { SupportTicketDetailPage } from '@/pages/SupportTicketDetailPage';
import { BetHistoryPage } from '@/pages/BetHistoryPage';
import { SportsIframePage } from '@/pages/SportsIframePage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { GamePlayPage } from '@/pages/GamePlayPage';
import { CookiePolicyPage } from '@/pages/CookiePolicyPage';
import { LegalDocumentPage } from '@/pages/legal/LegalDocumentPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = Sentry.wrapCreateBrowserRouterV7(createBrowserRouter)([
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
      { path: 'sports', element: <Navigate to="/sports/prematch" replace /> },
      { path: 'sports/prematch', element: <SportsIframePage mode="prematch" /> },
      { path: 'sports/live', element: <SportsIframePage mode="live" /> },
      { path: 'sports/history', element: <SportsIframePage mode="history" /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'deposit', element: <DepositPage /> },
      { path: 'withdraw', element: <WithdrawPage /> },
      { path: 'bonus', element: <BonusPage /> },
      { path: 'invite', element: <InviteFriendPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'support-tickets', element: <SupportTicketsPage /> },
      { path: 'support-tickets/:id', element: <SupportTicketDetailPage /> },
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
      { path: 'partners', element: <LegalDocumentPage pageId="partners" /> },
      { path: 'aml', element: <LegalDocumentPage pageId="aml" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
