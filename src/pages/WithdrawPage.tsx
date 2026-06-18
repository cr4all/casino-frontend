import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  paymentApi,
  type PaymentCountry,
  type PaymentOption,
  type WithdrawalItem,
} from '@/api/payment.api';
import { useAuthStore } from '@/stores/authStore';
import { DEFAULT_CURRENCY, useWalletStore } from '@/stores/walletStore';
import { formatBalance } from '@/utils/formatBalance';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PaymentCountrySelect } from '@/components/payment/PaymentCountrySelect';
import { PaymentOptionGrid, PaymentOptionSummary } from '@/components/payment/PaymentOptionGrid';
import { useTranslation } from '@/hooks/useTranslation';
import { getApiErrorMessage } from '@/utils/apiError';

function formatPaymentAmount(currency: string, amount: string): string {
  return `${currency} ${formatBalance(amount)}`;
}

export function WithdrawPage() {
  const { t, tPaymentMethod, formatDate } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const balance = useWalletStore((s) => s.balance);
  const fetchBalance = useWalletStore((s) => s.fetchBalance);
  const [countries, setCountries] = useState<PaymentCountry[]>([]);
  const [country, setCountry] = useState('');
  const [options, setOptions] = useState<PaymentOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmedOption, setConfirmedOption] = useState<PaymentOption | null>(null);
  const [optionKey, setOptionKey] = useState('');
  const [amount, setAmount] = useState('');
  const [destinationValues, setDestinationValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadWithdrawals = () =>
    paymentApi.getWithdrawals().then((data) => setWithdrawals(data.items));

  const resetToStep1 = () => {
    setStep(1);
    setConfirmedOption(null);
    setOptionKey('');
    setAmount('');
    setDestinationValues({});
    setError(null);
  };

  const handleCountryChange = (code: string) => {
    setCountry(code);
    resetToStep1();
    setMessage(null);
  };

  const handleOptionSelect = (option: PaymentOption) => {
    setConfirmedOption(option);
    setOptionKey(option.key);
    setAmount('');
    setDestinationValues({});
    setError(null);
    setMessage(null);
    setStep(2);
  };

  const handleBackToMethods = () => {
    setStep(1);
    setAmount('');
    setDestinationValues({});
    setError(null);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([paymentApi.getCountries(), fetchBalance(), loadWithdrawals()])
      .then(([data]) => {
        setCountries(data.countries);
        const initial = data.default_country ?? data.countries[0]?.code ?? '';
        setCountry(initial);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, fetchBalance]);

  useEffect(() => {
    if (!country) {
      setOptions([]);
      return;
    }

    setOptionsLoading(true);
    paymentApi.getWithdrawOptions(country)
      .then((data) => setOptions(data.items))
      .catch(() => setOptions([]))
      .finally(() => setOptionsLoading(false));
  }, [country]);

  useEffect(() => {
    if (!confirmedOption) {
      setDestinationValues({});
      return;
    }

    const initial: Record<string, string> = {};
    confirmedOption.destination_fields.forEach((field) => {
      initial[field.name] = '';
    });
    setDestinationValues(initial);
  }, [confirmedOption?.key]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleDestinationChange = (name: string, value: string) => {
    setDestinationValues((prev) => ({ ...prev, [name]: value }));
  };

  const missingRequiredDestination = confirmedOption?.destination_fields.some(
    (field) => field.required && !destinationValues[field.name]?.trim(),
  ) ?? false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!optionKey || !amount || !country || missingRequiredDestination) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const result = await paymentApi.createWithdrawal(
        optionKey,
        amount,
        country,
        destinationValues,
      );
      setMessage(
        t('withdraw.submitted', { id: result.withdrawal_id, status: result.status }),
      );
      setAmount('');
      setDestinationValues({});
      await fetchBalance();
      await loadWithdrawals();
    } catch (err) {
      setError(getApiErrorMessage(err, t('withdraw.submitFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl py-4 sm:py-8">
      {loading ? (
        <div className="mx-auto w-full max-w-2xl space-y-6">
          <h1 className="text-center text-2xl font-bold text-white">{t('withdraw.title')}</h1>
          <p className="text-center text-muted">{t('common.loading')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="mx-auto w-full max-w-2xl min-w-0 space-y-6">
          <h1 className="text-center text-2xl font-bold text-white">{t('withdraw.title')}</h1>
          <div className="space-y-4">
          <p className="text-center text-sm text-muted break-words">
            {t('withdraw.availableBalance')}{' '}
            <span className="font-mono text-accent-gold">
              {balance?.currency ?? DEFAULT_CURRENCY} {formatBalance(balance?.balance)}
            </span>
          </p>

          {step === 1 ? (
            <div className="rounded-xl border border-white/[0.08] bg-card p-4 space-y-4 sm:p-6">
              <PaymentCountrySelect
                countries={countries}
                value={country}
                onChange={handleCountryChange}
                label={t('deposit.selectCountry')}
              />

              <div>
                <p className="mb-2 text-xs text-muted">{t('deposit.selectPaymentOption')}</p>
                <PaymentOptionGrid
                  options={options}
                  value={optionKey}
                  onChange={setOptionKey}
                  onSelect={handleOptionSelect}
                  variant="list"
                  loading={optionsLoading}
                  loadingLabel={t('common.loadingPaymentMethods')}
                  emptyLabel={t('deposit.noOptionsForCountry')}
                />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-xl border border-white/[0.08] bg-card p-4 space-y-4 sm:p-6">
              <Button
                type="button"
                variant="secondary"
                onClick={handleBackToMethods}
                className="w-fit px-3 py-1.5 text-xs"
              >
                {t('deposit.backToMethods')}
              </Button>

              {confirmedOption && <PaymentOptionSummary option={confirmedOption} />}

              <div>
                <label htmlFor="withdraw-amount" className="mb-1 block text-xs text-muted">
                  {t('deposit.amount')}
                </label>
                <input
                  id="withdraw-amount"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white"
                />
              </div>

              {confirmedOption?.destination_fields.map((field) => (
                <div key={field.name}>
                  <label htmlFor={`withdraw-${field.name}`} className="mb-1 block text-xs text-muted">
                    {field.label}
                    {!field.required && ` (${t('withdraw.networkOptional')})`}
                  </label>
                  <input
                    id={`withdraw-${field.name}`}
                    type="text"
                    value={destinationValues[field.name] ?? ''}
                    onChange={(e) => handleDestinationChange(field.name, e.target.value)}
                    required={field.required}
                    className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white"
                  />
                </div>
              ))}

              {error && <p className="text-sm text-red-400">{error}</p>}
              {message && <p className="text-sm text-green-400">{message}</p>}

              <Button
                type="submit"
                variant="gold"
                disabled={submitting || !confirmedOption || !country || missingRequiredDestination}
              >
                {submitting ? t('common.submitting') : t('withdraw.requestWithdrawal')}
              </Button>
            </form>
          )}
          </div>
          </div>

          <section className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">{t('withdraw.recentWithdrawals')}</h2>
              {withdrawals.length > 0 && (
                <Link to="/transactions?tab=withdrawals" className="text-xs text-accent hover:underline">
                  {t('common.viewAll')}
                </Link>
              )}
            </div>
            {withdrawals.length === 0 ? (
              <p className="text-sm text-muted">{t('withdraw.noWithdrawals')}</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
                <table className="w-full min-w-[28rem] text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-surface text-left">
                      <th className="px-3 py-3 text-xs text-muted sm:px-4">{t('deposit.id')}</th>
                      <th className="px-3 py-3 text-xs text-muted sm:px-4">{t('deposit.amount')}</th>
                      <th className="hidden px-3 py-3 text-xs text-muted sm:table-cell sm:px-4">{t('transactions.method')}</th>
                      <th className="px-3 py-3 text-xs text-muted sm:px-4">{t('transactions.status')}</th>
                      <th className="hidden px-3 py-3 text-xs text-muted md:table-cell sm:px-4">{t('transactions.date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.slice(0, 5).map((w) => (
                      <tr key={w.id} className="border-b border-white/5 hover:bg-surface/50">
                        <td className="px-3 py-3 text-white sm:px-4">#{w.id}</td>
                        <td className="px-3 py-3 font-mono text-xs text-white sm:px-4">
                          {formatPaymentAmount(w.currency, w.amount)}
                        </td>
                        <td className="hidden px-3 py-3 text-muted sm:table-cell sm:px-4">{tPaymentMethod(w.payment_method)}</td>
                        <td className="px-3 py-3 sm:px-4"><StatusBadge status={w.status} /></td>
                        <td className="hidden px-3 py-3 text-xs text-muted md:table-cell sm:px-4">
                          {formatDate(w.created_at)}
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
