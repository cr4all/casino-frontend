import { useEffect, useState } from 'react';
import { affiliateApi, type AffiliatePeriod, type AffiliateStats } from '@/api/affiliate.api';
import { useTranslation } from '@/hooks/useTranslation';
import { formatBalance } from '@/utils/formatBalance';

const periods: AffiliatePeriod[] = ['today', 'yesterday', '7d', '30d'];

export function AffiliateStatisticsPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [period, setPeriod] = useState<AffiliatePeriod>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    affiliateApi.getStats(period).then(setStats).finally(() => setLoading(false));
  }, [period]);

  const items = stats
    ? [
        { label: t('affiliate.kpi.clicks'), value: stats.clicks.toLocaleString() },
        { label: t('affiliate.kpi.registrations'), value: stats.registrations.toLocaleString() },
        { label: t('affiliate.kpi.ftd'), value: stats.ftd.toLocaleString() },
        { label: t('affiliate.stats.deposits'), value: formatBalance(stats.deposits) },
        { label: t('affiliate.stats.withdrawals'), value: formatBalance(stats.withdrawals) },
        { label: t('affiliate.stats.activePlayers'), value: stats.active_players.toLocaleString() },
        { label: t('affiliate.kpi.ngr'), value: formatBalance(stats.ngr) },
        { label: t('affiliate.stats.revenue'), value: formatBalance(stats.revenue) },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{t('affiliate.nav.statistics')}</h1>
        <p className="text-sm text-muted">{t('affiliate.statisticsDesc')}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {periods.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              period === p ? 'bg-accent text-white' : 'bg-white/5 text-muted hover:text-white'
            }`}
          >
            {t(`affiliate.period.${p}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted">{t('common.loading')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="rounded-lg border border-white/10 bg-card p-4">
              <p className="text-xs text-muted">{item.label}</p>
              <p className="mt-1 text-xl font-bold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
