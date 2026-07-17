import { useEffect, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import {
  affiliateApi,
  type AffiliateMe,
  type AffiliatePlayerStatistics,
  type AffiliateStats,
  type AffiliateSubAffiliate,
  type CreateSubAffiliatePayload,
  type PlayerStatisticsPeriod,
} from '@/api/affiliate.api';
import { AffiliatePlayerStatisticsTable, type PlayerStatisticsPeriodChange } from '@/components/affiliate/AffiliatePlayerStatisticsTable';
import { AffiliatePayoutSection } from '@/components/affiliate/AffiliatePayoutSection';
import { Button } from '@/components/common/Button';
import { FormTextField } from '@/components/common/FormTextField';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { Modal } from '@/components/common/Modal';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import { AuthService } from '@/services/AuthService';
import type { PaginationMeta } from '@/types';
import {
  getAllowedSubAffiliateCommissionModels,
  getDefaultSubAffiliateCommissionModel,
  type CommissionModel,
} from '@/utils/affiliateCommissionModel';
import { formatBalance, formatPercent } from '@/utils/formatBalance';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  collectFieldErrors,
  hasFieldErrors,
  isValidEmail,
  omitFieldError,
  requiredValue,
  type FieldErrors,
} from '@/utils/formValidation';

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

export function AffiliateDashboardPage() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = AuthService.logout;

  const [me, setMe] = useState<AffiliateMe | null>(null);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [playerStats, setPlayerStats] = useState<AffiliatePlayerStatistics[]>([]);
  const [playerStatsPeriod, setPlayerStatsPeriod] = useState<PlayerStatisticsPeriod>('today');
  const [playerStatsCustomFrom, setPlayerStatsCustomFrom] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [playerStatsCustomTo, setPlayerStatsCustomTo] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [playerStatsPagination, setPlayerStatsPagination] = useState<PaginationMeta | null>(null);
  const [playerStatsLoading, setPlayerStatsLoading] = useState(false);
  const [subAffiliates, setSubAffiliates] = useState<AffiliateSubAffiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedSubId, setCopiedSubId] = useState<number | null>(null);
  const [showCreateSub, setShowCreateSub] = useState(false);
  const [subFormError, setSubFormError] = useState<string | null>(null);
  const [subFormFieldErrors, setSubFormFieldErrors] = useState<FieldErrors>({});
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

  const showCpaFields =
    subForm.commission_model === 'cpa' || subForm.commission_model === 'hybrid';
  const showRateFields =
    subForm.commission_model === 'revshare' || subForm.commission_model === 'hybrid';

  const loadPlayerStatistics = async (
    change: PlayerStatisticsPeriodChange,
    page = 1,
  ) => {
    setPlayerStatsLoading(true);
    try {
      const data = await affiliateApi.getPlayerStatistics({
        period: change.period,
        page,
        from: change.period === 'custom' ? change.from : undefined,
        to: change.period === 'custom' ? change.to : undefined,
      });
      setPlayerStats(data.items);
      setPlayerStatsPagination(data.pagination);
      setPlayerStatsPeriod(data.period);
      if (data.from) {
        setPlayerStatsCustomFrom(data.from);
      }
      if (data.to) {
        setPlayerStatsCustomTo(data.to);
      }
    } catch {
      setError(t('affiliate.loadError'));
    } finally {
      setPlayerStatsLoading(false);
    }
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [meData, statsData, playerStatsData] = await Promise.all([
        affiliateApi.getMe(),
        affiliateApi.getStats(),
        affiliateApi.getPlayerStatistics({
          period: playerStatsPeriod,
          from: playerStatsPeriod === 'custom' ? playerStatsCustomFrom : undefined,
          to: playerStatsPeriod === 'custom' ? playerStatsCustomTo : undefined,
        }),
      ]);
      setMe(meData);
      setStats(statsData);
      setPlayerStats(playerStatsData.items);
      setPlayerStatsPagination(playerStatsData.pagination);

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

  const handlePlayerStatsPeriodChange = (change: PlayerStatisticsPeriodChange) => {
    setPlayerStatsPeriod(change.period);
    if (change.from) {
      setPlayerStatsCustomFrom(change.from);
    }
    if (change.to) {
      setPlayerStatsCustomTo(change.to);
    }
    void loadPlayerStatistics(change);
  };

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

  const validateSubForm = (): boolean => {
    const required = (field: string, value: string) =>
      requiredValue(value) ? undefined : t('common.fieldRequired', { field });

    let emailError: string | undefined;
    if (!requiredValue(subForm.email)) {
      emailError = t('common.fieldRequired', { field: t('affiliate.portalEmail') });
    } else if (!isValidEmail(subForm.email)) {
      emailError = t('common.fieldEmailInvalid');
    }

    let passwordError: string | undefined;
    if (!requiredValue(subForm.password)) {
      passwordError = t('common.fieldRequired', { field: t('affiliate.portalPassword') });
    } else if (subForm.password.length < 8) {
      passwordError = t('common.fieldMinLength', { count: 8 });
    }

    const checks: Array<[string, string | undefined]> = [
      ['email', emailError],
      ['password', passwordError],
      ['code', required(t('affiliate.subAffiliateCode'), subForm.code)],
    ];

    if (showRateFields) {
      checks.push([
        'commission_rate',
        subForm.commission_rate == null || subForm.commission_rate < 0
          ? t('common.fieldRequired', { field: t('affiliate.commissionRate') })
          : undefined,
      ]);
    }

    if (showCpaFields) {
      checks.push([
        'cpa_amount',
        subForm.cpa_amount == null || subForm.cpa_amount < 0
          ? t('common.fieldRequired', { field: t('affiliate.cpaAmount') })
          : undefined,
      ]);
    }

    const errors = collectFieldErrors(checks);
    setSubFormFieldErrors(errors);
    return !hasFieldErrors(errors);
  };

  const handleCreateSubAffiliate = async (e: FormEvent) => {
    e.preventDefault();
    setSubFormError(null);
    setSubFormFieldErrors({});

    if (!validateSubForm()) {
      return;
    }

    setSubFormLoading(true);
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
              <StatCard label={t('affiliate.availablePayout')} value={formatBalance(stats.available_payout)} />
              <StatCard label={t('affiliate.accruingCommission')} value={formatBalance(stats.accruing_commission)} />
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

          <AffiliatePayoutSection
            onChanged={async () => {
              const statsData = await affiliateApi.getStats();
              setStats(statsData);
            }}
          />

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
                      setSubFormFieldErrors({});
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
                  noValidate
                  className="mb-4 space-y-3 rounded border border-white/10 bg-background p-4"
                >
                  {subFormError && (
                    <p className="whitespace-pre-line text-sm text-accent">{subFormError}</p>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormTextField
                      id="sub-affiliate-email"
                      label={t('affiliate.portalEmail')}
                      type="email"
                      value={subForm.email}
                      onChange={(e) => {
                        setSubForm({ ...subForm, email: e.target.value });
                        setSubFormFieldErrors((prev) => omitFieldError(prev, 'email'));
                      }}
                      error={subFormFieldErrors.email}
                    />
                    <FormTextField
                      id="sub-affiliate-password"
                      label={t('affiliate.portalPassword')}
                      type="password"
                      value={subForm.password}
                      onChange={(e) => {
                        setSubForm({ ...subForm, password: e.target.value });
                        setSubFormFieldErrors((prev) => omitFieldError(prev, 'password'));
                      }}
                      error={subFormFieldErrors.password}
                    />
                  </div>
                  <div
                    className={`grid gap-3 sm:grid-cols-2 ${
                      showRateFields && showCpaFields ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
                    }`}
                  >
                    <FormTextField
                      id="sub-affiliate-code"
                      label={t('affiliate.subAffiliateCode')}
                      value={subForm.code}
                      onChange={(e) => {
                        setSubForm({ ...subForm, code: e.target.value });
                        setSubFormFieldErrors((prev) => omitFieldError(prev, 'code'));
                      }}
                      error={subFormFieldErrors.code}
                    />
                    <div>
                      <label className="mb-1 block text-xs text-muted">{t('affiliate.commissionModel')}</label>
                      {allowedSubCommissionModels.length === 1 ? (
                        <p className="rounded border border-white/10 bg-card px-3 py-2 text-sm text-white">
                          {commissionModelLabel(allowedSubCommissionModels[0], t)}
                        </p>
                      ) : (
                        <select
                          className="w-full rounded border border-white/10 bg-card px-3 py-2 text-sm text-white"
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
                    </div>
                    {showRateFields && (
                      <FormTextField
                        id="sub-affiliate-rate"
                        label={t('affiliate.commissionRate')}
                        type="number"
                        step="0.0001"
                        min={0}
                        max={Number(me?.commission_rate ?? 100)}
                        value={subForm.commission_rate ?? 0}
                        onChange={(e) => {
                          setSubForm({ ...subForm, commission_rate: Number(e.target.value) });
                          setSubFormFieldErrors((prev) => omitFieldError(prev, 'commission_rate'));
                        }}
                        error={subFormFieldErrors.commission_rate}
                      />
                    )}
                    {showCpaFields && (
                      <FormTextField
                        id="sub-affiliate-cpa"
                        label={t('affiliate.cpaAmount')}
                        type="number"
                        step="0.0001"
                        min={0}
                        max={Number(me?.cpa_amount ?? undefined)}
                        value={subForm.cpa_amount ?? 0}
                        onChange={(e) => {
                          setSubForm({ ...subForm, cpa_amount: Number(e.target.value) });
                          setSubFormFieldErrors((prev) => omitFieldError(prev, 'cpa_amount'));
                        }}
                        error={subFormFieldErrors.cpa_amount}
                      />
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

          <AffiliatePlayerStatisticsTable
            items={playerStats}
            pagination={playerStatsPagination}
            period={playerStatsPeriod}
            customFrom={playerStatsCustomFrom}
            customTo={playerStatsCustomTo}
            loading={playerStatsLoading}
            onPeriodChange={handlePlayerStatsPeriodChange}
          />
        </>
      )}
    </div>
  );
}
