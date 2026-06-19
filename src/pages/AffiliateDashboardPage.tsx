import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  affiliateApi,
  type AffiliateCommission,
  type AffiliateMe,
  type AffiliateReferredPlayer,
  type AffiliateStats,
} from '@/api/affiliate.api';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import type { PaginationMeta } from '@/types';
import { formatBalance } from '@/utils/formatBalance';

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

export function AffiliateDashboardPage() {
  const { t, formatDate } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [me, setMe] = useState<AffiliateMe | null>(null);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [players, setPlayers] = useState<AffiliateReferredPlayer[]>([]);
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([]);
  const [playersPagination, setPlayersPagination] = useState<PaginationMeta | null>(null);
  const [commissionsPagination, setCommissionsPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [meData, statsData, playersData, commissionsData] = await Promise.all([
        affiliateApi.getMe(),
        affiliateApi.getStats(),
        affiliateApi.getPlayers(),
        affiliateApi.getCommissions(),
      ]);
      setMe(meData);
      setStats(statsData);
      setPlayers(playersData.items);
      setPlayersPagination(playersData.pagination);
      setCommissions(commissionsData.items);
      setCommissionsPagination(commissionsData.pagination);
    } catch {
      setError(t('affiliate.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'affiliate') {
      load();
    }
  }, [isAuthenticated, user?.role]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== 'affiliate') {
    return <Navigate to="/" replace />;
  }

  const referralUrl =
    typeof window !== 'undefined' && me
      ? `${window.location.origin}${window.location.pathname}?ref=${me.code}`
      : '';

  const copyReferralLink = async () => {
    if (!referralUrl) return;
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">{t('affiliate.portal')}</p>
          <h1 className="text-xl font-bold text-white">
            {t('affiliate.title')}
            {me ? ` · ${me.code}` : ''}
          </h1>
        </div>
        <Button variant="secondary" onClick={() => logout()}>
          {t('affiliate.logout')}
        </Button>
      </div>

      {error && (
        <p className="rounded-md bg-accent/10 px-3 py-2 text-sm text-accent">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-muted">{t('common.loading')}</p>
      ) : (
        <>
          {stats && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label={t('affiliate.referredPlayers')} value={stats.referred_players_count} />
              <StatCard label={t('affiliate.commissions')} value={stats.commissions_count} />
              <StatCard label={t('affiliate.totalCommission')} value={formatBalance(stats.total_commission)} />
              <StatCard label={t('affiliate.pendingCommission')} value={formatBalance(stats.pending_commission)} />
            </div>
          )}

          {me && (
            <div className="rounded-lg border border-white/10 bg-card p-4">
              <p className="mb-2 text-sm font-medium text-white">{t('affiliate.referralLink')}</p>
              <div className="flex flex-wrap items-center gap-2">
                <code className="flex-1 break-all rounded bg-background px-3 py-2 text-xs text-muted">
                  {referralUrl}
                </code>
                <Button variant="secondary" onClick={copyReferralLink}>
                  {copied ? t('common.copied') : t('common.copy')}
                </Button>
              </div>
            </div>
          )}

          <section className="rounded-lg border border-white/10 bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold text-white">{t('affiliate.referredPlayers')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-muted">
                    <th className="pb-2 pr-4">{t('affiliate.player')}</th>
                    <th className="pb-2 pr-4">{t('affiliate.nickname')}</th>
                    <th className="pb-2">{t('affiliate.registeredAt')}</th>
                  </tr>
                </thead>
                <tbody>
                  {players.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-muted">
                        {t('affiliate.noPlayers')}
                      </td>
                    </tr>
                  ) : (
                    players.map((p) => (
                      <tr key={p.player_id} className="border-b border-white/5">
                        <td className="py-2 pr-4">#{p.player_id}</td>
                        <td className="py-2 pr-4">{p.nickname ?? '—'}</td>
                        <td className="py-2">
                          {formatDate(p.registered_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {playersPagination && playersPagination.last_page > 1 && (
              <p className="mt-2 text-xs text-muted">
                {t('common.pageOf', {
                  page: playersPagination.current_page,
                  last: playersPagination.last_page,
                })}
              </p>
            )}
          </section>

          <section className="rounded-lg border border-white/10 bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold text-white">{t('affiliate.commissionHistory')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-muted">
                    <th className="pb-2 pr-4">{t('affiliate.type')}</th>
                    <th className="pb-2 pr-4">{t('affiliate.amount')}</th>
                    <th className="pb-2 pr-4">{t('affiliate.status')}</th>
                    <th className="pb-2 pr-4">{t('affiliate.reference')}</th>
                    <th className="pb-2">{t('affiliate.date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-muted">
                        {t('affiliate.noCommissions')}
                      </td>
                    </tr>
                  ) : (
                    commissions.map((c) => (
                      <tr key={c.id} className="border-b border-white/5">
                        <td className="py-2 pr-4 uppercase">{c.type}</td>
                        <td className="py-2 pr-4">{formatBalance(c.amount)}</td>
                        <td className="py-2 pr-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="py-2 pr-4 text-xs text-muted">
                          {c.reference_type}:{c.reference_id}
                        </td>
                        <td className="py-2">
                          {formatDate(c.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {commissionsPagination && commissionsPagination.last_page > 1 && (
              <p className="mt-2 text-xs text-muted">
                {t('common.pageOf', {
                  page: commissionsPagination.current_page,
                  last: commissionsPagination.last_page,
                })}
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
