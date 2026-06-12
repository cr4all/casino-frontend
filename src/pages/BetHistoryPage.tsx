import { Navigate } from 'react-router-dom';

export function BetHistoryPage() {
  return <Navigate to="/transactions?tab=bets" replace />;
}
