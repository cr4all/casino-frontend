import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { paymentApi, type PaymentMethod, type WithdrawalItem } from '@/api/payment.api';
import { useAuthStore } from '@/stores/authStore';
import { DEFAULT_CURRENCY, useWalletStore } from '@/stores/walletStore';
import { formatBalance } from '@/utils/formatBalance';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useTranslation } from '@/hooks/useTranslation';
import { getApiErrorMessage } from '@/utils/apiError';

function formatPaymentAmount(currency: string, amount: string): string {
  return `${currency} ${formatBalance(amount)}`;
}

export function WithdrawPage() {
  const { t, tPaymentMethod, tPaymentType, formatDate } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const balance = useWalletStore((s) => s.balance);
  const fetchBalance = useWalletStore((s) => s.fetchBalance);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [methodId, setMethodId] = useState<number | ''>('');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadWithdrawals = () =>
    paymentApi.getWithdrawals().then((data) => setWithdrawals(data.items));

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([paymentApi.getMethods(), fetchBalance(), loadWithdrawals()])
      .then(([data]) => {
        setMethods(data);
        if (data.length > 0) setMethodId(data[0].id);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, fetchBalance]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const selected = methods.find((m) => m.id === methodId);
  const isCrypto = selected?.type === 'crypto';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!methodId || !amount) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const destination: Record<string, string> = isCrypto
        ? { address, ...(network ? { network } : {}) }
        : { account: address || 'default', type: 'bank' };

      const result = await paymentApi.createWithdrawal(methodId, amount, destination);
      setMessage(
        t('withdraw.submitted', { id: result.withdrawal_id, status: result.status }),
      );
      setAmount('');
      setAddress('');
      setNetwork('');
      await fetchBalance();
      await loadWithdrawals();
    } catch (err) {
      setError(getApiErrorMessage(err, t('withdraw.submitFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">{t('withdraw.title')}</h1>
        <Link to="/deposit" className="text-sm text-accent hover:underline">
          {t('withdraw.backToDeposit')}
        </Link>
      </div>

      {loading ? (
        <p className="text-muted">{t('common.loading')}</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
          <div className="space-y-4">
          <p className="text-sm text-muted">
            {t('withdraw.availableBalance')}{' '}
            <span className="font-mono text-accent-gold">
              {balance?.currency ?? DEFAULT_CURRENCY} {formatBalance(balance?.balance)}
            </span>
          </p>

          <form onSubmit={handleSubmit} className="rounded-xl border border-white/[0.08] bg-card p-6 space-y-4">
            <div>
              <label htmlFor="withdraw-method" className="mb-1 block text-xs text-muted">
                {t('deposit.paymentMethod')}
              </label>
              <select
                id="withdraw-method"
                value={methodId}
                onChange={(e) => setMethodId(Number(e.target.value))}
                className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white"
              >
                {methods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {tPaymentMethod(m.name)} ({tPaymentType(m.type)})
                  </option>
                ))}
              </select>
            </div>

            {selected && (
              <p className="text-xs text-muted">
                {t('common.minMax', {
                  min: formatBalance(selected.min_amount),
                  max: selected.max_amount
                    ? formatBalance(selected.max_amount)
                    : t('common.noLimit'),
                })}
              </p>
            )}

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

            <div>
              <label htmlFor="withdraw-destination" className="mb-1 block text-xs text-muted">
                {isCrypto ? t('withdraw.walletAddress') : t('withdraw.destinationAccount')}
              </label>
              <input
                id="withdraw-destination"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white"
                placeholder={
                  isCrypto ? t('withdraw.addressPlaceholderCrypto') : t('withdraw.addressPlaceholderBank')
                }
              />
            </div>

            {isCrypto && (
              <div>
                <label htmlFor="withdraw-network" className="mb-1 block text-xs text-muted">
                  {t('withdraw.networkOptional')}
                </label>
                <input
                  id="withdraw-network"
                  type="text"
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white"
                  placeholder={t('withdraw.networkPlaceholder')}
                />
              </div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && <p className="text-sm text-green-400">{message}</p>}

            <Button type="submit" variant="gold" disabled={submitting || methods.length === 0}>
              {submitting ? t('common.submitting') : t('withdraw.requestWithdrawal')}
            </Button>
          </form>
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
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-surface text-left">
                      <th className="px-4 py-3 text-xs text-muted">{t('deposit.id')}</th>
                      <th className="px-4 py-3 text-xs text-muted">{t('deposit.amount')}</th>
                      <th className="px-4 py-3 text-xs text-muted">{t('transactions.method')}</th>
                      <th className="px-4 py-3 text-xs text-muted">{t('transactions.status')}</th>
                      <th className="px-4 py-3 text-xs text-muted hidden sm:table-cell">{t('transactions.date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.slice(0, 5).map((w) => (
                      <tr key={w.id} className="border-b border-white/5 hover:bg-surface/50">
                        <td className="px-4 py-3 text-white">#{w.id}</td>
                        <td className="px-4 py-3 font-mono text-white">
                          {formatPaymentAmount(w.currency, w.amount)}
                        </td>
                        <td className="px-4 py-3 text-muted">{tPaymentMethod(w.payment_method)}</td>
                        <td className="px-4 py-3"><StatusBadge status={w.status} /></td>
                        <td className="px-4 py-3 text-xs text-muted hidden sm:table-cell">
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
