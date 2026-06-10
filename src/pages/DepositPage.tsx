import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import {
  paymentApi,
  type CryptoCurrency,
  type DepositItem,
  type DepositQuote,
  type DepositRequest,
  type PaymentMethod,
} from '@/api/payment.api';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/stores/walletStore';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CryptoAmountInput } from '@/components/deposit/CryptoAmountInput';
import { CryptoCurrencyPicker } from '@/components/deposit/CryptoCurrencyPicker';
import { getApiErrorMessage } from '@/utils/apiError';

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-2 rounded px-2 py-0.5 text-xs text-accent hover:bg-accent/10"
    >
      {copied ? t('common.copied') : t('common.copy')}
    </button>
  );
}

function formatDepositAmount(d: DepositItem): string {
  if (d.credited_amount && d.credited_currency && d.status === 'completed') {
    if (d.currency !== d.credited_currency) {
      return `${d.currency} ${d.amount} → ${d.credited_currency} ${d.credited_amount}`;
    }
    return `${d.credited_currency} ${d.credited_amount}`;
  }

  return `${d.currency} ${d.amount}`;
}

export function DepositPage() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchBalance = useWalletStore((s) => s.fetchBalance);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [cryptoCurrencies, setCryptoCurrencies] = useState<CryptoCurrency[]>([]);
  const [cryptoLoading, setCryptoLoading] = useState(false);
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [methodId, setMethodId] = useState<number | ''>('');
  const [payCurrency, setPayCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<DepositQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState(false);
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

  const selected = methods.find((m) => m.id === methodId);
  const isCrypto = selected?.type === 'crypto';
  const isLocalGateway = selected?.type === 'local';
  const paymentCurrency = selected?.payment_currency ?? selected?.wallet_currency ?? '';

  useEffect(() => {
    if (!isCrypto) {
      setCryptoCurrencies([]);
      setPayCurrency('');
      return;
    }

    setCryptoLoading(true);
    paymentApi.getCryptoCurrencies()
      .then((items) => {
        setCryptoCurrencies(items);
        if (items.length > 0) setPayCurrency(items[0].code);
      })
      .catch(() => setCryptoCurrencies([]))
      .finally(() => setCryptoLoading(false));
  }, [isCrypto, methodId]);

  useEffect(() => {
    if (!methodId || !amount || Number(amount) <= 0) {
      setQuote(null);
      setQuoteError(false);
      return;
    }

    setQuoteLoading(true);
    setQuoteError(false);

    const timer = setTimeout(() => {
      paymentApi
        .getDepositQuote(Number(methodId), amount)
        .then(setQuote)
        .catch(() => {
          setQuote(null);
          setQuoteError(true);
        })
        .finally(() => setQuoteLoading(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [methodId, amount]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!methodId || !amount) return;
    if (isCrypto && !payCurrency) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    setLastDeposit(null);
    try {
      const result = await paymentApi.createDeposit(
        methodId,
        amount,
        isCrypto ? payCurrency : undefined,
      );
      setLastDeposit(result);
      setMessage(t('deposit.submitted', { id: result.deposit_id, status: result.status }));
      setAmount('');
      setQuote(null);
      await fetchBalance();
      await loadDeposits();
    } catch (err) {
      setError(getApiErrorMessage(err, t('deposit.submitFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  const paymentInfo = lastDeposit?.payment_info ?? {};
  const isCryptoPayment = isCrypto || Boolean(paymentInfo.pay_address || paymentInfo.address);
  const paymentUrl = typeof paymentInfo.payment_url === 'string' ? paymentInfo.payment_url : null;
  const isRedirectPayment = isLocalGateway || Boolean(paymentUrl);

  return (
    <div className="mx-auto max-w-7xl py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">{t('deposit.title')}</h1>
        <div className="flex gap-3 text-sm">
          <Link to="/bonus" className="text-accent-purple hover:underline">{t('deposit.bonusesLink')}</Link>
          <Link to="/withdraw" className="text-accent hover:underline">{t('deposit.withdrawLink')}</Link>
        </div>
      </div>

      {loading ? (
        <p className="text-muted">{t('common.loadingPaymentMethods')}</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
          <div className="space-y-4">
          <form onSubmit={handleSubmit} className="rounded-xl border border-white/[0.08] bg-card p-6 space-y-4">
            <div>
              <label htmlFor="deposit-method" className="mb-1 block text-xs text-muted">{t('deposit.paymentMethod')}</label>
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

            {isCrypto ? (
              <div className="space-y-4">
                <div>
                  <CryptoCurrencyPicker
                    currencies={cryptoCurrencies}
                    value={payCurrency}
                    onChange={setPayCurrency}
                    loading={cryptoLoading}
                    loadingLabel={t('common.loadingCurrencies')}
                  />
                </div>

                {selected && (
                  <p className="text-xs text-muted">
                    {t('common.minMax', {
                      min: selected.min_amount,
                      max: selected.max_amount ?? t('common.noLimit'),
                    })}
                    {paymentCurrency && ` · ${t('deposit.paymentCurrency', { currency: paymentCurrency })}`}
                  </p>
                )}

                <CryptoAmountInput
                  value={amount}
                  onChange={setAmount}
                  currencyLabel={paymentCurrency}
                  amountLabel={t('deposit.amount')}
                  clearLabel={t('common.close')}
                />
              </div>
            ) : (
              <>
                {selected && (
                  <p className="text-xs text-muted">
                    {t('common.minMax', {
                      min: selected.min_amount,
                      max: selected.max_amount ?? t('common.noLimit'),
                    })}
                    {paymentCurrency && ` · ${t('deposit.paymentCurrency', { currency: paymentCurrency })}`}
                  </p>
                )}

                <div>
                  <label htmlFor="deposit-amount" className="mb-1 block text-xs text-muted">
                    {t('deposit.amount')}
                    {paymentCurrency ? ` (${paymentCurrency})` : ''}
                  </label>
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
              </>
            )}

            {amount && Number(amount) > 0 && (
              <div className="rounded-lg border border-white/10 bg-background/50 p-3 text-sm">
                {quoteLoading && (
                  <p className="text-muted">{t('deposit.loadingQuote')}</p>
                )}
                {!quoteLoading && quote && (
                  <>
                    <p className="font-medium text-accent-gold">
                      {t('deposit.estimatedBalance', {
                        amount: quote.credited_amount,
                        currency: quote.wallet_currency,
                      })}
                    </p>
                    {quote.rate_display && (
                      <p className="mt-1 text-xs text-muted">
                        {t('deposit.exchangeRate', { rate: quote.rate_display })}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted">{t('deposit.estimateDisclaimer')}</p>
                  </>
                )}
                {!quoteLoading && quoteError && (
                  <p className="text-xs text-red-400">{t('deposit.quoteFailed')}</p>
                )}
              </div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && <p className="text-sm text-green-400">{message}</p>}

            <Button type="submit" variant="gold" disabled={submitting || methods.length === 0}>
              {submitting ? t('common.submitting') : t('deposit.requestDeposit')}
            </Button>
          </form>

          {lastDeposit?.payment_info && Object.keys(lastDeposit.payment_info).length > 0 && (
            <div className="mt-4 rounded-lg border border-accent-gold/30 bg-accent-gold/5 p-4">
              <h3 className="mb-2 text-sm font-semibold text-accent-gold">{t('deposit.paymentInstructions')}</h3>

              {lastDeposit.estimated_credit && (
                <p className="mb-3 text-sm text-white">
                  {t('deposit.estimatedBalance', {
                    amount: lastDeposit.estimated_credit.credited_amount,
                    currency: lastDeposit.estimated_credit.wallet_currency,
                  })}
                  <span className="block text-xs text-muted mt-1">{t('deposit.estimateDisclaimer')}</span>
                </p>
              )}

              {(Boolean(paymentInfo.pay_amount) || Boolean(paymentInfo.pay_currency)) && (
                <p className="mb-3 text-sm text-white">
                  {t('deposit.sendToAddress', {
                    amount: String(paymentInfo.pay_amount ?? paymentInfo.amount ?? ''),
                    currency: String(paymentInfo.pay_currency ?? paymentInfo.currency ?? '').toUpperCase(),
                  })}
                </p>
              )}

              {paymentUrl && (
                <div className="mb-3">
                  <a
                    href={paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-md bg-accent-gold px-4 py-2 text-sm font-semibold text-background hover:bg-accent-gold/90"
                  >
                    {t('deposit.openPaymentPage')}
                  </a>
                </div>
              )}

              <dl className="space-y-2">
                {Object.entries(lastDeposit.payment_info).map(([key, value]) => {
                  if (key === 'payment_url') return null;
                  const display = typeof value === 'object' ? JSON.stringify(value) : String(value);
                  const isAddress = key === 'address' || key === 'pay_address';
                  const isQr = key === 'qr_string';

                  return (
                    <div key={key}>
                      <dt className="text-xs capitalize text-muted">{key.replace(/_/g, ' ')}</dt>
                      <dd className="text-sm text-white break-all">
                        {display}
                        {(isAddress || isQr) && display && <CopyButton value={display} />}
                      </dd>
                    </div>
                  );
                })}
              </dl>
              <p className="mt-3 text-xs text-muted">
                {isCryptoPayment
                  ? t('deposit.cryptoConfirmHint')
                  : isRedirectPayment
                    ? t('deposit.redirectConfirmHint')
                    : t('deposit.adminConfirmHint')}
              </p>
            </div>
          )}
          </div>

          <section className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">{t('deposit.recentDeposits')}</h2>
              {deposits.length > 0 && (
                <Link to="/transactions?tab=deposits" className="text-xs text-accent hover:underline">
                  {t('common.viewAll')}
                </Link>
              )}
            </div>
            {deposits.length === 0 ? (
              <p className="text-sm text-muted">{t('deposit.noDeposits')}</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-surface text-left">
                      <th className="px-4 py-3 text-xs text-muted">{t('deposit.id')}</th>
                      <th className="px-4 py-3 text-xs text-muted">{t('deposit.amount')}</th>
                      <th className="px-4 py-3 text-xs text-muted">{t('deposit.method')}</th>
                      <th className="px-4 py-3 text-xs text-muted">Status</th>
                      <th className="px-4 py-3 text-xs text-muted hidden sm:table-cell">{t('deposit.date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.slice(0, 5).map((d) => (
                      <tr key={d.id} className="border-b border-white/5 hover:bg-surface/50">
                        <td className="px-4 py-3 text-white">#{d.id}</td>
                        <td className="px-4 py-3 font-mono text-white text-xs">
                          {formatDepositAmount(d)}
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
        </div>
      )}
    </div>
  );
}
