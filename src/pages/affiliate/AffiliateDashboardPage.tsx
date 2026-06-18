import { useEffect, useState } from 'react';
import {
  affiliateApi,
  type AffiliateDashboard,
  type AffiliateMe,
  type AffiliatePeriod,
} from '@/api/affiliate.api';
import { CopyButton } from '@/components/affiliate/CopyButton';
import { KpiGrid } from '@/components/affiliate/KpiGrid';
import { SimpleEarningsChart } from '@/components/affiliate/SimpleEarningsChart';
import { useTranslation } from '@/hooks/useTranslation';
import { formatBalance } from '@/utils/formatBalance';

const periods: AffiliatePeriod[] = ['today', 'yesterday', '7d', '30d'];

export function AffiliateDashboardPage() {
  const { t } = useTranslation();
  const [me, setMe] = useState<AffiliateMe | null>(null);
  const [dashboard, setDashboard] = useState<AffiliateDashboard | null>(null);
  const [period, setPeriod] = useState<AffiliatePeriod>('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [meData, dash] = await Promise.all([
          affiliateApi.getMe(),
          affiliateApi.getDashboard(period),
        ]);
        setMe(meData);
        setDashboard(dash);
      } catch {
        setError(t('affiliate.loadError'));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [period, t]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">
          {t('affiliate.nav.dashboard')}
          {me ? ` · ${me.code}` : ''}
        </h1>
        <p className="text-sm text-muted">{t('affiliate.dashboardDesc')}</p>
      </div>

      {error && <p className="rounded-md bg-accent/10 px-3 py-2 text-sm text-accent">{error}</p>}

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
      ) : dashboard ? (
        <>
          <KpiGrid kpi={dashboard.kpi} />
          <SimpleEarningsChart data={dashboard.chart} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-card p-4">
              <p className="text-xs text-muted">{t('affiliate.currentBalance')}</p>
              <p className="mt-1 text-2xl font-bold text-accent">
                {formatBalance(dashboard.balance.current_balance)} {dashboard.balance.currency}
              </p>
            </div>
            {me && (
              <div className="rounded-lg border border-white/10 bg-card p-4">
                <p className="mb-2 text-sm font-medium text-white">{t('affiliate.referralLink')}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <code className="flex-1 break-all rounded bg-background px-3 py-2 text-xs text-muted">
                    {me.referral_link}
                  </code>
                  <CopyButton text={me.referral_link} />
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
