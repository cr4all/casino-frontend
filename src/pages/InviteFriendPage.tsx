import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { inviteApi, type PlayerInviteOverview } from '@/api/invite.api';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatBalance } from '@/utils/formatBalance';

export function InviteFriendPage() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [overview, setOverview] = useState<PlayerInviteOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    inviteApi
      .getOverview()
      .then(setOverview)
      .catch((err) => setError(getApiErrorMessage(err, t('invite.loadError'))))
      .finally(() => setLoading(false));
  }, [isAuthenticated, t]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const copyValue = async (value: string, kind: 'link' | 'code') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setError(t('invite.copyFailed'));
    }
  };

  const formatReward = (amount: string | undefined, currency: string) => {
    if (!amount) return t('invite.rewardTbd');
    return `${formatBalance(amount)} ${currency}`;
  };

  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t('invite.title')}</h1>
        <p className="mt-1 text-sm text-muted">{t('invite.subtitle')}</p>
      </div>

      {loading && <div className="py-12 text-center text-muted">{t('common.loading')}</div>}

      {!loading && error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {!loading && overview && (
        <div className="space-y-6">
          {!overview.enabled && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {t('invite.programDisabled')}
            </div>
          )}

          <section className="rounded-xl border border-white/10 bg-surface/90 p-6 shadow-card">
            <h2 className="mb-2 text-sm font-semibold text-white">{t('invite.howItWorks')}</h2>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-muted">
              <li>{t('invite.stepShare')}</li>
              <li>
                {t('invite.stepDeposit', {
                  amount: formatBalance(overview.min_deposit_amount),
                  currency: overview.currency,
                })}
              </li>
              <li>
                {t('invite.stepReward', {
                  referrer: formatReward(overview.referrer_reward?.amount, overview.currency),
                  invitee: formatReward(overview.invitee_reward?.amount, overview.currency),
                })}
              </li>
            </ol>
          </section>

          <section className="rounded-xl border border-white/10 bg-surface/90 p-6 shadow-card">
            <h2 className="mb-4 text-sm font-semibold text-white">{t('invite.yourInvite')}</h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
                  {t('invite.inviteLink')}
                </p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    readOnly
                    value={overview.invite_link}
                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-card/50 px-3 py-2 text-sm text-white"
                  />
                  <Button
                    type="button"
                    variant="gold"
                    className="shrink-0"
                    onClick={() => void copyValue(overview.invite_link, 'link')}
                  >
                    {copied === 'link' ? t('invite.copied') : t('invite.copyLink')}
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
                  {t('invite.inviteCode')}
                </p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    readOnly
                    value={overview.code}
                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-card/50 px-3 py-2 font-mono text-sm tracking-wider text-white"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="shrink-0"
                    onClick={() => void copyValue(overview.code, 'code')}
                  >
                    {copied === 'code' ? t('invite.copied') : t('invite.copyCode')}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-4">
            {(
              [
                ['invited', overview.stats.invited],
                ['pending', overview.stats.pending],
                ['rewarded', overview.stats.rewarded],
                ['rejected', overview.stats.rejected],
              ] as const
            ).map(([key, value]) => (
              <div
                key={key}
                className="rounded-xl border border-white/10 bg-surface/90 px-4 py-3 shadow-card"
              >
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
                  {t(`invite.stats.${key}`)}
                </p>
                <p className="mt-1 text-xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </section>

          <section className="rounded-xl border border-white/10 bg-surface/90 p-6 shadow-card">
            <h2 className="mb-4 text-sm font-semibold text-white">{t('invite.friends')}</h2>
            {overview.referrals.length === 0 ? (
              <p className="text-sm text-muted">{t('invite.noFriends')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-muted">
                      <th className="pb-2 font-medium">{t('invite.friend')}</th>
                      <th className="pb-2 font-medium">{t('invite.status')}</th>
                      <th className="pb-2 font-medium">{t('invite.registered')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.referrals.map((item) => (
                      <tr key={item.id} className="border-b border-white/5">
                        <td className="py-3 text-white">
                          {item.friend.nickname ?? item.friend.email ?? '—'}
                        </td>
                        <td className="py-3">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="py-3 text-muted">
                          {item.registered_at
                            ? new Date(item.registered_at).toLocaleDateString()
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
