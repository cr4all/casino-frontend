import {
  type AffiliatePlayerStatistics,
  type PlayerStatisticsPeriod,
} from '@/api/affiliate.api';
import { useTranslation } from '@/hooks/useTranslation';
import type { PaginationMeta } from '@/types';
import { formatBalance } from '@/utils/formatBalance';

const PERIODS: PlayerStatisticsPeriod[] = ['today', 'week', '30days', 'month'];

const PERIOD_LABEL_KEYS: Record<PlayerStatisticsPeriod, string> = {
  today: 'affiliate.statsPeriodToday',
  week: 'affiliate.statsPeriodWeek',
  '30days': 'affiliate.statsPeriod30Days',
  month: 'affiliate.statsPeriodMonth',
};

function formatReferredPlayerId(playerId: number): string {
  return `P-${playerId}`;
}

interface AffiliatePlayerStatisticsTableProps {
  items: AffiliatePlayerStatistics[];
  pagination: PaginationMeta | null;
  period: PlayerStatisticsPeriod;
  loading?: boolean;
  onPeriodChange: (period: PlayerStatisticsPeriod) => void;
}

export function AffiliatePlayerStatisticsTable({
  items,
  pagination,
  period,
  loading = false,
  onPeriodChange,
}: AffiliatePlayerStatisticsTableProps) {
  const { t } = useTranslation();

  const statColumns: Array<{ key: keyof AffiliatePlayerStatistics['stats']; labelKey: string }> = [
    { key: 'total_bet', labelKey: 'affiliate.totalBet' },
    { key: 'total_win', labelKey: 'affiliate.winMoney' },
    { key: 'deposits', labelKey: 'affiliate.deposits' },
    { key: 'withdrawals', labelKey: 'affiliate.withdrawals' },
    { key: 'cash_turnover', labelKey: 'affiliate.cashTurnover' },
    { key: 'bonus_turnover', labelKey: 'affiliate.bonusTurnover' },
    { key: 'ggr', labelKey: 'affiliate.ggr' },
    { key: 'bonus_cost', labelKey: 'affiliate.bonusCost' },
    { key: 'affiliate_cost', labelKey: 'affiliate.affiliateCost' },
    { key: 'ngr', labelKey: 'affiliate.ngr' },
  ];

  const showReferredVia = items.some((row) => row.referred_via_code);
  const columnCount = statColumns.length + 1 + (showReferredVia ? 1 : 0);

  return (
    <section className="rounded-lg border border-white/10 bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold text-white">{t('affiliate.playerStatistics')}</h2>

      <div className="mb-4 flex flex-wrap gap-2 border-b border-white/5">
        {PERIODS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onPeriodChange(value)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              period === value
                ? 'border-accent text-white'
                : 'border-transparent text-muted hover:text-white'
            }`}
          >
            {t(PERIOD_LABEL_KEYS[value])}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-muted">
              <th className="pb-2 pr-4 whitespace-nowrap">{t('affiliate.player')}</th>
              {showReferredVia && (
                <th className="pb-2 pr-4 whitespace-nowrap">{t('affiliate.subAffiliateCode')}</th>
              )}
              {statColumns.map((column) => (
                <th key={column.key} className="pb-2 pr-4 whitespace-nowrap">
                  {t(column.labelKey)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columnCount} className="py-4 text-muted">
                  {t('common.loading')}
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="py-4 text-muted">
                  {t('affiliate.noPlayerStats')}
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.player_id} className="border-b border-white/5">
                  <td className="py-2 pr-4 whitespace-nowrap">
                    <span className="font-mono text-xs">{formatReferredPlayerId(row.player_id)}</span>
                    {row.nickname ? (
                      <span className="ml-2 text-xs text-muted">{row.nickname}</span>
                    ) : null}
                  </td>
                  {showReferredVia && (
                    <td className="py-2 pr-4 whitespace-nowrap text-xs text-muted">
                      {row.referred_via_code ?? '—'}
                    </td>
                  )}
                  {statColumns.map((column) => (
                    <td key={column.key} className="py-2 pr-4 whitespace-nowrap">
                      {formatBalance(row.stats[column.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.last_page > 1 && (
        <p className="mt-2 text-xs text-muted">
          {t('common.pageOf', {
            page: pagination.current_page,
            last: pagination.last_page,
          })}
        </p>
      )}
    </section>
  );
}
