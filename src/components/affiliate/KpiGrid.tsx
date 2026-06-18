import type { AffiliateKpi } from '@/api/affiliate.api';
import { useTranslation } from '@/hooks/useTranslation';
import { formatBalance } from '@/utils/formatBalance';

export function KpiGrid({ kpi }: { kpi: AffiliateKpi }) {
  const { t } = useTranslation();

  const items = [
    { label: t('affiliate.kpi.clicks'), value: kpi.clicks.toLocaleString() },
    { label: t('affiliate.kpi.registrations'), value: kpi.registrations.toLocaleString() },
    { label: t('affiliate.kpi.ftd'), value: kpi.ftd.toLocaleString() },
    { label: t('affiliate.kpi.deposits'), value: formatBalance(kpi.deposits), accent: true },
    { label: t('affiliate.kpi.ngr'), value: formatBalance(kpi.ngr), accent: true },
    { label: t('affiliate.kpi.earnings'), value: formatBalance(kpi.earnings), accent: true },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-white/10 bg-card p-4">
          <p className="text-xs text-muted">{item.label}</p>
          <p className={`mt-1 text-2xl font-bold ${item.accent ? 'text-accent' : 'text-white'}`}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
