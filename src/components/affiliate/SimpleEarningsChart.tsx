import type { AffiliateChartPoint } from '@/api/affiliate.api';
import { useTranslation } from '@/hooks/useTranslation';

export function SimpleEarningsChart({ data }: { data: AffiliateChartPoint[] }) {
  const { t } = useTranslation();
  const max = Math.max(...data.map((d) => d.earnings), 1);

  if (data.length === 0) {
    return <p className="text-sm text-muted">{t('affiliate.noChartData')}</p>;
  }

  return (
    <div className="rounded-lg border border-white/10 bg-card p-4">
      <p className="mb-4 text-sm font-medium text-white">{t('affiliate.earningsChart')}</p>
      <div className="flex h-40 items-end gap-1 overflow-x-auto pb-2">
        {data.map((point) => (
          <div key={point.date} className="flex min-w-[28px] flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-accent/80"
              style={{ height: `${Math.max((point.earnings / max) * 100, 4)}%` }}
              title={`${point.date}: ${point.earnings}`}
            />
            <span className="text-[10px] text-muted">{point.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
