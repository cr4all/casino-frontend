import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { FormSelect, FormTextField } from '@/components/common/FormTextField';
import { PasswordInput } from '@/components/auth/PasswordInput';
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
import {
  collectFieldErrors,
  hasFieldErrors,
  isValidEmail,
  omitFieldError,
  requiredValue,
  type FieldErrors,
} from '@/utils/formValidation';

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [challengeError, setChallengeError] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    challengeRequired,
    setChallengeRequired,
    resetChallenge,
    registerWidgetReset,
    resetWidget,
  } = useRiskChallenge();
  const registerInFlightRef = useRef(false);

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

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => omitFieldError(prev, field));
  };

  const handlePhoneCountryChange = (code: string) => {
    setPhoneCountryCode(code);
    setFieldErrors((prev) => omitFieldError(prev, 'phone'));
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
    registerInFlightRef.current = false;
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
    setFieldErrors({});
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
    if (registerInFlightRef.current) {
      return;
    }
    registerInFlightRef.current = true;
    setChallengeError('');
    setLoading(true);
    try {
      await performRegister(token);
    } catch (err) {
      registerInFlightRef.current = false;
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

  const validateForm = (): boolean => {
    const required = (field: string, value: string) =>
      requiredValue(value) ? undefined : t('common.fieldRequired', { field });

    let emailError: string | undefined;
    if (!requiredValue(form.email)) {
      emailError = t('common.fieldRequired', { field: t('auth.email') });
    } else if (!isValidEmail(form.email)) {
      emailError = t('common.fieldEmailInvalid');
    }

    let passwordError: string | undefined;
    if (!requiredValue(form.password)) {
      passwordError = t('common.fieldRequired', { field: t('auth.password') });
    } else if (form.password.length < 8) {
      passwordError = t('common.fieldMinLength', { count: 8 });
    }

    let confirmError: string | undefined;
    if (!requiredValue(form.password_confirmation)) {
      confirmError = t('common.fieldRequired', { field: t('auth.confirmPassword') });
    } else if (form.password !== form.password_confirmation) {
      confirmError = t('common.fieldPasswordMismatch');
    }

    const parsedPhone = parsePhoneNumber(form.phone, phoneCountryCode);
    const phoneError = isLocalPhoneValid(phoneCountryCode, parsedPhone.local)
      ? undefined
      : t('auth.phoneInvalid');

    const errors = collectFieldErrors([
      ['email', emailError],
      ['nickname', required(t('auth.username'), form.nickname)],
      ['phone', phoneError],
      ['currency', required(t('auth.currency'), form.currency)],
      ['password', passwordError],
      ['password_confirmation', confirmError],
    ]);

    setFieldErrors(errors);
    return !hasFieldErrors(errors);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
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
      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        {error && (
          <p className="rounded-md bg-accent/10 px-3 py-2 text-sm text-accent">{error}</p>
        )}
        <FormTextField
          id="reg-email"
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          error={fieldErrors.email}
        />
        <FormTextField
          id="reg-username"
          label={t('auth.username')}
          type="text"
          maxLength={50}
          autoComplete="username"
          value={form.nickname}
          onChange={(e) => update('nickname', e.target.value)}
          error={fieldErrors.nickname}
        />
        <PhoneNumberInput
          id="reg-phone"
          label={t('auth.phone')}
          value={form.phone}
          onChange={(phone) => {
            update('phone', phone);
            setFieldErrors((prev) => omitFieldError(prev, 'phone'));
          }}
          countryCode={phoneCountryCode}
          onCountryCodeChange={handlePhoneCountryChange}
          disabled={optionsLoading}
          error={fieldErrors.phone}
        />
        <FormSelect
          id="reg-currency"
          label={t('auth.currency')}
          value={form.currency}
          onChange={(e) => update('currency', e.target.value)}
          disabled={optionsLoading}
          error={fieldErrors.currency}
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
        </FormSelect>
        <PasswordInput
          id="reg-password"
          label={t('auth.password')}
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          error={fieldErrors.password}
        />
        <PasswordInput
          id="reg-password-confirm"
          label={t('auth.confirmPassword')}
          autoComplete="new-password"
          value={form.password_confirmation}
          onChange={(e) => update('password_confirmation', e.target.value)}
          error={fieldErrors.password_confirmation}
        />
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
