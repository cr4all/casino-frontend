import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Checkbox } from '@/components/common/Checkbox';
import { CopyableInput } from '@/components/auth/CopyableInput';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PhoneNumberInput } from '@/components/auth/PhoneNumberInput';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useWalletStore } from '@/stores/walletStore';
import { useTranslation } from '@/hooks/useTranslation';
import { AuthService } from '@/services/AuthService';
import { isLocalPhoneValid, parsePhoneNumber } from '@/data/phoneDialCodes';
import { getAuthApiErrorMessage, isRiskChallengeError } from '@/utils/apiError';
import { RiskChallengePanel } from '@/components/risk/RiskChallengePanel';
import { useRiskChallenge } from '@/hooks/useRiskChallenge';
import {
  clearRememberedLogin,
  loadRememberedLogin,
  saveRememberedLogin,
  type RememberedLoginMethod,
} from '@/utils/loginRemember';
import {
  collectFieldErrors,
  hasFieldErrors,
  isValidEmail,
  omitFieldError,
  requiredValue,
  type FieldErrors,
} from '@/utils/formValidation';

type LoginMethod = RememberedLoginMethod;

const tabButtonClassName = (active: boolean) =>
  `flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-2 text-[11px] font-bold tracking-wide transition-colors sm:gap-1.5 sm:px-3 sm:text-xs ${
    active ? 'bg-card text-accent-gold shadow-sm' : 'text-muted hover:text-white'
  }`;

export function LoginModal() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const activeModal = useUiStore((s) => s.activeModal);
  const closeModal = useUiStore((s) => s.closeModal);
  const openModal = useUiStore((s) => s.openModal);
  const fetchBalance = useWalletStore((s) => s.fetchBalance);

  const [method, setMethod] = useState<LoginMethod>('username');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('US');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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

  useEffect(() => {
    if (activeModal !== 'login') return;

    const remembered = loadRememberedLogin();
    if (!remembered) {
      setRememberMe(false);
      return;
    }

    setRememberMe(true);
    setMethod(remembered.method);
    setUsername(remembered.username ?? '');
    setEmail(remembered.email ?? '');
    setPhone(remembered.phone ?? '');
    setPhoneCountryCode(remembered.phoneCountryCode ?? 'US');
  }, [activeModal]);

  const resetForm = () => {
    setPassword('');
    setError('');
    setFieldErrors({});
    setChallengeError('');
    resetChallenge();
  };

  const persistRememberedLogin = () => {
    if (!rememberMe) {
      clearRememberedLogin();
      return;
    }

    saveRememberedLogin({
      remember: true,
      method,
      username: method === 'username' ? username.trim() : undefined,
      email: method === 'email' ? email.trim() : undefined,
      phone: method === 'phone' ? phone : undefined,
      phoneCountryCode: method === 'phone' ? phoneCountryCode : undefined,
    });
  };

  const completeLogin = async () => {
    const role = useAuthStore.getState().user?.role;
    if (role === 'affiliate') {
      closeModal();
      resetForm();
      navigate('/affiliate');
      return;
    }
    await fetchBalance();
    closeModal();
    resetForm();
  };

  const getErrorMessage = () => {
    if (method === 'phone') return t('auth.loginErrorPhone');
    if (method === 'email') return t('auth.loginErrorEmail');
    return t('auth.loginErrorUsername');
  };

  const performLogin = async (turnstileToken?: string) => {
    if (method === 'username') {
      await AuthService.login({ username: username.trim(), password, turnstileToken });
    } else if (method === 'email') {
      await AuthService.login({ email: email.trim(), password, turnstileToken });
    } else {
      await AuthService.login({ phone, password, turnstileToken });
    }
  };

  const handleTurnstileSuccess = async (token: string) => {
    setChallengeError('');
    setLoading(true);
    try {
      await performLogin(token);
      persistRememberedLogin();
      resetChallenge();
      await completeLogin();
    } catch (err) {
      if (isRiskChallengeError(err)) {
        resetWidget();
        setChallengeError(t('risk.challengeFailed'));
        return;
      }
      resetChallenge();
      setError(getAuthApiErrorMessage(err, getErrorMessage(), t));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const required = (field: string, value: string) =>
      requiredValue(value) ? undefined : t('common.fieldRequired', { field });

    let emailError: string | undefined;
    if (method === 'email') {
      if (!requiredValue(email)) {
        emailError = t('common.fieldRequired', { field: t('auth.email') });
      } else if (!isValidEmail(email)) {
        emailError = t('common.fieldEmailInvalid');
      }
    }

    let phoneError: string | undefined;
    if (method === 'phone') {
      const parsed = parsePhoneNumber(phone, phoneCountryCode);
      if (!isLocalPhoneValid(phoneCountryCode, parsed.local)) {
        phoneError = t('auth.loginErrorPhone');
      }
    }

    const errors = collectFieldErrors([
      ['username', method === 'username' ? required(t('auth.username'), username) : undefined],
      ['email', emailError],
      ['phone', phoneError],
      ['password', required(t('auth.password'), password)],
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
      await performLogin();
      persistRememberedLogin();
      resetChallenge();
      await completeLogin();
    } catch (err) {
      if (isRiskChallengeError(err)) {
        setChallengeRequired(true);
        setError('');
        return;
      }
      setError(getAuthApiErrorMessage(err, getErrorMessage(), t));
    } finally {
      setLoading(false);
    }
  };

  const switchMethod = (next: LoginMethod) => {
    setMethod(next);
    setError('');
    setFieldErrors({});
    setChallengeError('');
    resetChallenge();
  };

  return (
    <Modal isOpen={activeModal === 'login'} onClose={closeModal} title={t('auth.loginTitle')}>
      <div className="mb-4 flex rounded-lg border border-white/10 bg-background/50 p-1">
        <button
          type="button"
          onClick={() => switchMethod('username')}
          className={tabButtonClassName(method === 'username')}
        >
          <span aria-hidden="true">👤</span>
          {t('auth.loginTabUsername')}
        </button>
        <button
          type="button"
          onClick={() => switchMethod('phone')}
          className={tabButtonClassName(method === 'phone')}
        >
          <span aria-hidden="true">📱</span>
          {t('auth.loginTabPhone')}
        </button>
        <button
          type="button"
          onClick={() => switchMethod('email')}
          className={tabButtonClassName(method === 'email')}
        >
          <span aria-hidden="true">✉</span>
          {t('auth.loginTabEmail')}
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {error && (
          <p className="rounded-md bg-accent/10 px-3 py-2 text-sm text-accent">{error}</p>
        )}

        {challengeRequired && (
          <RiskChallengePanel
            onSuccess={handleTurnstileSuccess}
            onError={() => setChallengeError(t('risk.challengeFailed'))}
            onRegisterReset={registerWidgetReset}
            error={challengeError}
          />
        )}

        {method === 'username' && (
          <CopyableInput
            id="login-username"
            label={t('auth.username')}
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setFieldErrors((prev) => omitFieldError(prev, 'username'));
            }}
            placeholder={t('auth.loginUsernamePlaceholder')}
            copyAriaLabel={t('common.copy')}
            error={fieldErrors.username}
          />
        )}

        {method === 'phone' && (
          <PhoneNumberInput
            id="login-phone"
            label={t('auth.phone')}
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

        {method === 'email' && (
          <CopyableInput
            id="login-email"
            label={t('auth.email')}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((prev) => omitFieldError(prev, 'email'));
            }}
            placeholder={t('auth.loginEmailPlaceholder')}
            copyAriaLabel={t('common.copy')}
            error={fieldErrors.email}
          />
        )}

        <PasswordInput
          id="login-password"
          label={t('auth.password')}
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setFieldErrors((prev) => omitFieldError(prev, 'password'));
          }}
          placeholder="••••••••"
          error={fieldErrors.password}
        />

        <div className="flex items-center justify-between gap-3">
          <Checkbox
            id="login-remember-me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            label={t('auth.rememberMe')}
          />
          <button
            type="button"
            onClick={() => openModal('forgotPassword')}
            className="text-xs text-accent hover:underline"
          >
            {t('auth.forgotPassword')}
          </button>
        </div>

        <Button type="submit" fullWidth disabled={loading || challengeRequired}>
          {loading ? t('common.loggingIn') : t('nav.login')}
        </Button>

        <p className="text-center text-xs text-muted">
          {t('auth.noAccount')}{' '}
          <button
            type="button"
            onClick={() => openModal('register')}
            className="text-accent hover:underline"
          >
            {t('nav.register')}
          </button>
        </p>
      </form>
    </Modal>
  );
}
