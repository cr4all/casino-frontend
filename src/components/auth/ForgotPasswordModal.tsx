import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/common/Modal';
import { PhoneNumberInput } from '@/components/auth/PhoneNumberInput';
import { useUiStore } from '@/stores/uiStore';
import { useTranslation } from '@/hooks/useTranslation';

type RecoveryMethod = 'email' | 'phone';

const inputClassName =
  'w-full rounded-md border border-white/10 bg-card py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none';

export function ForgotPasswordModal() {
  const { t } = useTranslation();
  const activeModal = useUiStore((s) => s.activeModal);
  const openModal = useUiStore((s) => s.openModal);
  const closeModal = useUiStore((s) => s.closeModal);

  const [method, setMethod] = useState<RecoveryMethod>('email');
  const [identifier, setIdentifier] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('US');

  const isOpen = activeModal === 'forgotPassword';

  useEffect(() => {
    if (!isOpen) {
      setMethod('email');
      setIdentifier('');
      setPhone('');
      setPhoneCountryCode('US');
    }
  }, [isOpen]);

  const switchMethod = (next: RecoveryMethod) => {
    setMethod(next);
  };

  const handleProceed = (e: FormEvent) => {
    e.preventDefault();
    // API integration will be added later.
  };

  const handleCancel = () => {
    openModal('login');
  };

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

      <form onSubmit={handleProceed} className="space-y-4">
        {method === 'email' ? (
          <div className="relative">
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted"
              aria-hidden="true"
            >
              ✉
            </span>
            <input
              id="forgot-identifier"
              type="text"
              required
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className={inputClassName}
              placeholder={t('auth.loginIdentifierPlaceholder')}
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

        <button
          type="submit"
          className="w-full rounded-full border border-white/15 bg-gradient-to-b from-white/25 to-white/10 py-3 text-sm font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('auth.forgotPasswordProceed')}
        </button>

        <button
          type="button"
          onClick={handleCancel}
          className="block w-full text-center text-sm text-accent hover:underline"
        >
          {t('auth.forgotPasswordCancel')}
        </button>
      </form>
    </Modal>
  );
}
