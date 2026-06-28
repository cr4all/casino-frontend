import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/common/Modal';
import { FormTextField } from '@/components/common/FormTextField';
import { playerApi } from '@/api/wallet.api';
import { useTranslation } from '@/hooks/useTranslation';
import { getApiErrorMessage } from '@/utils/apiError';
import type { PlayerProfile } from '@/types';
import {
  collectFieldErrors,
  hasFieldErrors,
  omitFieldError,
  requiredValue,
  type FieldErrors,
} from '@/utils/formValidation';

type VerificationChannel = 'email' | 'phone';
type VerificationStep = 'confirm' | 'verify' | 'success';

interface AccountVerificationModalProps {
  channel: VerificationChannel | null;
  destination: string;
  onClose: () => void;
  onVerified: (profile: PlayerProfile) => void;
}

const actionButtonClassName =
  'w-full rounded-full border border-white/15 bg-gradient-to-b from-white/25 to-white/10 py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50';

export function AccountVerificationModal({
  channel,
  destination,
  onClose,
  onVerified,
}: AccountVerificationModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<VerificationStep>('confirm');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const isOpen = channel !== null;
  const isEmail = channel === 'email';

  const sendCode = async () => {
    if (!channel) return;

    setError('');
    setLoading(true);

    try {
      if (isEmail) {
        await playerApi.requestEmailVerification();
      } else {
        await playerApi.requestPhoneVerification();
      }
      setCodeSent(true);
      setStep('verify');
    } catch (err) {
      setError(getApiErrorMessage(err, t('profile.verificationRequestFailed')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setStep('confirm');
      setCode('');
      setError('');
      setFieldErrors({});
      setCodeSent(false);
      setLoading(false);
      return;
    }

    setStep('confirm');
    setCode('');
    setError('');
    setFieldErrors({});
    setCodeSent(false);
    setLoading(false);
  }, [channel, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!channel) return;

    setError('');
    setFieldErrors({});

    let codeError: string | undefined;
    if (!requiredValue(code)) {
      codeError = t('common.fieldRequired', { field: t('auth.forgotPasswordCode') });
    } else if (code.length !== 6) {
      codeError = t('common.fieldCodeInvalid');
    }

    const errors = collectFieldErrors([['code', codeError]]);
    if (hasFieldErrors(errors)) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const profile = isEmail
        ? await playerApi.confirmEmailVerification(code.trim())
        : await playerApi.confirmPhoneVerification(code.trim());
      setStep('success');
      onVerified(profile);
    } catch (err) {
      setError(getApiErrorMessage(err, t('profile.verificationConfirmFailed')));
    } finally {
      setLoading(false);
    }
  };

  const title = isEmail ? t('profile.verificationTitleEmail') : t('profile.verificationTitlePhone');
  const hint = isEmail
    ? t('profile.verificationCodeHintEmail', { destination })
    : t('profile.verificationCodeHintPhone', { destination });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      titleIcon={
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-base text-muted"
          aria-hidden="true"
        >
          {isEmail ? '✉' : '📱'}
        </span>
      }
    >
      {step === 'success' ? (
        <div className="space-y-4">
          <p className="text-sm text-accent-gold">{t('profile.verificationSuccess')}</p>
          <button type="button" onClick={onClose} className={actionButtonClassName}>
            {t('common.ok')}
          </button>
        </div>
      ) : step === 'confirm' ? (
        <div className="space-y-4">
          <p className="text-sm text-white">
            {t('profile.verificationSendConfirm', { destination })}
          </p>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`${actionButtonClassName} border-white/10 bg-white/5`}
            >
              {t('common.no')}
            </button>
            <button
              type="button"
              onClick={() => void sendCode()}
              disabled={loading}
              className={actionButtonClassName}
            >
              {loading ? t('common.loading') : t('common.yes')}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {loading && !codeSent ? (
            <p className="text-sm text-muted">{t('common.loading')}</p>
          ) : (
            <p className="text-sm text-accent">{codeSent ? hint : null}</p>
          )}

          <FormTextField
            id="account-verify-code"
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
            disabled={!codeSent}
            error={fieldErrors.code}
          />

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading || !codeSent || code.length !== 6}
            className={actionButtonClassName}
          >
            {loading ? t('common.loading') : t('profile.verificationSubmit')}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep('confirm');
              setCode('');
              setError('');
            }}
            disabled={loading}
            className="block w-full text-center text-sm text-accent hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('profile.resendCode')}
          </button>
        </form>
      )}
    </Modal>
  );
};
