import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
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
import { formatCryptoCurrencyLabel } from '@/utils/cryptoIcon';
import { formatBalance } from '@/utils/formatBalance';
import { formatDepositCurrencyAmount, formatDepositReceivedAmount } from '@/utils/formatDepositDisplay';

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

export function DepositPage() {
  const { t, tPaymentMethod, tPaymentType, formatDate } = useTranslation();
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
  const [localCountry, setLocalCountry] = useState('');

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
  const selectedLocalCountry = selected?.supported_countries?.find((c) => c.code === localCountry);
  const paymentCurrency = isLocalGateway
    ? (selectedLocalCountry?.currency ?? '')
    : (selected?.payment_currency ?? selected?.wallet_currency ?? '');
  const effectiveMinAmount = isLocalGateway && selectedLocalCountry
    ? selectedLocalCountry.min_amount
    : selected?.min_amount;
  const localCountryRequired = isLocalGateway && !localCountry;

  useEffect(() => {
    if (!isLocalGateway || !selected) {
      setLocalCountry('');
      return;
    }

    setLocalCountry(selected.default_country ?? '');
  }, [isLocalGateway, selected?.id, selected?.default_country]);

  useEffect(() => {
    if (!isCrypto) {
      setCryptoCurrencies([]);
      setPayCurrency('');
      return;
    }

    setCryptoLoading(true);
    paymentApi.getCryptoCurrencies(Number(methodId))
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

    if (isLocalGateway && !localCountry) {
      setQuote(null);
      setQuoteError(false);
      return;
    }

    setQuoteLoading(true);
    setQuoteError(false);

    const timer = setTimeout(() => {
      paymentApi
        .getDepositQuote(Number(methodId), amount, isLocalGateway ? localCountry : undefined)
        .then(setQuote)
        .catch(() => {
          setQuote(null);
          setQuoteError(true);
        })
        .finally(() => setQuoteLoading(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [methodId, amount, isLocalGateway, localCountry]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!methodId || !amount) return;
    if (isCrypto && !payCurrency) return;
    if (localCountryRequired) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    setLastDeposit(null);
    try {
      const result = await paymentApi.createDeposit(
        methodId,
        amount,
        {
          payCurrency: isCrypto ? payCurrency : undefined,
          localCountry: isLocalGateway ? localCountry : undefined,
        },
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
  const qrString = typeof paymentInfo.qr_string === 'string' ? paymentInfo.qr_string : null;
  const isRedirectPayment = Boolean(paymentUrl);
  const payCurrencyCode = String(paymentInfo.pay_currency ?? paymentInfo.currency ?? '');
  const payAmountRaw = paymentInfo.pay_amount != null && paymentInfo.pay_amount !== ''
    ? String(paymentInfo.pay_amount)
    : '';
  const hasCryptoPayAmount = payAmountRaw !== '' && Number(payAmountRaw) > 0;
  const showFiatCryptoEstimate = !hasCryptoPayAmount
    && payCurrencyCode !== ''
    && lastDeposit?.amount != null
    && lastDeposit.amount !== '';

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
                    {tPaymentMethod(m.name)} ({tPaymentType(m.type)})
                  </option>
                ))}
              </select>
            </div>

            {isLocalGateway && selected?.supported_countries && (
              <div>
                <label htmlFor="deposit-local-country" className="mb-1 block text-xs text-muted">
                  {t('deposit.localCountryLabel')}
                </label>
                <select
                  id="deposit-local-country"
                  value={localCountry}
                  onChange={(e) => setLocalCountry(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-white"
                >
                  <option value="">{t('deposit.selectLocalCountry')}</option>
                  {selected.supported_countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {t('deposit.localCountryOption', {
                        name: country.name,
                        currency: country.currency,
                      })}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-4">
              {isCrypto && (
                <CryptoCurrencyPicker
                  currencies={cryptoCurrencies}
                  value={payCurrency}
                  onChange={setPayCurrency}
                  loading={cryptoLoading}
                  loadingLabel={t('common.loadingCurrencies')}
                />
              )}

              {selected && (
                <p className="text-xs text-muted">
                    {t('common.minMax', {
                      min: formatBalance(effectiveMinAmount ?? selected.min_amount),
                      max: selected.max_amount
                        ? formatBalance(selected.max_amount)
                        : t('common.noLimit'),
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

            {amount && Number(amount) > 0 && (
              <div className="rounded-lg border border-white/10 bg-background/50 p-3 text-sm">
                {quoteLoading && (
                  <p className="text-muted">{t('deposit.loadingQuote')}</p>
                )}
                {!quoteLoading && quote && (
                  <>
                    <p className="font-medium text-accent-gold">
                      {t('deposit.estimatedBalance', {
                        amount: formatBalance(quote.credited_amount),
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

            {localCountryRequired && (
              <p className="text-sm text-amber-400">{t('deposit.selectLocalCountry')}</p>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && <p className="text-sm text-green-400">{message}</p>}

            <Button
              type="submit"
              variant="gold"
              disabled={submitting || methods.length === 0 || localCountryRequired}
            >
              {submitting ? t('common.submitting') : t('deposit.requestDeposit')}
            </Button>
          </form>

          {lastDeposit?.payment_info && Object.keys(lastDeposit.payment_info).length > 0 && (
            <div className="mt-4 rounded-lg border border-accent-gold/30 bg-accent-gold/5 p-4">
              <h3 className="mb-2 text-sm font-semibold text-accent-gold">{t('deposit.paymentInstructions')}</h3>

              {lastDeposit.estimated_credit && (
                <p className="mb-3 text-sm text-white">
                  {t('deposit.estimatedBalance', {
                    amount: formatBalance(lastDeposit.estimated_credit.credited_amount),
                    currency: lastDeposit.estimated_credit.wallet_currency,
                  })}
                  <span className="block text-xs text-muted mt-1">{t('deposit.estimateDisclaimer')}</span>
                </p>
              )}

              {(hasCryptoPayAmount || showFiatCryptoEstimate) && (
                <div className="mb-3 text-sm text-white">
                  {hasCryptoPayAmount ? (
                    <p>
                      {t('deposit.sendToAddress', {
                        amount: formatBalance(payAmountRaw),
                        currency: payCurrencyCode.toUpperCase(),
                      })}
                    </p>
                  ) : (
                    <>
                      <p>
                        {t('deposit.sendToAddressFiatEstimate', {
                          fiatAmount: formatBalance(lastDeposit.amount),
                          fiatCurrency: String(lastDeposit.currency ?? '').toUpperCase(),
                          crypto: formatCryptoCurrencyLabel(payCurrencyCode),
                        })}
                      </p>
                      <p className="mt-1 text-xs text-muted">{t('deposit.sendToAddressFiatDisclaimer')}</p>
                    </>
                  )}
                </div>
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

              {qrString && (
                <div className="mb-3 flex flex-col items-center gap-2">
                  <div className="rounded-lg bg-white p-3">
                    <QRCode value={qrString} size={200} />
                  </div>
                  <CopyButton value={qrString} />
                </div>
              )}

              <dl className="space-y-2">
                {Object.entries(lastDeposit.payment_info).map(([key, value]) => {
                  if (key === 'payment_url' || key === 'qr_string') return null;
                  const display = typeof value === 'object' ? JSON.stringify(value) : String(value);
                  const isAddress = key === 'address' || key === 'pay_address';

                  return (
                    <div key={key}>
                      <dt className="text-xs capitalize text-muted">{key.replace(/_/g, ' ')}</dt>
                      <dd className="text-sm text-white break-all">
                        {display}
                        {isAddress && display && <CopyButton value={display} />}
                      </dd>
                    </div>
                  );
                })}
              </dl>
              <p className="mt-3 text-xs text-muted">
                {isCryptoPayment
                  ? t('deposit.cryptoConfirmHint')
                  : isRedirectPayment || qrString || isLocalGateway
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
                      <th className="px-4 py-3 text-xs text-muted">{t('transactions.requestedAmount')}</th>
                      <th className="px-4 py-3 text-xs text-muted">{t('transactions.receivedAmount')}</th>
                      <th className="px-4 py-3 text-xs text-muted">{t('deposit.method')}</th>
                      <th className="px-4 py-3 text-xs text-muted">{t('transactions.status')}</th>
                      <th className="px-4 py-3 text-xs text-muted hidden sm:table-cell">{t('deposit.date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.slice(0, 5).map((d) => (
                      <tr key={d.id} className="border-b border-white/5 hover:bg-surface/50">
                        <td className="px-4 py-3 text-white">#{d.id}</td>
                        <td className="px-4 py-3 font-mono text-white text-xs">
                          {formatDepositCurrencyAmount(d.currency, d.amount)}
                        </td>
                        <td className="px-4 py-3 font-mono text-white text-xs">
                          {formatDepositReceivedAmount(d) ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-muted">{tPaymentMethod(d.payment_method)}</td>
                        <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                        <td className="px-4 py-3 text-xs text-muted hidden sm:table-cell">
                          {formatDate(d.created_at)}
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
