import { Link } from 'react-router-dom';
import { Pagination } from '@/components/common/Pagination';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { SportsBetItem } from '@/api/sports.api';
import { useTranslation } from '@/hooks/useTranslation';
import type { PaginationMeta } from '@/types';
import { formatBalance } from '@/utils/formatBalance';

function sportsBetDisplayStatus(bet: SportsBetItem): string {
  if (bet.status === 'cashout') {
    return 'cashout';
  }

  if (bet.status === 'won' && Number(bet.win_amount) <= 0) {
    return 'lost';
  }

  return bet.status;
}

function selectionLabel(bet: SportsBetItem): string | null {
  const parts = [bet.bet_type_name, bet.odd_type_name].filter(
    (part): part is string => !!part && part.trim() !== '',
  );
  return parts.length > 0 ? parts.join(' · ') : null;
}

interface SportsBetHistoryTableProps {
  bets: SportsBetItem[];
  pagination: PaginationMeta;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

export function SportsBetHistoryTable({
  bets,
  pagination,
  loading,
  onPageChange,
}: SportsBetHistoryTableProps) {
  const { t, formatDate } = useTranslation();

  if (loading) {
    return <p className="text-muted">{t('common.loading')}</p>;
  }

  if (bets.length === 0) {
    return (
      <div className="rounded-lg bg-surface p-8 text-center border border-white/5">
        <p className="text-muted">{t('sportsBetHistory.noBets')}</p>
        <Link to="/sports/prematch" className="mt-3 inline-block text-sm text-accent hover:underline">
          {t('sportsBetHistory.browseSports')}
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
              <th className="px-4 py-3 text-xs font-medium text-muted">{t('sportsBetHistory.roundId')}</th>
              <th className="px-4 py-3 text-xs font-medium text-muted">{t('sportsBetHistory.paymentId')}</th>
              <th className="px-4 py-3 text-xs font-medium text-muted">{t('sportsBetHistory.event')}</th>
              <th className="px-4 py-3 text-xs font-medium text-muted">{t('sportsBetHistory.selection')}</th>
              <th className="px-4 py-3 text-xs font-medium text-muted">{t('sportsBetHistory.type')}</th>
              <th className="px-4 py-3 text-xs font-medium text-muted">{t('sportsBetHistory.stake')}</th>
              <th className="px-4 py-3 text-xs font-medium text-muted">{t('sportsBetHistory.oddFactor')}</th>
              <th className="px-4 py-3 text-xs font-medium text-muted">{t('sportsBetHistory.win')}</th>
              <th className="px-4 py-3 text-xs font-medium text-muted">{t('sportsBetHistory.status')}</th>
              <th className="px-4 py-3 text-xs font-medium text-muted hidden sm:table-cell">{t('sportsBetHistory.date')}</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet) => {
              const selection = selectionLabel(bet);

              return (
                <tr key={bet.id} className="border-b border-white/5 hover:bg-surface/50">
                  <td className="px-4 py-3 font-mono text-muted">{bet.round_id}</td>
                  <td className="px-4 py-3 font-mono text-muted">{bet.payment_id}</td>
                  <td className="px-4 py-3 text-white">
                    <div>{bet.event_name?.trim() ? bet.event_name : '—'}</div>
                    {bet.sport_name?.trim() ? (
                      <div className="text-xs text-muted">{bet.sport_name}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-white">{selection ?? '—'}</td>
                  <td className="px-4 py-3 capitalize text-white">{bet.type ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-white">{formatBalance(bet.stake)}</td>
                  <td className="px-4 py-3 font-mono text-white">
                    {bet.odd_factor != null ? formatBalance(bet.odd_factor) : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-accent-gold">{formatBalance(bet.win_amount)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={sportsBetDisplayStatus(bet)} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted hidden sm:table-cell">
                    {formatDate(bet.created_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination pagination={pagination} onPageChange={onPageChange} />
    </>
  );
}
