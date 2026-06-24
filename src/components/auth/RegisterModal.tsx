import { useState, useEffect, type FormEvent } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useWalletStore } from '@/stores/walletStore';
import { useTranslation } from '@/hooks/useTranslation';
import { authApi, type RegisterOptions } from '@/api/auth.api';
import { PhoneNumberInput } from '@/components/auth/PhoneNumberInput';
import {
  buildFullPhoneNumber,
  formatLocalPhoneNumber,
  isLocalPhoneValid,
  parsePhoneNumber,
} from '@/data/phoneDialCodes';
import { getAuthApiErrorMessage, isRiskChallengeError } from '@/utils/apiError';
import { RiskChallengePanel } from '@/components/risk/RiskChallengePanel';
import { useRiskChallenge } from '@/hooks/useRiskChallenge';
import { clearStoredAffiliateCode, getStoredAffiliateCode } from '@/utils/affiliateReferral';

const selectClassName =
  'w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white focus:border-accent focus:outline-none';

export function RegisterModal() {
  const { t } = useTranslation();
  const activeModal = useUiStore((s) => s.activeModal);
  const closeModal = useUiStore((s) => s.closeModal);
  const openModal = useUiStore((s) => s.openModal);
  const register = useAuthStore((s) => s.register);
  const fetchBalance = useWalletStore((s) => s.fetchBalance);

  const [options, setOptions] = useState<RegisterOptions | null>(null);
  const [form, setForm] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    nickname: '',
    phone: '',
    currency: '',
    affiliate_code: '' as string | undefined,
  });
  const [phoneCountryCode, setPhoneCountryCode] = useState('US');
  const [error, setError] = useState('');
  const [challengeError, setChallengeError] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    challengeRequired,
    setChallengeRequired,
    resetChallenge,
    registerWidgetReset,
    resetWidget,
  } = useRiskChallenge();

  useEffect(() => {
    if (activeModal !== 'register') {
      return;
    }

    let cancelled = false;

    const storedCode = getStoredAffiliateCode();

    authApi
      .getRegisterOptions()
      .then((data) => {
        if (cancelled) {
          return;
        }
        setOptions(data);
        setForm((prev) => ({
          ...prev,
          currency: prev.currency || data.currencies[0]?.code || '',
          affiliate_code: storedCode ?? prev.affiliate_code,
        }));
      })
      .catch(() => {
        if (!cancelled) {
          setError(t('auth.registerError'));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeModal, t]);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handlePhoneCountryChange = (code: string) => {
    setPhoneCountryCode(code);
    setForm((prev) => {
      const { local } = parsePhoneNumber(prev.phone, code);
      const formatted = formatLocalPhoneNumber(code, local);
      return {
        ...prev,
        phone: buildFullPhoneNumber(code, formatted),
      };
    });
  };

  const resetForm = () => {
    setForm({
      email: '',
      password: '',
      password_confirmation: '',
      nickname: '',
      phone: '',
      currency: options?.currencies[0]?.code ?? '',
      affiliate_code: getStoredAffiliateCode() ?? undefined,
    });
    setPhoneCountryCode('US');
    setChallengeError('');
    resetChallenge();
  };

  const buildRegisterPayload = (turnstileToken?: string) => ({
    email: form.email,
    password: form.password,
    password_confirmation: form.password_confirmation,
    nickname: form.nickname,
    phone: form.phone,
    country: phoneCountryCode,
    currency: form.currency,
    ...(form.affiliate_code ? { affiliate_code: form.affiliate_code } : {}),
    ...(turnstileToken ? { turnstileToken } : {}),
  });

  const performRegister = async (turnstileToken?: string) => {
    await register(buildRegisterPayload(turnstileToken));
    clearStoredAffiliateCode();
    await fetchBalance();
    closeModal();
    resetForm();
  };

  const handleTurnstileSuccess = async (token: string) => {
    setChallengeError('');
    setLoading(true);
    try {
      await performRegister(token);
    } catch (err) {
      if (isRiskChallengeError(err)) {
        resetWidget();
        setChallengeError(t('risk.challengeFailed'));
        return;
      }
      resetChallenge();
      setError(getAuthApiErrorMessage(err, t('auth.registerError'), t));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const parsedPhone = parsePhoneNumber(form.phone, phoneCountryCode);
    if (!isLocalPhoneValid(phoneCountryCode, parsedPhone.local)) {
      setError(t('auth.phoneInvalid'));
      return;
    }

    setLoading(true);
    try {
      await performRegister();
    } catch (err) {
      if (isRiskChallengeError(err)) {
        setChallengeRequired(true);
        setError('');
        return;
      }
      setError(getAuthApiErrorMessage(err, t('auth.registerError'), t));
    } finally {
      setLoading(false);
    }
  };

  const optionsLoading = activeModal === 'register' && options === null;

  return (
    <Modal isOpen={activeModal === 'register'} onClose={closeModal} title={t('auth.registerTitle')}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <p className="rounded-md bg-accent/10 px-3 py-2 text-sm text-accent">{error}</p>
        )}
        <div>
          <label htmlFor="reg-email" className="mb-1 block text-xs text-muted">{t('auth.email')}</label>
          <input
            id="reg-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="reg-username" className="mb-1 block text-xs text-muted">{t('auth.username')}</label>
          <input
            id="reg-username"
            type="text"
            required
            maxLength={50}
            value={form.nickname}
            onChange={(e) => update('nickname', e.target.value)}
            className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
          />
        </div>
        <PhoneNumberInput
          id="reg-phone"
          label={t('auth.phone')}
          value={form.phone}
          onChange={(phone) => update('phone', phone)}
          countryCode={phoneCountryCode}
          onCountryCodeChange={handlePhoneCountryChange}
          disabled={optionsLoading}
        />
        <div>
          <label htmlFor="reg-currency" className="mb-1 block text-xs text-muted">{t('auth.currency')}</label>
          <select
            id="reg-currency"
            required
            value={form.currency}
            onChange={(e) => update('currency', e.target.value)}
            disabled={optionsLoading}
            className={selectClassName}
          >
            {optionsLoading ? (
              <option value="">{t('common.loading')}</option>
            ) : (
              options?.currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.code})
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <label htmlFor="reg-password" className="mb-1 block text-xs text-muted">{t('auth.password')}</label>
          <input
            id="reg-password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="reg-password-confirm" className="mb-1 block text-xs text-muted">
            {t('auth.confirmPassword')}
          </label>
          <input
            id="reg-password-confirm"
            type="password"
            required
            value={form.password_confirmation}
            onChange={(e) => update('password_confirmation', e.target.value)}
            className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
          />
        </div>
        {challengeRequired && (
          <RiskChallengePanel
            onSuccess={handleTurnstileSuccess}
            onError={() => setChallengeError(t('risk.challengeFailed'))}
            onRegisterReset={registerWidgetReset}
            error={challengeError}
          />
        )}
        <Button type="submit" fullWidth disabled={loading || optionsLoading || challengeRequired}>
          {loading ? t('common.creatingAccount') : t('nav.register')}
        </Button>
        <p className="text-center text-xs text-muted">
          {t('auth.hasAccount')}{' '}
          <button
            type="button"
            onClick={() => openModal('login')}
            className="text-accent hover:underline"
          >
            {t('nav.login')}
          </button>
        </p>
      </form>
    </Modal>
  );
}
