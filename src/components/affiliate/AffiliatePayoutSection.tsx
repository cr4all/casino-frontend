import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  affiliateApi,
  type AffiliatePayout,
  type AffiliatePayoutAvailability,
} from '@/api/affiliate.api';
import { Button } from '@/components/common/Button';
import { FormTextField } from '@/components/common/FormTextField';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useTranslation } from '@/hooks/useTranslation';
import { getApiErrorMessage } from '@/utils/apiError';
import { formatBalance } from '@/utils/formatBalance';
import {
  collectFieldErrors,
  hasFieldErrors,
  omitFieldError,
  requiredValue,
  type FieldErrors,
} from '@/utils/formValidation';

function cannotRequestMessage(
  reason: string | null,
  t: (key: string) => string,
): string | null {
  switch (reason) {
    case 'payout_details_required':
      return t('affiliate.cannotRequestReasonDetails');
    case 'pending_request_exists':
      return t('affiliate.cannotRequestReasonPending');
    case 'no_available_balance':
      return t('affiliate.cannotRequestReasonBalance');
    case 'below_minimum':
      return t('affiliate.cannotRequestReasonMinimum');
    default:
      return null;
  }
}

interface AffiliatePayoutSectionProps {
  onChanged?: () => void;
}

export function AffiliatePayoutSection({ onChanged }: AffiliatePayoutSectionProps) {
  const { t } = useTranslation();
  const [availability, setAvailability] = useState<AffiliatePayoutAvailability | null>(null);
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([]);
  const [accountWalletId, setAccountWalletId] = useState('');
  const [note, setNote] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingDetails, setSavingDetails] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(true);
  const [hasSavedDetails, setHasSavedDetails] = useState(false);
  const detailsExpandInitialized = useRef(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [availabilityData, detailsData, payoutsData] = await Promise.all([
        affiliateApi.getPayoutAvailability(),
        affiliateApi.getPayoutDetails(),
        affiliateApi.getPayouts(),
      ]);
      setAvailability(availabilityData);
      setPayouts(payoutsData.items);
      const savedAccount = String(detailsData.payout_details?.account_wallet_id ?? '').trim();
      const hasDetails = savedAccount !== '';
      setHasSavedDetails(hasDetails);
      setAccountWalletId(savedAccount);
      setNote(String(detailsData.payout_details?.note ?? ''));
      if (!detailsExpandInitialized.current) {
        setDetailsExpanded(!hasDetails);
        detailsExpandInitialized.current = true;
      }
    } catch (err) {
      setError(getApiErrorMessage(err, t('affiliate.loadError')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const validateDetails = (): boolean => {
    const errors = collectFieldErrors([
      [
        'account_wallet_id',
        requiredValue(accountWalletId)
          ? undefined
          : t('common.fieldRequired', { field: t('affiliate.accountWalletId') }),
      ],
    ]);
    setFieldErrors(errors);
    return !hasFieldErrors(errors);
  };

  const handleSaveDetails = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (!validateDetails()) {
      return;
    }

    setSavingDetails(true);
    try {
      const payout_details: Record<string, string> = {
        account_wallet_id: accountWalletId.trim(),
      };
      if (note.trim() !== '') {
        payout_details.note = note.trim();
      }
      await affiliateApi.updatePayoutDetails({ payout_details });
      setMessage(t('affiliate.payoutDetailsSaved'));
      await load();
      onChanged?.();
    } catch (err) {
      setError(getApiErrorMessage(err, t('affiliate.payoutDetailsSaveFailed')));
    } finally {
      setSavingDetails(false);
    }
  };

  const handleRequestPayout = async () => {
    setMessage(null);
    setError(null);
    setRequesting(true);
    try {
      await affiliateApi.requestPayout();
      setMessage(t('affiliate.payoutRequested'));
      await load();
      onChanged?.();
    } catch (err) {
      setError(getApiErrorMessage(err, t('affiliate.payoutRequestFailed')));
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted">{t('common.loading')}</p>;
  }

  const blockedReason = cannotRequestMessage(availability?.reason ?? null, t);

  return (
    <section className="space-y-4 rounded-lg border border-white/10 bg-card p-4">
      <h2 className="text-sm font-semibold text-white">{t('affiliate.payouts')}</h2>

      {error && <p className="whitespace-pre-line text-sm text-accent">{error}</p>}
      {message && <p className="text-sm text-green-400">{message}</p>}

      {availability && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded border border-white/10 bg-background p-3">
            <p className="text-xs text-muted">{t('affiliate.availablePayout')}</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {formatBalance(availability.available_amount)} {availability.currency}
            </p>
            <p className="mt-1 text-xs text-muted">
              {t('affiliate.periodEnd')}: {availability.period_end}
            </p>
          </div>
          <div className="rounded border border-white/10 bg-background p-3">
            <p className="text-xs text-muted">{t('affiliate.accruingCommission')}</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {formatBalance(availability.accruing_amount)} {availability.currency}
            </p>
          </div>
          <div className="rounded border border-white/10 bg-background p-3">
            <p className="text-xs text-muted">{t('affiliate.minPayout')}</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {formatBalance(availability.min_payout_amount)} {availability.currency}
            </p>
            <div className="mt-3">
              <Button
                disabled={!availability.can_request || requesting}
                onClick={() => void handleRequestPayout()}
              >
                {requesting ? t('common.loading') : t('affiliate.requestPayout')}
              </Button>
            </div>
            {blockedReason && !availability.can_request && (
              <p className="mt-2 text-xs text-muted">{blockedReason}</p>
            )}
          </div>
        </div>
      )}

      <div className="rounded border border-white/10 bg-background p-4">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 text-left"
          aria-expanded={detailsExpanded}
          onClick={() => setDetailsExpanded((open) => !open)}
        >
          <div>
            <h3 className="text-sm font-medium text-white">{t('affiliate.payoutDetails')}</h3>
            {!detailsExpanded && hasSavedDetails && (
              <p className="mt-1 text-xs text-muted">{accountWalletId}</p>
            )}
          </div>
          <span className="text-xs text-muted" aria-hidden>
            {detailsExpanded ? '−' : '+'}
          </span>
        </button>

        {detailsExpanded && (
          <form onSubmit={handleSaveDetails} noValidate className="mt-3 space-y-3">
            <FormTextField
              label={t('affiliate.accountWalletId')}
              name="account_wallet_id"
              value={accountWalletId}
              error={fieldErrors.account_wallet_id}
              onChange={(e) => {
                setAccountWalletId(e.target.value);
                setFieldErrors((prev) => omitFieldError(prev, 'account_wallet_id'));
              }}
            />
            <FormTextField
              label={t('affiliate.note')}
              name="note"
              value={note}
              error={fieldErrors.note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button type="submit" variant="secondary" disabled={savingDetails}>
              {savingDetails ? t('common.loading') : t('affiliate.savePayoutDetails')}
            </Button>
          </form>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-white">{t('affiliate.payoutHistory')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-muted">
                <th className="px-2 py-2">ID</th>
                <th className="px-2 py-2">{t('affiliate.amount')}</th>
                <th className="px-2 py-2">{t('affiliate.accountWalletId')}</th>
                <th className="px-2 py-2">{t('affiliate.status')}</th>
                <th className="px-2 py-2">{t('affiliate.date')}</th>
                <th className="px-2 py-2">{t('affiliate.rejectionReason')}</th>
              </tr>
            </thead>
            <tbody>
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-2 py-4 text-muted">
                    {t('affiliate.noPayouts')}
                  </td>
                </tr>
              ) : (
                payouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-white/5">
                    <td className="px-2 py-2 text-white">#{payout.id}</td>
                    <td className="px-2 py-2 text-white">
                      {formatBalance(payout.total_amount)} {payout.currency}
                    </td>
                    <td className="px-2 py-2 text-muted">
                      {payout.payout_details?.account_wallet_id ?? '—'}
                    </td>
                    <td className="px-2 py-2">
                      <StatusBadge status={payout.status} />
                    </td>
                    <td className="px-2 py-2 text-muted">
                      {payout.created_at ? new Date(payout.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-2 py-2 text-muted">{payout.rejection_reason ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
