import { useEffect, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import {
  affiliateApi,
  type AffiliateCommission,
  type AffiliateMe,
  type AffiliateStats,
  type AffiliateSubAffiliate,
  type CreateSubAffiliatePayload,
} from '@/api/affiliate.api';
import { Button } from '@/components/common/Button';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { Modal } from '@/components/common/Modal';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import type { PaginationMeta } from '@/types';
import {
  getAllowedSubAffiliateCommissionModels,
  getDefaultSubAffiliateCommissionModel,
  type CommissionModel,
} from '@/utils/affiliateCommissionModel';
import { formatBalance, formatPercent } from '@/utils/formatBalance';
import { getApiErrorMessage } from '@/utils/apiError';

function createDefaultSubAffiliatePayload(parent: AffiliateMe): CreateSubAffiliatePayload {
  const commission_model = getDefaultSubAffiliateCommissionModel(parent.commission_model);

  return {
    code: '',
    email: '',
    password: '',
    commission_model,
    commission_rate: commission_model === 'cpa' ? 0 : 10,
    cpa_amount: commission_model === 'revshare' ? 0 : 0,
    status: 'active',
  };
}

function commissionModelLabel(
  model: CommissionModel,
  t: (key: string) => string,
): string {
  switch (model) {
    case 'cpa':
      return t('affiliate.modelCpa');
    case 'revshare':
      return t('affiliate.modelRevshare');
    case 'hybrid':
      return t('affiliate.modelHybrid');
  }
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function buildReferralUrl(code: string): string {
  if (typeof window === 'undefined') return `?ref=${code}`;
  return `${window.location.origin}${window.location.pathname}?ref=${code}`;
}

function formatReferredPlayerId(playerId: number | null | undefined): string {
  if (playerId == null) return '—';
  return `P-${playerId}`;
}

export function AffiliateDashboardPage() {
  const { t, formatDate } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [me, setMe] = useState<AffiliateMe | null>(null);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [commissions, setCommissions] = useState<AffiliateCommission[]>([]);
  const [subAffiliates, setSubAffiliates] = useState<AffiliateSubAffiliate[]>([]);
  const [commissionsPagination, setCommissionsPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedSubId, setCopiedSubId] = useState<number | null>(null);
  const [showCreateSub, setShowCreateSub] = useState(false);
  const [subFormError, setSubFormError] = useState<string | null>(null);
  const [subFormLoading, setSubFormLoading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [subForm, setSubForm] = useState<CreateSubAffiliatePayload>({
    code: '',
    email: '',
    password: '',
    commission_model: 'revshare',
    commission_rate: 10,
    cpa_amount: 0,
    status: 'active',
  });

  const allowedSubCommissionModels = me
    ? getAllowedSubAffiliateCommissionModels(me.commission_model)
    : [];

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [meData, statsData, commissionsData] = await Promise.all([
        affiliateApi.getMe(),
        affiliateApi.getStats(),
        affiliateApi.getCommissions(),
      ]);
      setMe(meData);
      setStats(statsData);
      setCommissions(commissionsData.items);
      setCommissionsPagination(commissionsData.pagination);

      if (meData.can_manage_sub_affiliates) {
        const subData = await affiliateApi.getSubAffiliates();
        setSubAffiliates(subData.items);
      }
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

  const referralUrl = me ? buildReferralUrl(me.code) : '';

  const copyReferralLink = async () => {
    if (!referralUrl) return;
    await navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copySubReferralLink = async (sub: AffiliateSubAffiliate) => {
    await navigator.clipboard.writeText(buildReferralUrl(sub.code));
    setCopiedSubId(sub.id);
    setTimeout(() => setCopiedSubId(null), 2000);
  };

  const formatCommissionType = (type: string) => {
    if (type === 'override') return t('affiliate.typeOverride');
    return type;
  };

  const handleCreateSubAffiliate = async (e: FormEvent) => {
    e.preventDefault();
    setSubFormLoading(true);
    setSubFormError(null);
    try {
      const created = await affiliateApi.createSubAffiliate(subForm);
      setSubAffiliates((prev) => [created, ...prev]);
      setShowCreateSub(false);
      if (me) {
        setSubForm(createDefaultSubAffiliatePayload(me));
      }
      const statsData = await affiliateApi.getStats();
      setStats(statsData);
    } catch (err) {
      setSubFormError(getApiErrorMessage(err, t('affiliate.subAffiliateCreateError')));
    } finally {
      setSubFormLoading(false);
    }
  };

  const toggleSubAffiliateStatus = async (sub: AffiliateSubAffiliate) => {
    const nextStatus = sub.status === 'active' ? 'inactive' : 'active';
    try {
      const updated = await affiliateApi.updateSubAffiliate(sub.id, { status: nextStatus });
      setSubAffiliates((prev) => prev.map((s) => (s.id === sub.id ? updated : s)));
    } catch {
      setError(t('affiliate.loadError'));
    }
  };

  const showCpaFields =
    subForm.commission_model === 'cpa' || subForm.commission_model === 'hybrid';
  const showRateFields =
    subForm.commission_model === 'revshare' || subForm.commission_model === 'hybrid';

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Modal
        isOpen={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        title={t('affiliate.changePassword')}
      >
        <ChangePasswordForm
          translationNamespace="affiliate"
          onChangePassword={affiliateApi.changePassword}
          onSuccess={() => setTimeout(() => setShowPasswordDialog(false), 1500)}
        />
      </Modal>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">{t('affiliate.portal')}</p>
          <h1 className="text-xl font-bold text-white">
            {t('affiliate.title')}
            {me ? ` · ${me.code}` : ''}
          </h1>
          {me?.is_sub_affiliate && me.parent_code && (
            <p className="mt-1 text-xs text-muted">
              {t('affiliate.parentAffiliate')}: {me.parent_code}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LanguageSelector />
          <Button variant="secondary" onClick={() => setShowPasswordDialog(true)}>
            {t('affiliate.changePassword')}
          </Button>
          <Button variant="secondary" onClick={() => logout()}>
            {t('affiliate.logout')}
          </Button>
        </div>
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
              {stats.sub_affiliates_count !== undefined && (
                <StatCard label={t('affiliate.subAffiliatesCount')} value={stats.sub_affiliates_count} />
              )}
              {stats.downline_players_count !== undefined && (
                <StatCard label={t('affiliate.downlinePlayers')} value={stats.downline_players_count} />
              )}
              {stats.override_commission !== undefined && (
                <StatCard label={t('affiliate.overrideCommission')} value={formatBalance(stats.override_commission)} />
              )}
              {stats.pending_override_commission !== undefined && (
                <StatCard
                  label={t('affiliate.pendingOverrideCommission')}
                  value={formatBalance(stats.pending_override_commission)}
                />
              )}
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

          {me?.can_manage_sub_affiliates && (
            <section className="rounded-lg border border-white/10 bg-card p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-white">{t('affiliate.subAffiliates')}</h2>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (!showCreateSub && me) {
                      setSubForm(createDefaultSubAffiliatePayload(me));
                      setSubFormError(null);
                    }
                    setShowCreateSub((v) => !v);
                  }}
                >
                  {t('affiliate.createSubAffiliate')}
                </Button>
              </div>

              {showCreateSub && (
                <form
                  onSubmit={handleCreateSubAffiliate}
                  className="mb-4 space-y-3 rounded border border-white/10 bg-background p-4"
                >
                  {subFormError && (
                    <p className="whitespace-pre-line text-sm text-accent">{subFormError}</p>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-xs text-muted">
                      {t('affiliate.portalEmail')}
                      <input
                        type="email"
                        className="mt-1 w-full rounded border border-white/10 bg-card px-3 py-2 text-sm text-white"
                        value={subForm.email}
                        onChange={(e) => setSubForm({ ...subForm, email: e.target.value })}
                        required
                      />
                    </label>
                    <label className="block text-xs text-muted">
                      {t('affiliate.portalPassword')}
                      <input
                        type="password"
                        className="mt-1 w-full rounded border border-white/10 bg-card px-3 py-2 text-sm text-white"
                        value={subForm.password}
                        onChange={(e) => setSubForm({ ...subForm, password: e.target.value })}
                        required
                        minLength={8}
                      />
                    </label>
                  </div>
                  <div
                    className={`grid gap-3 sm:grid-cols-2 ${
                      showRateFields && showCpaFields ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
                    }`}
                  >
                    <label className="block text-xs text-muted">
                      {t('affiliate.subAffiliateCode')}
                      <input
                        className="mt-1 w-full rounded border border-white/10 bg-card px-3 py-2 text-sm text-white"
                        value={subForm.code}
                        onChange={(e) => setSubForm({ ...subForm, code: e.target.value })}
                        required
                      />
                    </label>
                    <label className="block text-xs text-muted">
                      {t('affiliate.commissionModel')}
                      {allowedSubCommissionModels.length === 1 ? (
                        <p className="mt-1 rounded border border-white/10 bg-card px-3 py-2 text-sm text-white">
                          {commissionModelLabel(allowedSubCommissionModels[0], t)}
                        </p>
                      ) : (
                        <select
                          className="mt-1 w-full rounded border border-white/10 bg-card px-3 py-2 text-sm text-white"
                          value={subForm.commission_model}
                          onChange={(e) =>
                            setSubForm({
                              ...subForm,
                              commission_model: e.target.value as CreateSubAffiliatePayload['commission_model'],
                            })
                          }
                        >
                          {allowedSubCommissionModels.map((model) => (
                            <option key={model} value={model}>
                              {commissionModelLabel(model, t)}
                            </option>
                          ))}
                        </select>
                      )}
                    </label>
                    {showRateFields && (
                      <label className="block text-xs text-muted">
                        {t('affiliate.commissionRate')}
                        <input
                          type="number"
                          step="0.0001"
                          min={0}
                          max={Number(me?.commission_rate ?? 100)}
                          className="mt-1 w-full rounded border border-white/10 bg-card px-3 py-2 text-sm text-white"
                          value={subForm.commission_rate ?? 0}
                          onChange={(e) =>
                            setSubForm({ ...subForm, commission_rate: Number(e.target.value) })
                          }
                          required
                        />
                      </label>
                    )}
                    {showCpaFields && (
                      <label className="block text-xs text-muted">
                        {t('affiliate.cpaAmount')}
                        <input
                          type="number"
                          step="0.0001"
                          min={0}
                          max={Number(me?.cpa_amount ?? undefined)}
                          className="mt-1 w-full rounded border border-white/10 bg-card px-3 py-2 text-sm text-white"
                          value={subForm.cpa_amount ?? 0}
                          onChange={(e) =>
                            setSubForm({ ...subForm, cpa_amount: Number(e.target.value) })
                          }
                          required
                        />
                      </label>
                    )}
                  </div>
                  <Button type="submit" disabled={subFormLoading}>
                    {subFormLoading ? t('common.loading') : t('affiliate.createSubAffiliate')}
                  </Button>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-muted">
                      <th className="pb-2 pr-4">{t('affiliate.subAffiliateCode')}</th>
                      <th className="pb-2 pr-4">{t('affiliate.referralLink')}</th>
                      <th className="pb-2 pr-4">{t('affiliate.commissionModel')}</th>
                      <th className="pb-2 pr-4">{t('affiliate.referredPlayers')}</th>
                      <th className="pb-2 pr-4">{t('affiliate.status')}</th>
                      <th className="pb-2">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subAffiliates.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-4 text-muted">
                          {t('affiliate.noSubAffiliates')}
                        </td>
                      </tr>
                    ) : (
                      subAffiliates.map((sub) => (
                        <tr key={sub.id} className="border-b border-white/5">
                          <td className="py-2 pr-4 font-medium text-white">{sub.code}</td>
                          <td className="py-2 pr-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <code className="max-w-[14rem] break-all text-xs text-muted sm:max-w-xs">
                                {buildReferralUrl(sub.code)}
                              </code>
                              <button
                                type="button"
                                className="shrink-0 text-xs text-primary hover:underline"
                                onClick={() => copySubReferralLink(sub)}
                              >
                                {copiedSubId === sub.id ? t('common.copied') : t('common.copy')}
                              </button>
                            </div>
                          </td>
                          <td className="py-2 pr-4 text-xs text-muted">
                            {sub.commission_model}
                            {sub.commission_model !== 'cpa' && ` · ${formatPercent(sub.commission_rate)}%`}
                            {sub.cpa_amount && sub.commission_model !== 'revshare'
                              ? ` · ${formatBalance(sub.cpa_amount)}`
                              : ''}
                          </td>
                          <td className="py-2 pr-4">{sub.referred_players_count}</td>
                          <td className="py-2 pr-4">
                            <StatusBadge status={sub.status} />
                          </td>
                          <td className="py-2">
                            <button
                              type="button"
                              className="text-xs text-primary hover:underline"
                              onClick={() => toggleSubAffiliateStatus(sub)}
                            >
                              {sub.status === 'active'
                                ? t('affiliate.deactivate')
                                : t('affiliate.activate')}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="rounded-lg border border-white/10 bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold text-white">{t('affiliate.commissionHistory')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-muted">
                    <th className="pb-2 pr-4">{t('affiliate.type')}</th>
                    <th className="pb-2 pr-4">{t('affiliate.player')}</th>
                    <th className="pb-2 pr-4">{t('affiliate.amount')}</th>
                    <th className="pb-2 pr-4">{t('affiliate.status')}</th>
                    <th className="pb-2 pr-4">{t('affiliate.reference')}</th>
                    <th className="pb-2">{t('affiliate.date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-muted">
                        {t('affiliate.noCommissions')}
                      </td>
                    </tr>
                  ) : (
                    commissions.map((c) => (
                      <tr key={c.id} className="border-b border-white/5">
                        <td className="py-2 pr-4 uppercase">{formatCommissionType(c.type)}</td>
                        <td className="py-2 pr-4 font-mono text-xs">
                          {formatReferredPlayerId(c.player_id)}
                        </td>
                        <td className="py-2 pr-4">{formatBalance(c.amount)}</td>
                        <td className="py-2 pr-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="py-2 pr-4 text-xs text-muted">
                          {c.reference_type}:{c.reference_id}
                        </td>
                        <td className="py-2">{formatDate(c.created_at)}</td>
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
