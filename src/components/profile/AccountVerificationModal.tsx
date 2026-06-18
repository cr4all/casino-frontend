import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/common/Modal';
import { playerApi } from '@/api/wallet.api';
import { useTranslation } from '@/hooks/useTranslation';
import { getApiErrorMessage } from '@/utils/apiError';
import type { PlayerProfile } from '@/types';

type VerificationChannel = 'email' | 'phone';

interface AccountVerificationModalProps {
  channel: VerificationChannel | null;
  destination: string;
  onClose: () => void;
  onVerified: (profile: PlayerProfile) => void;
}

const inputClassName =
  'w-full rounded-md border border-white/10 bg-card px-3 py-2.5 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none';

export function AccountVerificationModal({
  channel,
  destination,
  onClose,
  onVerified,
}: AccountVerificationModalProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [success, setSuccess] = useState(false);

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
    } catch (err) {
      setError(getApiErrorMessage(err, t('profile.verificationRequestFailed')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setCode('');
      setError('');
      setCodeSent(false);
      setSuccess(false);
      setLoading(false);
      return;
    }

    sendCode();
  }, [channel]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!channel) return;

    setError('');
    setLoading(true);

    try {
      const profile = isEmail
        ? await playerApi.confirmEmailVerification(code.trim())
        : await playerApi.confirmPhoneVerification(code.trim());
      setSuccess(true);
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
      {success ? (
        <div className="space-y-4">
          <p className="text-sm text-accent-gold">{t('profile.verificationSuccess')}</p>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full border border-white/15 bg-gradient-to-b from-white/25 to-white/10 py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
          >
            {t('common.ok')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {loading && !codeSent ? (
            <p className="text-sm text-muted">{t('common.loading')}</p>
          ) : (
            <p className="text-sm text-accent">{codeSent ? hint : null}</p>
          )}

          <div>
            <label htmlFor="account-verify-code" className="mb-1 block text-xs text-muted">
              {t('auth.forgotPasswordCode')}
            </label>
            <input
              id="account-verify-code"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={inputClassName}
              placeholder="000000"
              disabled={!codeSent}
            />
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading || !codeSent || code.length !== 6}
            className="w-full rounded-full border border-white/15 bg-gradient-to-b from-white/25 to-white/10 py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t('common.loading') : t('profile.verificationSubmit')}
          </button>

          <button
            type="button"
            onClick={sendCode}
            disabled={loading || !codeSent}
            className="block w-full text-center text-sm text-accent hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('profile.resendCode')}
          </button>
        </form>
      )}
    </Modal>
  );
}
