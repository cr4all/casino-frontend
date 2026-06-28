import { Link } from 'react-router-dom';
import { Pagination } from '@/components/common/Pagination';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useTranslation } from '@/hooks/useTranslation';
import type { BetFundingSource, BetHistoryItem, PaginationMeta } from '@/types';
import { formatBalance } from '@/utils/formatBalance';

interface BetHistoryTableProps {
  bets: BetHistoryItem[];
  pagination: PaginationMeta;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

const FUNDING_BADGE_STYLES: Record<BetFundingSource, string> = {
  cash: 'bg-white/5 text-muted',
  bonus: 'bg-accent-gold/15 text-accent-gold',
  mixed: 'bg-accent/15 text-accent',
  free_spin: 'bg-accent-purple/15 text-accent-purple',
};

function fundingLabelKey(source: BetFundingSource): string {
  switch (source) {
    case 'free_spin':
      return 'betHistory.fundingFreeSpin';
    case 'bonus':
      return 'betHistory.fundingBonus';
    case 'mixed':
      return 'betHistory.fundingMixed';
    default:
      return 'betHistory.fundingCash';
  }
}

export function BetHistoryTable({ bets, pagination, loading, onPageChange }: BetHistoryTableProps) {
  const { t, formatDate } = useTranslation();

  if (loading) {
    return <p className="text-muted">{t('common.loading')}</p>;
  }

  if (bets.length === 0) {
    return (
      <div className="rounded-lg bg-surface p-8 text-center border border-white/5">
        <p className="text-muted">{t('betHistory.noBets')}</p>
        <Link to="/category/all" className="mt-3 inline-block text-sm text-accent hover:underline">
          {t('betHistory.browseGames')}
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
              <th className="px-4 py-3 text-xs font-medium text-muted">{t('betHistory.game')}</th>
              <th className="px-4 py-3 text-xs font-medium text-muted">{t('betHistory.bet')}</th>
              <th className="px-4 py-3 text-xs font-medium text-muted">{t('betHistory.win')}</th>
              <th className="px-4 py-3 text-xs font-medium text-muted">{t('betHistory.net')}</th>
              <th className="px-4 py-3 text-xs font-medium text-muted">{t('betHistory.spinType')}</th>
              <th className="px-4 py-3 text-xs font-medium text-muted">{t('betHistory.status')}</th>
              <th className="px-4 py-3 text-xs font-medium text-muted hidden sm:table-cell">{t('betHistory.date')}</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet) => (
              <tr key={bet.id} className="border-b border-white/5 hover:bg-surface/50">
                <td className="px-4 py-3 text-white">{bet.game.name}</td>
                <td className="px-4 py-3 font-mono text-white">
                  <div>{bet.currency} {formatBalance(bet.bet_amount)}</div>
                  {bet.funding_source === 'mixed' && bet.bet_cash_amount != null && bet.bet_bonus_amount != null && (
                    <div className="mt-0.5 text-[11px] text-muted">
                      {t('wallet.cashBalance')}: {formatBalance(bet.bet_cash_amount)} ·{' '}
                      {t('wallet.bonusBalance')}: {formatBalance(bet.bet_bonus_amount)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-accent-gold">
                  {bet.currency} {formatBalance(bet.win_amount)}
                </td>
                <td
                  className={`px-4 py-3 font-mono ${
                    parseFloat(bet.net_amount) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {formatBalance(bet.net_amount)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      FUNDING_BADGE_STYLES[bet.funding_source]
                    }`}
                  >
                    {t(fundingLabelKey(bet.funding_source))}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={bet.status} />
                </td>
                <td className="px-4 py-3 text-xs text-muted hidden sm:table-cell">
                  {formatDate(bet.played_at)}
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
