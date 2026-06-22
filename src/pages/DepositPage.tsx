import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { useTranslation } from '@/hooks/useTranslation';
import {
  paymentApi,
  type DepositItem,
  type DepositQuote,
  type DepositRequest,
  type PaymentCountry,
  type PaymentOption,
} from '@/api/payment.api';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/stores/walletStore';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CryptoAmountInput } from '@/components/deposit/CryptoAmountInput';
import { PaymentCountrySelect } from '@/components/payment/PaymentCountrySelect';
import { PaymentOptionGrid, PaymentOptionMinMax, PaymentOptionSummary } from '@/components/payment/PaymentOptionGrid';
import { getApiErrorMessage, isRiskChallengeError } from '@/utils/apiError';
import { RiskChallengePanel } from '@/components/risk/RiskChallengePanel';
import { useRiskChallenge } from '@/hooks/useRiskChallenge';
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
  const { t, tPaymentMethod, formatDate } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchBalance = useWalletStore((s) => s.fetchBalance);
  const [countries, setCountries] = useState<PaymentCountry[]>([]);
  const [country, setCountry] = useState('');
  const [options, setOptions] = useState<PaymentOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmedOption, setConfirmedOption] = useState<PaymentOption | null>(null);
  const [optionKey, setOptionKey] = useState('');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<DepositQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const [lastDeposit, setLastDeposit] = useState<DepositRequest | null>(null);
  const {
    challengeRequired,
    setChallengeRequired,
    resetChallenge,
    registerWidgetReset,
    resetWidget,
  } = useRiskChallenge();

  const loadDeposits = () =>
    paymentApi.getDeposits().then((data) => setDeposits(data.items));

  const resetToStep1 = () => {
    setStep(1);
    setConfirmedOption(null);
    setOptionKey('');
    setAmount('');
    setQuote(null);
    setQuoteError(false);
    setError(null);
    setChallengeError(null);
    resetChallenge();
  };

  const handleCountryChange = (code: string) => {
    setCountry(code);
    resetToStep1();
    setMessage(null);
    setLastDeposit(null);
  };

  const handleOptionSelect = (option: PaymentOption) => {
    setConfirmedOption(option);
    setOptionKey(option.key);
    setAmount('');
    setQuote(null);
    setQuoteError(false);
    setError(null);
    setMessage(null);
    setStep(2);
  };

  const handleBackToMethods = () => {
    setStep(1);
    setAmount('');
    setQuote(null);
    setQuoteError(false);
    setError(null);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([paymentApi.getCountries(), loadDeposits()])
      .then(([data]) => {
        setCountries(data.countries);
        const initial = data.default_country ?? data.countries[0]?.code ?? '';
        setCountry(initial);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!country) {
      setOptions([]);
      return;
    }

    setOptionsLoading(true);
    paymentApi.getDepositOptions(country)
      .then((data) => setOptions(data.items))
      .catch(() => setOptions([]))
      .finally(() => setOptionsLoading(false));
  }, [country]);

  useEffect(() => {
    if (step !== 2 || !optionKey || !amount || Number(amount) <= 0 || !country) {
      setQuote(null);
      setQuoteError(false);
      return;
    }

    setQuoteLoading(true);
    setQuoteError(false);

    const timer = setTimeout(() => {
      paymentApi
        .getDepositQuote(optionKey, amount, country)
        .then(setQuote)
        .catch(() => {
          setQuote(null);
          setQuoteError(true);
        })
        .finally(() => setQuoteLoading(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [step, optionKey, amount, country]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const performDeposit = async (turnstileToken?: string) => {
    if (!optionKey || !amount || !country) return;
    const result = await paymentApi.createDeposit(optionKey, amount, country, turnstileToken);
    setLastDeposit(result);
    setMessage(t('deposit.submitted', { id: result.deposit_id, status: result.status }));
    setAmount('');
    setQuote(null);
    resetChallenge();
    await fetchBalance();
    await loadDeposits();
  };

  const handleTurnstileSuccess = async (token: string) => {
    setChallengeError(null);
    setSubmitting(true);
    try {
      await performDeposit(token);
    } catch (err) {
      if (isRiskChallengeError(err)) {
        resetWidget();
        setChallengeError(t('risk.challengeFailed'));
        return;
      }
      resetChallenge();
      setError(getApiErrorMessage(err, t('deposit.submitFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!optionKey || !amount || !country) return;
    setSubmitting(true);
    setError(null);
    setChallengeError(null);
    setMessage(null);
    setLastDeposit(null);
    try {
      await performDeposit();
    } catch (err) {
      if (isRiskChallengeError(err)) {
        setChallengeRequired(true);
        setError(null);
        return;
      }
      setError(getApiErrorMessage(err, t('deposit.submitFailed')));
    } finally {
      setSubmitting(false);
    }
  };

  const paymentInfo = lastDeposit?.payment_info ?? {};
  const isCryptoPayment = confirmedOption?.kind === 'crypto' || Boolean(paymentInfo.pay_address || paymentInfo.address);
  const paymentUrl = typeof paymentInfo.payment_url === 'string' ? paymentInfo.payment_url : null;
  const qrString = typeof paymentInfo.qr_string === 'string' ? paymentInfo.qr_string : null;
  const isRedirectPayment = Boolean(paymentUrl);
  const payCurrencyCode = String(paymentInfo.pay_currency ?? paymentInfo.currency ?? confirmedOption?.pay_currency ?? '');
  const payAmountRaw = paymentInfo.pay_amount != null && paymentInfo.pay_amount !== ''
    ? String(paymentInfo.pay_amount)
    : '';
  const hasCryptoPayAmount = payAmountRaw !== '' && Number(payAmountRaw) > 0;
  const showFiatCryptoEstimate = !hasCryptoPayAmount
    && payCurrencyCode !== ''
    && lastDeposit?.amount != null
    && lastDeposit.amount !== '';

  return (
    <div className="mx-auto max-w-7xl py-4 sm:py-8">
      {loading ? (
        <div className="mx-auto w-full max-w-2xl space-y-6">
          <h1 className="text-center text-2xl font-bold text-white">{t('deposit.title')}</h1>
          <p className="text-center text-muted">{t('common.loadingPaymentMethods')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="mx-auto w-full max-w-2xl min-w-0 space-y-6">
          <h1 className="text-center text-2xl font-bold text-white">{t('deposit.title')}</h1>
          <div className="space-y-4">
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

              <CryptoAmountInput
                value={amount}
                onChange={setAmount}
                currencyLabel={confirmedOption?.payment_currency ?? ''}
                amountLabel={t('deposit.amount')}
                clearLabel={t('common.close')}
              />

              {confirmedOption && (
                <PaymentOptionMinMax option={confirmedOption} />
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

              {error && <p className="text-sm text-red-400">{error}</p>}
              {challengeRequired && (
                <RiskChallengePanel
                  onSuccess={handleTurnstileSuccess}
                  onError={() => setChallengeError(t('risk.challengeFailed'))}
                  onRegisterReset={registerWidgetReset}
                  error={challengeError ?? undefined}
                />
              )}
              {message && <p className="text-sm text-green-400">{message}</p>}

              <Button
                type="submit"
                variant="gold"
                disabled={submitting || challengeRequired || !confirmedOption || !amount}
              >
                {submitting ? t('common.submitting') : t('deposit.requestDeposit')}
              </Button>
            </form>
          )}

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
                  <div className="w-full max-w-[200px] rounded-lg bg-white p-3">
                    <QRCode value={qrString} size={256} className="h-auto w-full" />
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
                  : isRedirectPayment || qrString || confirmedOption?.kind === 'local'
                    ? t('deposit.redirectConfirmHint')
                    : t('deposit.adminConfirmHint')}
              </p>
            </div>
          )}
          </div>
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
                <table className="w-full min-w-[36rem] text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-surface text-left">
                      <th className="px-3 py-3 text-xs text-muted sm:px-4">{t('deposit.id')}</th>
                      <th className="px-3 py-3 text-xs text-muted sm:px-4">{t('transactions.requestedAmount')}</th>
                      <th className="hidden px-3 py-3 text-xs text-muted sm:table-cell sm:px-4">{t('transactions.receivedAmount')}</th>
                      <th className="hidden px-3 py-3 text-xs text-muted sm:table-cell sm:px-4">{t('deposit.method')}</th>
                      <th className="px-3 py-3 text-xs text-muted sm:px-4">{t('transactions.status')}</th>
                      <th className="hidden px-3 py-3 text-xs text-muted md:table-cell sm:px-4">{t('deposit.date')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.slice(0, 5).map((d) => (
                      <tr key={d.id} className="border-b border-white/5 hover:bg-surface/50">
                        <td className="px-3 py-3 text-white sm:px-4">#{d.id}</td>
                        <td className="px-3 py-3 font-mono text-xs text-white sm:px-4">
                          {formatDepositCurrencyAmount(d.currency, d.amount)}
                        </td>
                        <td className="hidden px-3 py-3 font-mono text-xs text-white sm:table-cell sm:px-4">
                          {formatDepositReceivedAmount(d) ?? '—'}
                        </td>
                        <td className="hidden px-3 py-3 text-muted sm:table-cell sm:px-4">{tPaymentMethod(d.payment_method)}</td>
                        <td className="px-3 py-3 sm:px-4"><StatusBadge status={d.status} /></td>
                        <td className="hidden px-3 py-3 text-xs text-muted md:table-cell sm:px-4">
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
