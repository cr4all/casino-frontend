import { useState, type FormEvent } from 'react';
import {
  type AffiliatePlayerStatistics,
  type PlayerStatisticsPeriod,
} from '@/api/affiliate.api';
import { Button } from '@/components/common/Button';
import { useTranslation } from '@/hooks/useTranslation';
import type { PaginationMeta } from '@/types';
import { formatBalance } from '@/utils/formatBalance';

const PERIODS: PlayerStatisticsPeriod[] = ['today', 'last_week', 'last_month', 'custom'];

const PERIOD_LABEL_KEYS: Record<PlayerStatisticsPeriod, string> = {
  today: 'affiliate.statsPeriodToday',
  last_week: 'affiliate.statsPeriodLastWeek',
  last_month: 'affiliate.statsPeriodLastMonth',
  custom: 'affiliate.statsPeriodCustom',
};

const STAT_COLUMNS: Array<{ key: keyof AffiliatePlayerStatistics['stats']; labelKey: string }> = [
  { key: 'deposits', labelKey: 'affiliate.deposits' },
  { key: 'withdrawals', labelKey: 'affiliate.withdrawals' },
  { key: 'cash_turnover', labelKey: 'affiliate.cashTurnover' },
  { key: 'bonus_turnover', labelKey: 'affiliate.bonusTurnover' },
  { key: 'cash_win', labelKey: 'affiliate.cashWin' },
  { key: 'bonus_win', labelKey: 'affiliate.bonusWin' },
  { key: 'total_turnover', labelKey: 'affiliate.totalTurnover' },
  { key: 'total_win', labelKey: 'affiliate.totalWin' },
  { key: 'ggr', labelKey: 'affiliate.ggr' },
  { key: 'bonus_cost', labelKey: 'affiliate.bonusCost' },
  { key: 'affiliate_cost', labelKey: 'affiliate.affiliateCost' },
  { key: 'ngr', labelKey: 'affiliate.ngr' },
];

function formatReferredPlayerId(playerId: number): string {
  return `P-${playerId}`;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface PlayerStatisticsPeriodChange {
  period: PlayerStatisticsPeriod;
  from?: string;
  to?: string;
}

interface AffiliatePlayerStatisticsTableProps {
  items: AffiliatePlayerStatistics[];
  pagination: PaginationMeta | null;
  period: PlayerStatisticsPeriod;
  customFrom?: string;
  customTo?: string;
  loading?: boolean;
  onPeriodChange: (change: PlayerStatisticsPeriodChange) => void;
}

export function AffiliatePlayerStatisticsTable({
  items,
  pagination,
  period,
  customFrom,
  customTo,
  loading = false,
  onPeriodChange,
}: AffiliatePlayerStatisticsTableProps) {
  const { t } = useTranslation();
  const [draftFrom, setDraftFrom] = useState(customFrom ?? todayIsoDate());
  const [draftTo, setDraftTo] = useState(customTo ?? todayIsoDate());

  const showReferredVia = items.some((row) => row.referred_via_code);
  const columnCount = STAT_COLUMNS.length + 1 + (showReferredVia ? 1 : 0);

  const handlePresetClick = (value: PlayerStatisticsPeriod) => {
    if (value === 'custom') {
      onPeriodChange({ period: value, from: draftFrom, to: draftTo });
      return;
    }

    onPeriodChange({ period: value });
  };

  const handleCustomApply = (e: FormEvent) => {
    e.preventDefault();
    onPeriodChange({ period: 'custom', from: draftFrom, to: draftTo });
  };

  return (
    <section className="rounded-lg border border-white/10 bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold text-white">{t('affiliate.playerStatistics')}</h2>

      <div className="mb-4 flex flex-wrap gap-2 border-b border-white/5">
        {PERIODS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handlePresetClick(value)}
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

      {period === 'custom' && (
        <form
          onSubmit={handleCustomApply}
          className="mb-4 flex flex-wrap items-end gap-3 rounded border border-white/10 bg-background p-3"
        >
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t('affiliate.statsPeriodFrom')}
            <input
              type="date"
              value={draftFrom}
              max={todayIsoDate()}
              onChange={(e) => setDraftFrom(e.target.value)}
              className="rounded border border-white/10 bg-card px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t('affiliate.statsPeriodTo')}
            <input
              type="date"
              value={draftTo}
              max={todayIsoDate()}
              onChange={(e) => setDraftTo(e.target.value)}
              className="rounded border border-white/10 bg-card px-3 py-2 text-sm text-white"
            />
          </label>
          <Button type="submit" variant="secondary">
            {t('affiliate.statsPeriodApply')}
          </Button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-muted">
              <th className="pb-2 pr-4 whitespace-nowrap">{t('affiliate.player')}</th>
              {showReferredVia && (
                <th className="pb-2 pr-4 whitespace-nowrap">{t('affiliate.subAffiliateCode')}</th>
              )}
              {STAT_COLUMNS.map((column) => (
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
                  {STAT_COLUMNS.map((column) => (
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
