import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { bonusApi, type ActiveBonus, type BonusPolicy } from '@/api/bonus.api';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useWalletStore } from '@/stores/walletStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatBalance } from '@/utils/formatBalance';

function WageringBar({ required, wagered }: { required: string; wagered: string }) {
  const { t } = useTranslation();
  const req = parseFloat(required) || 1;
  const wag = parseFloat(wagered) || 0;
  const pct = Math.min(100, (wag / req) * 100);

  return (
    <div className="mt-2">
      <div className="mb-1 flex justify-between text-xs text-muted">
        <span>{t('bonus.wageringProgress')}</span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-background">
        <div
          className="h-full rounded-full bg-accent-purple transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-muted">
        {formatBalance(wagered)} / {formatBalance(required)}
      </p>
    </div>
  );
}

function canShowClaimButton(policy: BonusPolicy): boolean {
  if (policy.type === 'welcome') {
    return policy.claimable;
  }

  if (policy.type === 'free_spin') {
    return policy.claimable;
  }

  return false;
}

export function BonusPage() {
  const { t, tStatus, tBonusType } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchBalance = useWalletStore((s) => s.fetchBalance);
  const [available, setAvailable] = useState<BonusPolicy[]>([]);
  const [active, setActive] = useState<ActiveBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([bonusApi.getAvailable(), bonusApi.getActive()])
      .then(([avail, act]) => {
        setAvailable(avail);
        setActive(act);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    load();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleClaim = async (policy: BonusPolicy) => {
    setClaimingId(policy.policy_id);
    setError(null);
    setMessage(null);
    try {
      const result = await bonusApi.claim(policy.policy_id);
      if (policy.type === 'free_spin' && result.spin_count != null) {
        setMessage(
          t('bonus.freeSpinClaimed', {
            count: result.spin_count,
            status: tStatus(result.status),
          }),
        );
      } else {
        setMessage(
          t('bonus.claimed', {
            amount: formatBalance(result.amount),
            status: tStatus(result.status),
          }),
        );
      }
      await fetchBalance();
      void useNotificationStore.getState().fetchUnreadCount();
      load();
    } catch (err) {
      setError(getApiErrorMessage(err, t('bonus.claimFailed')));
    } finally {
      setClaimingId(null);
    }
  };

  const renderPolicyDetails = (policy: BonusPolicy) => {
    if (policy.type === 'free_spin') {
      return (
        <>
          <p className="mt-2 text-sm text-muted">
            {t('bonus.freeSpinCount', { count: policy.spin_count ?? 0 })}
          </p>
          
        </>
      );
    }

    return (
      <p className="mt-2 text-sm text-muted">
        {policy.amount_type === 'percentage'
          ? t('bonus.percentMatch', { value: formatBalance(policy.amount_value) })
          : t('bonus.fixedMatch', { value: formatBalance(policy.amount_value) })}
        {' · '}
        {t('bonus.wageringMultiplier', { value: policy.wagering_multiplier })}
      </p>
    );
  };

  const renderClaimBlockedMessage = (policy: BonusPolicy) => {
    if (policy.type !== 'free_spin' || !policy.claim_blocked_reason) {
      return null;
    }

    if (policy.claim_blocked_reason === 'deposit_required') {
      return (
        <p className="mt-4 text-xs text-muted">
          {t('bonus.depositRequired')}{' '}
          <Link to="/deposit" className="text-accent underline">
            {t('bonus.depositCta')}
          </Link>
        </p>
      );
    }

    if (policy.claim_blocked_reason === 'first_deposit_after_valid_from_required') {
      return (
        <p className="mt-4 text-xs text-muted">
          {t('bonus.firstDepositAfterValidFromRequired')}
        </p>
      );
    }

    if (policy.claim_blocked_reason === 'already_claimed') {
      return <p className="mt-4 text-xs text-muted">{t('bonus.alreadyClaimed')}</p>;
    }

    if (policy.claim_blocked_reason === 'provider_not_supported') {
      return <p className="mt-4 text-xs text-muted">{t('bonus.providerNotSupported')}</p>;
    }

    return null;
  };

  return (
    <div className="py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">{t('bonus.title')}</h1>

      {message && (
        <p className="mb-4 rounded-md bg-green-500/10 px-4 py-3 text-sm text-green-400">{message}</p>
      )}
      {error && (
        <p className="mb-4 rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
      )}

      {loading ? (
        <p className="text-muted">{t('common.loadingBonuses')}</p>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">{t('bonus.activeBonuses')}</h2>
            {active.length === 0 ? (
              <div className="rounded-lg border border-white/5 bg-surface p-6 text-center">
                <p className="text-muted text-sm">{t('bonus.noActive')}</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {active.map((bonus) => (
                  <div
                    key={bonus.id}
                    className="rounded-lg border border-white/5 bg-surface p-5 shadow-card"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-white">
                          {bonus.policy_name ?? t('bonus.defaultName')}
                        </h3>
                        {bonus.type === 'free_spin' && bonus.spin_count != null ? (
                          <>
                            <p className="mt-1 text-xl font-bold text-accent-gold">
                              {t('bonus.freeSpinUsage', {
                                used: bonus.spins_used ?? 0,
                                total: bonus.spin_count,
                              })}
                            </p>
                            {parseFloat(bonus.amount) > 0 && (
                              <p className="mt-1 text-sm text-muted">
                                {t('bonus.freeSpinWinnings', { amount: formatBalance(bonus.amount) })}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="mt-1 text-xl font-bold text-accent-gold">{formatBalance(bonus.amount)}</p>
                        )}
                      </div>
                      <StatusBadge status={bonus.status} />
                    </div>
                    {bonus.wagering && (
                      <WageringBar
                        required={bonus.wagering.required}
                        wagered={bonus.wagering.wagered}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">{t('bonus.availableBonuses')}</h2>
            {available.length === 0 ? (
              <div className="rounded-lg border border-white/5 bg-surface p-6 text-center">
                <p className="text-muted text-sm">{t('bonus.noAvailable')}</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {available.map((policy) => (
                  <div
                    key={policy.policy_id}
                    className="rounded-lg border border-accent/20 bg-gradient-to-br from-card to-surface p-5 shadow-card"
                  >
                    <span className="text-xs font-medium uppercase text-accent">
                      {tBonusType(policy.type)}
                    </span>
                    <h3 className="mt-1 font-semibold text-white">{policy.name}</h3>
                    {renderPolicyDetails(policy)}
                    {canShowClaimButton(policy) && (
                      <Button
                        variant="primary"
                        className="mt-4 w-full text-xs"
                        disabled={claimingId === policy.policy_id}
                        onClick={() => handleClaim(policy)}
                      >
                        {claimingId === policy.policy_id
                          ? t('common.claiming')
                          : t('bonus.claimBonus')}
                      </Button>
                    )}
                    {renderClaimBlockedMessage(policy)}
                    {policy.type === 'first_deposit' && (
                      <p className="mt-4 text-xs text-muted">{t('bonus.firstDepositAutoApply')}</p>
                    )}
                    {policy.type !== 'welcome'
                      && policy.type !== 'first_deposit'
                      && policy.type !== 'free_spin'
                      && (
                      <p className="mt-4 text-xs text-muted">{t('bonus.autoApply')}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
