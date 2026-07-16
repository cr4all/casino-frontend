import { useEffect, useMemo, useState } from 'react';
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
import { DepositStepIndicator } from '@/components/deposit/DepositStepIndicator';
import { PaymentKindGrid } from '@/components/deposit/PaymentKindGrid';
import { PaymentCountrySelect } from '@/components/payment/PaymentCountrySelect';
import { PaymentOptionGrid, PaymentOptionMinMax, PaymentOptionSummary } from '@/components/payment/PaymentOptionGrid';
import { getApiErrorMessage, isRiskChallengeError } from '@/utils/apiError';
import { RiskChallengePanel } from '@/components/risk/RiskChallengePanel';
import { useRiskChallenge } from '@/hooks/useRiskChallenge';
import { formatCryptoCurrencyLabel } from '@/utils/cryptoIcon';
import {
  filterCryptoOptions,
  groupOptionsByKind,
  sortCryptoOptionsPopularFirst,
  type PaymentKind,
} from '@/utils/depositOptions';
import { formatBalance } from '@/utils/formatBalance';
import { formatDepositCurrencyAmount, formatDepositReceivedAmount } from '@/utils/formatDepositDisplay';
import {
  collectFieldErrors,
  hasFieldErrors,
  omitFieldError,
  requiredValue,
  type FieldErrors,
} from '@/utils/formValidation';

type DepositStep = 1 | 2 | 3;

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
  const { t, tPaymentMethod, tPaymentInfoField, tStatus, formatDate } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchBalance = useWalletStore((s) => s.fetchBalance);
  const [countries, setCountries] = useState<PaymentCountry[]>([]);
  const [defaultCountry, setDefaultCountry] = useState('');
  const [country, setCountry] = useState('');
  const [options, setOptions] = useState<PaymentOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [step, setStep] = useState<DepositStep>(1);
  const [selectedKind, setSelectedKind] = useState<PaymentKind | null>(null);
  const [confirmedOption, setConfirmedOption] = useState<PaymentOption | null>(null);
  const [optionKey, setOptionKey] = useState('');
  const [cryptoSearch, setCryptoSearch] = useState('');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<DepositQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [challengeError, setChallengeError] = useState<string | null>(null);
  const [lastDeposit, setLastDeposit] = useState<DepositRequest | null>(null);
  const {
    challengeRequired,
    setChallengeRequired,
    resetChallenge,
    registerWidgetReset,
    resetWidget,
  } = useRiskChallenge();

  const effectiveCountry = selectedKind === 'local' ? country : defaultCountry;

  const optionsCountry = step === 1 || selectedKind !== 'local' ? defaultCountry : country;

  const groupedOptions = useMemo(() => groupOptionsByKind(options), [options]);

  const step2Options = useMemo(() => {
    if (!selectedKind || selectedKind === 'manual') return [];

    const kindOptions = groupedOptions[selectedKind];
    if (selectedKind === 'crypto') {
      const filtered = filterCryptoOptions(kindOptions, cryptoSearch);
      return sortCryptoOptionsPopularFirst(filtered);
    }
    return kindOptions;
  }, [groupedOptions, selectedKind, cryptoSearch]);

  const loadDeposits = () =>
    paymentApi.getDeposits().then((data) => setDeposits(data.items));

  const resetToStep1 = () => {
    setStep(1);
    setSelectedKind(null);
    setConfirmedOption(null);
    setOptionKey('');
    setCryptoSearch('');
    setAmount('');
    setQuote(null);
    setQuoteError(false);
    setError(null);
    setFieldErrors({});
    setChallengeError(null);
    setCountry(defaultCountry);
    resetChallenge();
  };

  const handleKindSelect = (kind: PaymentKind) => {
    setError(null);
    setMessage(null);

    if (kind === 'manual') {
      const manualOption = groupedOptions.manual[0];
      if (!manualOption) return;
      setSelectedKind('manual');
      setConfirmedOption(manualOption);
      setOptionKey(manualOption.key);
      setAmount('');
      setQuote(null);
      setQuoteError(false);
      setStep(3);
      return;
    }

    setSelectedKind(kind);
    setConfirmedOption(null);
    setOptionKey('');
    setCryptoSearch('');
    if (kind === 'local') {
      setCountry(defaultCountry);
    }
    setStep(2);
  };

  const handleLocalCountryChange = (code: string) => {
    setCountry(code);
    setConfirmedOption(null);
    setOptionKey('');
    setError(null);
  };

  const handleOptionSelect = (option: PaymentOption) => {
    setConfirmedOption(option);
    setOptionKey(option.key);
    setAmount('');
    setQuote(null);
    setQuoteError(false);
    setError(null);
    setMessage(null);
    setStep(3);
  };

  const handleBackFromStep2 = () => {
    setStep(1);
    setSelectedKind(null);
    setConfirmedOption(null);
    setOptionKey('');
    setCryptoSearch('');
    setCountry(defaultCountry);
    setError(null);
  };

  const handleBackFromStep3 = () => {
    setAmount('');
    setQuote(null);
    setQuoteError(false);
    setError(null);

    if (selectedKind === 'manual') {
      resetToStep1();
      return;
    }

    setConfirmedOption(null);
    setOptionKey('');
    setStep(2);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([paymentApi.getCountries(), loadDeposits()])
      .then(([data]) => {
        setCountries(data.countries);
        const initial = data.default_country ?? data.countries[0]?.code ?? '';
        setDefaultCountry(initial);
        setCountry(initial);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!optionsCountry) {
      setOptions([]);
      return;
    }

    setOptionsLoading(true);
    paymentApi.getDepositOptions(optionsCountry)
      .then((data) => setOptions(data.items))
      .catch(() => setOptions([]))
      .finally(() => setOptionsLoading(false));
  }, [optionsCountry]);

  useEffect(() => {
    if (step !== 3 || !optionKey || !amount || Number(amount) <= 0 || !effectiveCountry) {
      setQuote(null);
      setQuoteError(false);
      return;
    }

    setQuoteLoading(true);
    setQuoteError(false);

    const timer = setTimeout(() => {
      paymentApi
        .getDepositQuote(optionKey, amount, effectiveCountry)
        .then(setQuote)
        .catch(() => {
          setQuote(null);
          setQuoteError(true);
        })
        .finally(() => setQuoteLoading(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [step, optionKey, amount, effectiveCountry]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const performDeposit = async (turnstileToken?: string) => {
    if (!optionKey || !amount || !effectiveCountry) return;
    const result = await paymentApi.createDeposit(optionKey, amount, effectiveCountry, turnstileToken);
    setLastDeposit(result);
    setMessage(t('deposit.submitted', { id: result.deposit_id, status: tStatus(result.status) }));
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
    setError(null);
    setFieldErrors({});

    const amountError = !requiredValue(amount)
      ? t('common.fieldRequired', { field: t('deposit.amount') })
      : Number(amount) <= 0
        ? t('common.fieldRequired', { field: t('deposit.amount') })
        : undefined;

    const errors = collectFieldErrors([['amount', amountError]]);
    if (hasFieldErrors(errors)) {
      setFieldErrors(errors);
      return;
    }

    if (!optionKey || !effectiveCountry) return;
    setSubmitting(true);
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
  const qrString = typeof paymentInfo.qr_string === 'string' ? paymentInfo.qr_string : null;
  const isRedirectPayment = typeof paymentInfo.payment_url === 'string' && Boolean(paymentInfo.payment_url);
  const payCurrencyCode = String(paymentInfo.pay_currency ?? paymentInfo.currency ?? confirmedOption?.pay_currency ?? '');
  const payAmountRaw = paymentInfo.pay_amount != null && paymentInfo.pay_amount !== ''
    ? String(paymentInfo.pay_amount)
    : '';
  const hasCryptoPayAmount = payAmountRaw !== '' && Number(payAmountRaw) > 0;
  const showFiatCryptoEstimate = !hasCryptoPayAmount
    && payCurrencyCode !== ''
    && lastDeposit?.amount != null
    && lastDeposit.amount !== '';

  const kindCounts: Record<PaymentKind, number> = {
    crypto: groupedOptions.crypto.length,
    local: groupedOptions.local.length,
    manual: groupedOptions.manual.length,
  };

  const step2Title = selectedKind === 'crypto'
    ? t('deposit.selectCrypto')
    : selectedKind === 'local'
      ? t('deposit.selectBank')
      : '';

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
          <div className="rounded-xl border border-white/[0.08] bg-card p-4 space-y-4 sm:p-6">
            <DepositStepIndicator step={step} selectedKind={selectedKind} />

            {step === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-muted">{t('deposit.selectPaymentKind')}</p>
                <PaymentKindGrid
                  counts={kindCounts}
                  onSelect={handleKindSelect}
                  loading={optionsLoading}
                  localEnabled={countries.length > 0}
                />
              </div>
            )}

            {step === 2 && selectedKind && selectedKind !== 'manual' && (
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBackFromStep2}
                  className="w-fit px-3 py-1.5 text-xs"
                >
                  {t('deposit.backToKinds')}
                </Button>

                <p className="text-xs text-muted">{step2Title}</p>

                {selectedKind === 'local' && (
                  <PaymentCountrySelect
                    countries={countries}
                    value={country}
                    onChange={handleLocalCountryChange}
                    label={t('deposit.selectLocalCountry')}
                  />
                )}

                {selectedKind === 'crypto' && (
                  <input
                    type="text"
                    value={cryptoSearch}
                    onChange={(e) => setCryptoSearch(e.target.value)}
                    placeholder={t('deposit.searchCurrency')}
                    className="w-full rounded-lg border border-white/10 bg-background/50 px-3 py-2 text-sm text-white placeholder:text-muted focus:border-accent-gold/50 focus:outline-none"
                  />
                )}

                <PaymentOptionGrid
                  options={step2Options}
                  value={optionKey}
                  onChange={setOptionKey}
                  onSelect={handleOptionSelect}
                  variant="list"
                  loading={optionsLoading}
                  loadingLabel={t('common.loadingPaymentMethods')}
                  emptyLabel={t('deposit.noOptionsForCountry')}
                />
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBackFromStep3}
                  className="w-fit px-3 py-1.5 text-xs"
                >
                  {selectedKind === 'manual' ? t('deposit.backToKinds') : t('deposit.backToOptions')}
                </Button>

                {confirmedOption && <PaymentOptionSummary option={confirmedOption} />}

                <CryptoAmountInput
                  value={amount}
                  onChange={(value) => {
                    setAmount(value);
                    setFieldErrors((prev) => omitFieldError(prev, 'amount'));
                  }}
                  currencyLabel={confirmedOption?.payment_currency ?? ''}
                  amountLabel={t('deposit.amount')}
                  clearLabel={t('common.close')}
                  error={fieldErrors.amount}
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
                  disabled={submitting || challengeRequired || !confirmedOption}
                >
                  {submitting ? t('common.submitting') : t('deposit.requestDeposit')}
                </Button>
              </form>
            )}
          </div>

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
                  const isCopyable = key === 'address'
                    || key === 'pay_address'
                    || key === 'account_number'
                    || key === 'payment_requisite';

                  return (
                    <div key={key}>
                      <dt className="text-xs capitalize text-muted">{tPaymentInfoField(key)}</dt>
                      <dd className="text-sm text-white break-all">
                        {display}
                        {isCopyable && display && <CopyButton value={display} />}
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
                          {formatDepositReceivedAmount(d) ?? t('common.notAvailable')}
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
