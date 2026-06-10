import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { paymentApi, type PaymentMethod, type WithdrawalItem } from '@/api/payment.api';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/stores/walletStore';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { getApiErrorMessage } from '@/utils/apiError';

export function WithdrawPage() {
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
      setMessage(`Withdrawal request #${result.withdrawal_id} submitted (${result.status}). Awaiting admin review.`);
      setAmount('');
      setAddress('');
      setNetwork('');
      await fetchBalance();
      await loadWithdrawals();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to submit withdrawal.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Withdraw</h1>
        <Link to="/deposit" className="text-sm text-accent hover:underline">
          ← Deposit
        </Link>
      </div>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
          <div className="space-y-4">
          <p className="text-sm text-muted">
            Available balance:{' '}
            <span className="font-mono text-accent-gold">
              {balance?.currency ?? 'EUR'} {balance?.balance ?? '0.0000'}
            </span>
          </p>

          <form onSubmit={handleSubmit} className="rounded-xl border border-white/[0.08] bg-card p-6 space-y-4">
            <div>
              <label htmlFor="withdraw-method" className="mb-1 block text-xs text-muted">Payment Method</label>
              <select
                id="withdraw-method"
                value={methodId}
                onChange={(e) => setMethodId(Number(e.target.value))}
                className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white"
              >
                {methods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.type})
                  </option>
                ))}
              </select>
            </div>

            {selected && (
              <p className="text-xs text-muted">
                Min: {selected.min_amount} · Max: {selected.max_amount ?? 'No limit'}
              </p>
            )}

            <div>
              <label htmlFor="withdraw-amount" className="mb-1 block text-xs text-muted">Amount</label>
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
                {isCrypto ? 'Wallet Address' : 'Destination Account'}
              </label>
              <input
                id="withdraw-destination"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white"
                placeholder={isCrypto ? 'TXyz...' : 'Bank account number'}
              />
            </div>

            {isCrypto && (
              <div>
                <label htmlFor="withdraw-network" className="mb-1 block text-xs text-muted">Network (optional)</label>
                <input
                  id="withdraw-network"
                  type="text"
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white"
                  placeholder="TRC20, ERC20..."
                />
              </div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && <p className="text-sm text-green-400">{message}</p>}

            <Button type="submit" variant="gold" disabled={submitting || methods.length === 0}>
              {submitting ? 'Submitting...' : 'Request Withdrawal'}
            </Button>
          </form>
          </div>

          <section className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">Recent Withdrawals</h2>
              {withdrawals.length > 0 && (
                <Link to="/transactions?tab=withdrawals" className="text-xs text-accent hover:underline">
                  View all
                </Link>
              )}
            </div>
            {withdrawals.length === 0 ? (
              <p className="text-sm text-muted">No withdrawal requests yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-surface text-left">
                      <th className="px-4 py-3 text-xs text-muted">ID</th>
                      <th className="px-4 py-3 text-xs text-muted">Amount</th>
                      <th className="px-4 py-3 text-xs text-muted">Method</th>
                      <th className="px-4 py-3 text-xs text-muted">Status</th>
                      <th className="px-4 py-3 text-xs text-muted hidden sm:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.slice(0, 5).map((w) => (
                      <tr key={w.id} className="border-b border-white/5 hover:bg-surface/50">
                        <td className="px-4 py-3 text-white">#{w.id}</td>
                        <td className="px-4 py-3 font-mono text-white">
                          {w.currency} {w.amount}
                        </td>
                        <td className="px-4 py-3 text-muted">{w.payment_method ?? '—'}</td>
                        <td className="px-4 py-3"><StatusBadge status={w.status} /></td>
                        <td className="px-4 py-3 text-xs text-muted hidden sm:table-cell">
                          {w.created_at ? new Date(w.created_at).toLocaleString() : '—'}
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
