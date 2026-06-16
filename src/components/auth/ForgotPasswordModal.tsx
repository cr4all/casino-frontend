import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/common/Modal';
import { PhoneNumberInput } from '@/components/auth/PhoneNumberInput';
import { authApi } from '@/api/auth.api';
import { useUiStore } from '@/stores/uiStore';
import { useTranslation } from '@/hooks/useTranslation';
import { getApiErrorMessage } from '@/utils/apiError';
import { isLocalPhoneValid, parsePhoneNumber } from '@/data/phoneDialCodes';

type RecoveryMethod = 'email' | 'phone';
type RecoveryStep = 'request' | 'reset' | 'success';

const inputClassName =
  'w-full rounded-md border border-white/10 bg-card py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none';

const plainInputClassName =
  'w-full rounded-md border border-white/10 bg-card px-3 py-2.5 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none';

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
      setLoading(false);
    }
  }, [isOpen]);

  const switchMethod = (next: RecoveryMethod) => {
    setMethod(next);
    setError('');
  };

  const handleRequest = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (method === 'phone') {
      const parsed = parsePhoneNumber(phone, phoneCountryCode);
      if (!isLocalPhoneValid(phoneCountryCode, parsed.local)) {
        setError(t('auth.phoneInvalid'));
        return;
      }
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
        <form onSubmit={handleReset} className="space-y-4">
          <p className="text-sm text-accent">{codeHint}</p>

          <div>
            <label htmlFor="forgot-code" className="mb-1 block text-xs text-muted">
              {t('auth.forgotPasswordCode')}
            </label>
            <input
              id="forgot-code"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={plainInputClassName}
              placeholder="000000"
            />
          </div>

          <div>
            <label htmlFor="forgot-new-password" className="mb-1 block text-xs text-muted">
              {t('auth.password')}
            </label>
            <input
              id="forgot-new-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={plainInputClassName}
            />
          </div>

          <div>
            <label htmlFor="forgot-confirm-password" className="mb-1 block text-xs text-muted">
              {t('auth.confirmPassword')}
            </label>
            <input
              id="forgot-confirm-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className={plainInputClassName}
            />
          </div>

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

          <form onSubmit={handleRequest} className="space-y-4">
            {method === 'email' ? (
              <div className="relative">
                <span
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted"
                  aria-hidden="true"
                >
                  ✉
                </span>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClassName}
                  placeholder={t('auth.loginEmailPlaceholder')}
                />
              </div>
            ) : (
              <PhoneNumberInput
                id="forgot-phone"
                label={t('auth.phone')}
                hideLabel
                value={phone}
                onChange={setPhone}
                countryCode={phoneCountryCode}
                onCountryCodeChange={setPhoneCountryCode}
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
