import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { paymentApi, type DepositItem, type DepositRequest, type PaymentMethod } from '@/api/payment.api';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/stores/walletStore';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { getApiErrorMessage } from '@/utils/apiError';

export function DepositPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchBalance = useWalletStore((s) => s.fetchBalance);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [methodId, setMethodId] = useState<number | ''>('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastDeposit, setLastDeposit] = useState<DepositRequest | null>(null);

  const loadDeposits = () =>
    paymentApi.getDeposits().then((data) => setDeposits(data.items));

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([paymentApi.getMethods(), loadDeposits()])
      .then(([data]) => {
        setMethods(data);
        if (data.length > 0) setMethodId(data[0].id);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const selected = methods.find((m) => m.id === methodId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!methodId || !amount) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    setLastDeposit(null);
    try {
      const result = await paymentApi.createDeposit(methodId, amount);
      setLastDeposit(result);
      setMessage(`Deposit request #${result.deposit_id} submitted. Status: ${result.status}`);
      setAmount('');
      await fetchBalance();
      await loadDeposits();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to submit deposit.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Deposit</h1>
        <div className="flex gap-3 text-sm">
          <Link to="/bonus" className="text-accent-purple hover:underline">Bonuses</Link>
          <Link to="/withdraw" className="text-accent hover:underline">Withdraw →</Link>
        </div>
      </div>

      {loading ? (
        <p className="text-muted">Loading payment methods...</p>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="rounded-xl border border-white/[0.08] bg-card p-6 space-y-4">
            <div>
              <label htmlFor="deposit-method" className="mb-1 block text-xs text-muted">Payment Method</label>
              <select
                id="deposit-method"
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
              <label htmlFor="deposit-amount" className="mb-1 block text-xs text-muted">Amount</label>
              <input
                id="deposit-amount"
                type="number"
                step="0.0001"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white"
                placeholder="100.0000"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && <p className="text-sm text-green-400">{message}</p>}

            <Button type="submit" variant="gold" disabled={submitting || methods.length === 0}>
              {submitting ? 'Submitting...' : 'Request Deposit'}
            </Button>
          </form>

          {lastDeposit?.payment_info && Object.keys(lastDeposit.payment_info).length > 0 && (
            <div className="mt-4 rounded-lg border border-accent-gold/30 bg-accent-gold/5 p-4">
              <h3 className="mb-2 text-sm font-semibold text-accent-gold">Payment Instructions</h3>
              <dl className="space-y-2">
                {Object.entries(lastDeposit.payment_info).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs capitalize text-muted">{key.replace(/_/g, ' ')}</dt>
                    <dd className="text-sm text-white break-all">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs text-muted">
                After transfer, admin will confirm your deposit and credit your wallet.
              </p>
            </div>
          )}

          <section className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-white">Deposit History</h2>
            {deposits.length === 0 ? (
              <p className="text-sm text-muted">No deposit requests yet.</p>
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
                    {deposits.map((d) => (
                      <tr key={d.id} className="border-b border-white/5 hover:bg-surface/50">
                        <td className="px-4 py-3 text-white">#{d.id}</td>
                        <td className="px-4 py-3 font-mono text-white">
                          {d.currency} {d.amount}
                        </td>
                        <td className="px-4 py-3 text-muted">{d.payment_method ?? '—'}</td>
                        <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                        <td className="px-4 py-3 text-xs text-muted hidden sm:table-cell">
                          {d.created_at ? new Date(d.created_at).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
