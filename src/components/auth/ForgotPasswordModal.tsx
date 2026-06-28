import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/common/Modal';
import { FormTextField } from '@/components/common/FormTextField';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PhoneNumberInput } from '@/components/auth/PhoneNumberInput';
import { authApi } from '@/api/auth.api';
import { useUiStore } from '@/stores/uiStore';
import { useTranslation } from '@/hooks/useTranslation';
import { getApiErrorMessage } from '@/utils/apiError';
import { isLocalPhoneValid, parsePhoneNumber } from '@/data/phoneDialCodes';
import {
  collectFieldErrors,
  hasFieldErrors,
  isValidEmail,
  omitFieldError,
  requiredValue,
  type FieldErrors,
} from '@/utils/formValidation';

type RecoveryMethod = 'email' | 'phone';
type RecoveryStep = 'request' | 'reset' | 'success';

export function ForgotPasswordModal() {
  const { t } = useTranslation();
  const activeModal = useUiStore((s) => s.activeModal);
  const openModal = useUiStore((s) => s.openModal);
  const closeModal = useUiStore((s) => s.closeModal);

  const [method, setMethod] = useState<RecoveryMethod>('email');
  const [step, setStep] = useState<RecoveryStep>('request');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('US');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const isOpen = activeModal === 'forgotPassword';

  useEffect(() => {
    if (!isOpen) {
      setMethod('email');
      setStep('request');
      setEmail('');
      setPhone('');
      setPhoneCountryCode('US');
      setCode('');
      setPassword('');
      setPasswordConfirmation('');
      setError('');
      setFieldErrors({});
      setLoading(false);
    }
  }, [isOpen]);

  const switchMethod = (next: RecoveryMethod) => {
    setMethod(next);
    setError('');
    setFieldErrors({});
  };

  const validateRequestForm = (): boolean => {
    if (method === 'email') {
      let emailError: string | undefined;
      if (!requiredValue(email)) {
        emailError = t('common.fieldRequired', { field: t('auth.email') });
      } else if (!isValidEmail(email)) {
        emailError = t('common.fieldEmailInvalid');
      }
      const errors = collectFieldErrors([['email', emailError]]);
      setFieldErrors(errors);
      return !hasFieldErrors(errors);
    }

    const parsed = parsePhoneNumber(phone, phoneCountryCode);
    const phoneError = isLocalPhoneValid(phoneCountryCode, parsed.local)
      ? undefined
      : t('auth.phoneInvalid');
    const errors = collectFieldErrors([['phone', phoneError]]);
    setFieldErrors(errors);
    return !hasFieldErrors(errors);
  };

  const validateResetForm = (): boolean => {
    let passwordError: string | undefined;
    if (!requiredValue(password)) {
      passwordError = t('common.fieldRequired', { field: t('auth.password') });
    } else if (password.length < 8) {
      passwordError = t('common.fieldMinLength', { count: 8 });
    }

    let confirmError: string | undefined;
    if (!requiredValue(passwordConfirmation)) {
      confirmError = t('common.fieldRequired', { field: t('auth.confirmPassword') });
    } else if (password !== passwordConfirmation) {
      confirmError = t('common.fieldPasswordMismatch');
    }

    let codeError: string | undefined;
    if (!requiredValue(code)) {
      codeError = t('common.fieldRequired', { field: t('auth.forgotPasswordCode') });
    } else if (code.length !== 6) {
      codeError = t('common.fieldCodeInvalid');
    }

    const errors = collectFieldErrors([
      ['code', codeError],
      ['password', passwordError],
      ['password_confirmation', confirmError],
    ]);
    setFieldErrors(errors);
    return !hasFieldErrors(errors);
  };

  const handleRequest = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!validateRequestForm()) {
      return;
    }

    setLoading(true);
    try {
      if (method === 'email') {
        await authApi.requestPasswordRecovery({ email: email.trim() });
      } else {
        await authApi.requestPasswordRecovery({ phone });
      }
      setStep('reset');
    } catch (err) {
      setError(getApiErrorMessage(err, t('auth.forgotPasswordRequestError')));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!validateResetForm()) {
      return;
    }

    setLoading(true);

    const resetPayload = {
      code: code.trim(),
      password,
      password_confirmation: passwordConfirmation,
      ...(method === 'email' ? { email: email.trim() } : { phone }),
    };

    try {
      await authApi.resetPasswordWithCode(resetPayload);
      setStep('success');
    } catch (err) {
      setError(getApiErrorMessage(err, t('auth.forgotPasswordResetError')));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    openModal('login');
  };

  const handleBackToLogin = () => {
    openModal('login');
  };

  const codeHint =
    method === 'email' ? t('auth.forgotPasswordCodeHint') : t('auth.forgotPasswordCodeHintPhone');

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={t('auth.forgotPasswordTitle')}
      titleIcon={
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-base text-muted"
          aria-hidden="true"
        >
          🔒
        </span>
      }
    >
      {step === 'success' ? (
        <div className="space-y-4">
          <p className="text-sm text-accent">{t('auth.forgotPasswordSuccess')}</p>
          <button
            type="button"
            onClick={handleBackToLogin}
            className="w-full rounded-full border border-white/15 bg-gradient-to-b from-white/25 to-white/10 py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
          >
            {t('auth.forgotPasswordBackToLogin')}
          </button>
        </div>
      ) : step === 'reset' ? (
        <form onSubmit={handleReset} noValidate className="space-y-4">
          <p className="text-sm text-accent">{codeHint}</p>

          <FormTextField
            id="forgot-code"
            label={t('auth.forgotPasswordCode')}
            type="text"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
              setFieldErrors((prev) => omitFieldError(prev, 'code'));
            }}
            placeholder="000000"
            error={fieldErrors.code}
          />

          <PasswordInput
            id="forgot-new-password"
            label={t('auth.password')}
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors((prev) => omitFieldError(prev, 'password'));
            }}
            error={fieldErrors.password}
          />

          <PasswordInput
            id="forgot-confirm-password"
            label={t('auth.confirmPassword')}
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={(e) => {
              setPasswordConfirmation(e.target.value);
              setFieldErrors((prev) => omitFieldError(prev, 'password_confirmation'));
            }}
            error={fieldErrors.password_confirmation}
          />

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full border border-white/15 bg-gradient-to-b from-white/25 to-white/10 py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t('common.loading') : t('auth.forgotPasswordResetSubmit')}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="block w-full text-center text-sm text-accent hover:underline"
          >
            {t('auth.forgotPasswordCancel')}
          </button>
        </form>
      ) : (
        <>
          <p className="mb-4 text-sm text-accent">
            {method === 'email' ? t('auth.forgotPasswordEmailHint') : t('auth.forgotPasswordPhoneHint')}
          </p>

          <div className="mb-4 flex rounded-lg border border-white/10 bg-background/50 p-1">
            <button
              type="button"
              onClick={() => switchMethod('email')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-bold tracking-wide transition-colors ${
                method === 'email'
                  ? 'bg-card text-accent-gold shadow-sm'
                  : 'text-muted hover:text-white'
              }`}
            >
              <span aria-hidden="true">✉</span>
              {t('auth.loginTabEmail')}
            </button>
            <button
              type="button"
              onClick={() => switchMethod('phone')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-bold tracking-wide transition-colors ${
                method === 'phone'
                  ? 'bg-card text-accent-gold shadow-sm'
                  : 'text-muted hover:text-white'
              }`}
            >
              <span aria-hidden="true">📱</span>
              {t('auth.loginTabPhone')}
            </button>
          </div>

          <form onSubmit={handleRequest} noValidate className="space-y-4">
            {method === 'email' ? (
              <FormTextField
                id="forgot-email"
                label={t('auth.email')}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => omitFieldError(prev, 'email'));
                }}
                placeholder={t('auth.loginEmailPlaceholder')}
                error={fieldErrors.email}
                leading={
                  <span
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted"
                    aria-hidden="true"
                  >
                    ✉
                  </span>
                }
              />
            ) : (
              <PhoneNumberInput
                id="forgot-phone"
                label={t('auth.phone')}
                hideLabel
                value={phone}
                onChange={(value) => {
                  setPhone(value);
                  setFieldErrors((prev) => omitFieldError(prev, 'phone'));
                }}
                countryCode={phoneCountryCode}
                onCountryCodeChange={setPhoneCountryCode}
                error={fieldErrors.phone}
              />
            )}

            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full border border-white/15 bg-gradient-to-b from-white/25 to-white/10 py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('auth.forgotPasswordProceed')}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="block w-full text-center text-sm text-accent hover:underline"
            >
              {t('auth.forgotPasswordCancel')}
            </button>
          </form>
        </>
      )}
    </Modal>
  );
}
