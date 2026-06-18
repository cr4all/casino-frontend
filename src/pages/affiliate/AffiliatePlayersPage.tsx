import { useEffect, useState } from 'react';
import { affiliateApi, type AffiliatePlayerReport } from '@/api/affiliate.api';
import { Button } from '@/components/common/Button';
import { useTranslation } from '@/hooks/useTranslation';
import type { PaginationMeta } from '@/types';
import { formatBalance } from '@/utils/formatBalance';

export function AffiliatePlayersPage() {
  const { t, formatDate } = useTranslation();
  const [players, setPlayers] = useState<AffiliatePlayerReport[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    affiliateApi.getPlayers(page).then((data) => {
      setPlayers(data.items);
      setPagination(data.pagination);
    }).finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{t('affiliate.nav.players')}</h1>
        <p className="text-sm text-muted">{t('affiliate.playersDesc')}</p>
      </div>

      <div className="rounded-lg border border-white/10 bg-card p-4">
        {loading ? (
          <p className="text-sm text-muted">{t('common.loading')}</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-muted">
                    <th className="pb-2 pr-4">{t('affiliate.player')}</th>
                    <th className="pb-2 pr-4">{t('affiliate.registeredAt')}</th>
                    <th className="pb-2 pr-4">{t('affiliate.country')}</th>
                    <th className="pb-2 pr-4">FTD</th>
                    <th className="pb-2 pr-4">{t('affiliate.stats.deposits')}</th>
                    <th className="pb-2">{t('affiliate.stats.revenue')}</th>
                  </tr>
                </thead>
                <tbody>
                  {players.length === 0 ? (
                    <tr><td colSpan={6} className="py-4 text-muted">{t('affiliate.noPlayers')}</td></tr>
                  ) : players.map((p) => (
                    <tr key={p.player_code} className="border-b border-white/5">
                      <td className="py-2 pr-4 font-mono">{p.player_code}</td>
                      <td className="py-2 pr-4">{p.registered_at ? formatDate(p.registered_at) : '—'}</td>
                      <td className="py-2 pr-4">{p.country ?? '—'}</td>
                      <td className="py-2 pr-4">{p.ftd_at ? formatDate(p.ftd_at) : '—'}</td>
                      <td className="py-2 pr-4">{formatBalance(p.total_deposit)}</td>
                      <td className="py-2">{formatBalance(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination && pagination.last_page > 1 && (
              <div className="mt-4 flex items-center gap-2">
                <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  {t('common.previous')}
                </Button>
                <span className="text-xs text-muted">
                  {t('common.pageOf', { page: pagination.current_page, last: pagination.last_page })}
                </span>
                <Button variant="secondary" disabled={page >= pagination.last_page} onClick={() => setPage((p) => p + 1)}>
                  {t('common.next')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
