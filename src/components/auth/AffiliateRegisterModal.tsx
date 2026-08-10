import { useState, useRef, type FormEvent } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { FormTextField } from '@/components/common/FormTextField';
import { FieldError, fieldControlClassName } from '@/components/common/FieldError';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { useUiStore } from '@/stores/uiStore';
import { useTranslation } from '@/hooks/useTranslation';
import { authApi } from '@/api/auth.api';
import { AuthService } from '@/services/AuthService';
import {
  getAuthApiErrorMessage,
  getApiValidationFieldErrors,
  isPostRegisterLoginChallengeError,
  isRiskChallengeError,
} from '@/utils/apiError';
import { RiskChallengePanel } from '@/components/risk/RiskChallengePanel';
import { useRiskChallenge } from '@/hooks/useRiskChallenge';
import {
  collectFieldErrors,
  hasFieldErrors,
  isValidEmail,
  omitFieldError,
  requiredValue,
  type FieldErrors,
} from '@/utils/formValidation';

type ChallengePhase = 'register' | 'login';

const REFERRAL_CODE_PATTERN = /^[A-Za-z0-9_-]+$/;

export function AffiliateRegisterModal() {
  const { t } = useTranslation();
  const activeModal = useUiStore((s) => s.activeModal);
  const closeModal = useUiStore((s) => s.closeModal);
  const openModal = useUiStore((s) => s.openModal);

  const [form, setForm] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    code: '',
  });
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerifyLoading, setEmailVerifyLoading] = useState(false);
  const [emailVerifyMessage, setEmailVerifyMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [challengeError, setChallengeError] = useState('');
  const [challengePhase, setChallengePhase] = useState<ChallengePhase>('register');
  const [loading, setLoading] = useState(false);
  const {
    challengeRequired,
    setChallengeRequired,
    resetChallenge,
    registerWidgetReset,
    resetWidget,
  } = useRiskChallenge();
  const registerInFlightRef = useRef(false);

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      let next = omitFieldError(prev, field);
      if (field === 'email') {
        next = omitFieldError(next, 'email_verification_code');
      }
      return next;
    });
    if (field === 'email') {
      setEmailOtp('');
      setEmailOtpSent(false);
      setEmailVerifyMessage('');
    }
  };

  const resetForm = () => {
    registerInFlightRef.current = false;
    setChallengePhase('register');
    setForm({
      email: '',
      password: '',
      password_confirmation: '',
      code: '',
    });
    setEmailOtp('');
    setEmailOtpSent(false);
    setEmailVerifyLoading(false);
    setEmailVerifyMessage('');
    setFieldErrors({});
    setChallengeError('');
    resetChallenge();
  };

  const buildRegisterPayload = (turnstileToken?: string) => ({
    email: form.email.trim(),
    password: form.password,
    password_confirmation: form.password_confirmation,
    code: form.code.trim().toUpperCase(),
    email_verification_code: emailOtp,
    ...(turnstileToken ? { turnstileToken } : {}),
  });

  const completeRegistration = () => {
    closeModal();
    resetForm();
  };

  const handleChallengeFlowError = (err: unknown): boolean => {
    if (isPostRegisterLoginChallengeError(err)) {
      setChallengePhase('login');
      setChallengeRequired(true);
      setError('');
      return true;
    }
    if (isRiskChallengeError(err)) {
      setChallengePhase('register');
      setChallengeRequired(true);
      setError('');
      return true;
    }
    return false;
  };

  const performRegister = async (turnstileToken?: string) => {
    await AuthService.registerAffiliate(buildRegisterPayload(turnstileToken));
    completeRegistration();
  };

  const performLoginAfterRegister = async (turnstileToken: string) => {
    await AuthService.login({
      email: form.email.trim(),
      password: form.password,
      turnstileToken,
    });
    completeRegistration();
  };

  const handleTurnstileSuccess = async (token: string) => {
    if (registerInFlightRef.current) {
      return;
    }
    registerInFlightRef.current = true;
    setChallengeError('');
    setLoading(true);
    try {
      if (challengePhase === 'login') {
        await performLoginAfterRegister(token);
      } else {
        await performRegister(token);
      }
    } catch (err) {
      registerInFlightRef.current = false;
      if (isPostRegisterLoginChallengeError(err)) {
        setChallengePhase('login');
        resetWidget();
        setChallengeRequired(true);
        setError('');
        return;
      }
      if (isRiskChallengeError(err)) {
        resetWidget();
        setChallengeError(t('risk.challengeFailed'));
        return;
      }
      resetChallenge();
      setError(getAuthApiErrorMessage(err, t('auth.affiliateRegisterError'), t));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
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

    let codeError: string | undefined;
    const normalizedCode = form.code.trim();
    if (!requiredValue(normalizedCode)) {
      codeError = t('common.fieldRequired', { field: t('auth.affiliateReferralCode') });
    } else if (normalizedCode.length > 50 || !REFERRAL_CODE_PATTERN.test(normalizedCode)) {
      codeError = t('auth.affiliateReferralCodeInvalid');
    }

    const errors = collectFieldErrors([
      ['email', emailError],
      ['code', codeError],
      ['password', passwordError],
      ['password_confirmation', confirmError],
      ['email_verification_code', !emailOtpSent
        ? t('auth.emailVerificationRequired')
        : !requiredValue(emailOtp)
          ? t('common.fieldRequired', { field: t('auth.emailVerificationCode') })
          : emailOtp.length !== 6
            ? t('common.fieldCodeInvalid')
            : undefined],
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
      if (handleChallengeFlowError(err)) {
        return;
      }

      const apiFieldErrors = getApiValidationFieldErrors(err);
      if (Object.keys(apiFieldErrors).length > 0) {
        setFieldErrors(apiFieldErrors);
        return;
      }

      setError(getAuthApiErrorMessage(err, t('auth.affiliateRegisterError'), t));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestEmailVerification = async () => {
    setError('');
    setEmailVerifyMessage('');
    setFieldErrors((prev) => omitFieldError(prev, 'email'));

    if (!requiredValue(form.email)) {
      setFieldErrors((prev) => ({
        ...prev,
        email: t('common.fieldRequired', { field: t('auth.email') }),
      }));
      return;
    }

    if (!isValidEmail(form.email)) {
      setFieldErrors((prev) => ({
        ...prev,
        email: t('common.fieldEmailInvalid'),
      }));
      return;
    }

    setEmailVerifyLoading(true);
    try {
      await authApi.requestRegistrationEmailVerification(form.email.trim());
      setEmailOtp('');
      setEmailOtpSent(true);
      setEmailVerifyMessage(t('auth.emailVerificationHint'));
      setFieldErrors((prev) => omitFieldError(prev, 'email_verification_code'));
    } catch (err) {
      const apiFieldErrors = getApiValidationFieldErrors(err);

      if (apiFieldErrors.email) {
        setEmailOtp('');
        setEmailOtpSent(false);
        setEmailVerifyMessage('');
        setFieldErrors((prev) => ({ ...prev, email: apiFieldErrors.email }));
        return;
      }

      setEmailVerifyMessage(getAuthApiErrorMessage(err, t('auth.emailVerificationRequestFailed'), t));
    } finally {
      setEmailVerifyLoading(false);
    }
  };

  const emailErrorId = fieldErrors.email ? 'aff-reg-email-error' : undefined;

  return (
    <Modal
      isOpen={activeModal === 'affiliateRegister'}
      onClose={closeModal}
      title={t('auth.affiliateRegisterTitle')}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        {error && (
          <p className="rounded-md bg-accent/10 px-3 py-2 text-sm text-accent">{error}</p>
        )}

        <div>
          <label htmlFor="aff-reg-email" className="mb-1 block text-xs text-muted">
            {t('auth.email')}
          </label>
          <div className="flex gap-2">
            <input
              id="aff-reg-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              aria-invalid={fieldErrors.email ? true : undefined}
              aria-describedby={emailErrorId}
              placeholder={t('auth.emailPlaceholder')}
              className={`${fieldControlClassName(Boolean(fieldErrors.email))} min-w-0 flex-1`}
            />
            <Button
              type="button"
              variant="secondary"
              disabled={emailVerifyLoading}
              onClick={() => void handleRequestEmailVerification()}
              className="h-[42px] shrink-0 px-4"
            >
              {emailVerifyLoading ? t('common.loading') : t('profile.verifyNow')}
            </Button>
          </div>
          <FieldError id={emailErrorId} message={fieldErrors.email} />
        </div>

        <div>
          <FormTextField
            id="aff-reg-code"
            label={t('auth.affiliateReferralCode')}
            type="text"
            maxLength={50}
            autoComplete="off"
            value={form.code}
            onChange={(e) => update('code', e.target.value.toUpperCase())}
            placeholder="MYBRAND"
            error={fieldErrors.code}
          />
          <p className="mt-1 text-xs text-muted">{t('auth.affiliateReferralCodeHint')}</p>
        </div>

        <PasswordInput
          id="aff-reg-password"
          label={t('auth.password')}
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          error={fieldErrors.password}
        />

        <PasswordInput
          id="aff-reg-password-confirm"
          label={t('auth.confirmPassword')}
          autoComplete="new-password"
          value={form.password_confirmation}
          onChange={(e) => update('password_confirmation', e.target.value)}
          error={fieldErrors.password_confirmation}
        />

        <FormTextField
          id="aff-reg-email-otp"
          label={t('auth.emailVerificationCode')}
          type="text"
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
          value={emailOtp}
          onChange={(e) => {
            setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
            setFieldErrors((prev) => omitFieldError(prev, 'email_verification_code'));
          }}
          placeholder="000000"
          disabled={!emailOtpSent}
          error={fieldErrors.email_verification_code}
        />

        {emailVerifyMessage && !fieldErrors.email_verification_code && !fieldErrors.email && (
          <p className={`text-xs ${emailOtpSent ? 'text-accent' : 'text-red-400'}`}>{emailVerifyMessage}</p>
        )}

        {challengeRequired && (
          <RiskChallengePanel
            onSuccess={handleTurnstileSuccess}
            onError={() => setChallengeError(t('risk.challengeFailed'))}
            onRegisterReset={registerWidgetReset}
            error={challengeError}
          />
        )}

        <Button type="submit" fullWidth disabled={loading || challengeRequired}>
          {loading ? t('common.creatingAccount') : t('footer.becomePartner')}
        </Button>

        <p className="text-center text-xs text-muted">
          {t('auth.hasAffiliateAccount')}{' '}
          <button
            type="button"
            onClick={() => openModal('login')}
            className="text-accent hover:underline"
          >
            {t('auth.affiliatePortalLoginTitle')}
          </button>
        </p>
      </form>
    </Modal>
  );
}
