import { useEffect, useState } from 'react';
import { affiliateApi, type AffiliateEarningsSummary, type AffiliateBalance } from '@/api/affiliate.api';
import { useTranslation } from '@/hooks/useTranslation';
import { formatBalance } from '@/utils/formatBalance';

export function AffiliateEarningsPage() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<AffiliateEarningsSummary | null>(null);
  const [balance, setBalance] = useState<AffiliateBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    affiliateApi.getEarnings().then((data) => {
      setSummary(data.summary);
      setBalance(data.balance);
    }).finally(() => setLoading(false));
  }, []);

  const items = summary
    ? [
        { label: t('affiliate.earnings.currentMonth'), value: summary.current_month },
        { label: t('affiliate.earnings.previousMonth'), value: summary.previous_month },
        { label: t('affiliate.earnings.pending'), value: summary.pending },
        { label: t('affiliate.earnings.approved'), value: summary.approved },
        { label: t('affiliate.earnings.paid'), value: summary.paid },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{t('affiliate.nav.earnings')}</h1>
        <p className="text-sm text-muted">{t('affiliate.earningsDesc')}</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted">{t('common.loading')}</p>
      ) : (
        <>
          {balance && (
            <div className="rounded-lg border border-accent/30 bg-accent/10 p-4">
              <p className="text-xs text-muted">{t('affiliate.currentBalance')}</p>
              <p className="text-2xl font-bold text-accent">
                {formatBalance(balance.current_balance)} {balance.currency}
              </p>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item.label} className="rounded-lg border border-white/10 bg-card p-4">
                <p className="text-xs text-muted">{item.label}</p>
                <p className="mt-1 text-xl font-bold text-white">{formatBalance(item.value)}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
