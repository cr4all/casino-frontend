import { useEffect, useState } from 'react';
import { affiliateApi, type AffiliateBalance, type AffiliatePayout } from '@/api/affiliate.api';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useTranslation } from '@/hooks/useTranslation';
import { formatBalance } from '@/utils/formatBalance';

const methods = ['bank_transfer', 'usdt', 'btc'] as const;

export function AffiliatePaymentsPage() {
  const { t, formatDate } = useTranslation();
  const [balance, setBalance] = useState<AffiliateBalance | null>(null);
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([]);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<string>('bank_transfer');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await affiliateApi.getPayouts();
      setPayouts(data.items);
      setBalance(data.balance);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      await affiliateApi.requestPayout({ amount: parseFloat(amount), method });
      setAmount('');
      setMessage(t('affiliate.payoutSubmitted'));
      await load();
    } catch {
      setMessage(t('affiliate.payoutError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{t('affiliate.nav.payments')}</h1>
        <p className="text-sm text-muted">{t('affiliate.paymentsDesc')}</p>
      </div>

      {balance && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-card p-4">
            <p className="text-xs text-muted">{t('affiliate.currentBalance')}</p>
            <p className="text-xl font-bold text-accent">{formatBalance(balance.current_balance)} {balance.currency}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-card p-4">
            <p className="text-xs text-muted">{t('affiliate.minimumPayout')}</p>
            <p className="text-xl font-bold text-white">{formatBalance(balance.minimum_payout)}</p>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-white/10 bg-card p-4 space-y-3">
        <h2 className="text-sm font-semibold text-white">{t('affiliate.requestPayout')}</h2>
        <div className="flex flex-wrap gap-3">
          <input
            type="number"
            className="rounded border border-white/10 bg-background px-3 py-2 text-sm"
            placeholder={t('affiliate.amount')}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <select
            className="rounded border border-white/10 bg-background px-3 py-2 text-sm"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            {methods.map((m) => (
              <option key={m} value={m}>{t(`affiliate.method.${m}`)}</option>
            ))}
          </select>
          <Button onClick={submit} disabled={submitting || !amount}>{t('affiliate.submitPayout')}</Button>
        </div>
        {message && <p className="text-sm text-muted">{message}</p>}
      </div>

      <div className="rounded-lg border border-white/10 bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-white">{t('affiliate.payoutHistory')}</h2>
        {loading ? (
          <p className="text-sm text-muted">{t('common.loading')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-muted">
                  <th className="pb-2 pr-4">{t('affiliate.amount')}</th>
                  <th className="pb-2 pr-4">{t('affiliate.methodLabel')}</th>
                  <th className="pb-2 pr-4">{t('affiliate.status')}</th>
                  <th className="pb-2">{t('affiliate.date')}</th>
                </tr>
              </thead>
              <tbody>
                {payouts.length === 0 ? (
                  <tr><td colSpan={4} className="py-4 text-muted">{t('affiliate.noPayouts')}</td></tr>
                ) : payouts.map((p) => (
                  <tr key={p.id} className="border-b border-white/5">
                    <td className="py-2 pr-4">{formatBalance(p.amount)} {p.currency}</td>
                    <td className="py-2 pr-4">{p.method.replace(/_/g, ' ').toUpperCase()}</td>
                    <td className="py-2 pr-4"><StatusBadge status={p.status} /></td>
                    <td className="py-2">{p.created_at ? formatDate(p.created_at) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
