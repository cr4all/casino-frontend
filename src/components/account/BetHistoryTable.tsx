import { Link } from 'react-router-dom';
import { Pagination } from '@/components/common/Pagination';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { BetHistoryItem, PaginationMeta } from '@/types';

interface BetHistoryTableProps {
  bets: BetHistoryItem[];
  pagination: PaginationMeta;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

export function BetHistoryTable({ bets, pagination, loading, onPageChange }: BetHistoryTableProps) {
  if (loading) {
    return <p className="text-muted">Loading...</p>;
  }

  if (bets.length === 0) {
    return (
      <div className="rounded-lg bg-surface p-8 text-center border border-white/5">
        <p className="text-muted">No bets yet. Play a game to see your history here.</p>
        <Link to="/category/all" className="mt-3 inline-block text-sm text-accent hover:underline">
          Browse games
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-surface text-left">
              <th className="px-4 py-3 text-xs font-medium text-muted">Game</th>
              <th className="px-4 py-3 text-xs font-medium text-muted">Bet</th>
              <th className="px-4 py-3 text-xs font-medium text-muted">Win</th>
              <th className="px-4 py-3 text-xs font-medium text-muted">Net</th>
              <th className="px-4 py-3 text-xs font-medium text-muted">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-muted hidden sm:table-cell">Date</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet) => (
              <tr key={bet.id} className="border-b border-white/5 hover:bg-surface/50">
                <td className="px-4 py-3 text-white">{bet.game.name}</td>
                <td className="px-4 py-3 font-mono text-white">
                  {bet.currency} {bet.bet_amount}
                </td>
                <td className="px-4 py-3 font-mono text-accent-gold">
                  {bet.currency} {bet.win_amount}
                </td>
                <td
                  className={`px-4 py-3 font-mono ${
                    parseFloat(bet.net_amount) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {bet.net_amount}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={bet.status} />
                </td>
                <td className="px-4 py-3 text-xs text-muted hidden sm:table-cell">
                  {bet.played_at ? new Date(bet.played_at).toLocaleString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination pagination={pagination} onPageChange={onPageChange} />
    </>
  );
}
