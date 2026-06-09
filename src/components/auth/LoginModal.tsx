import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useWalletStore } from '@/stores/walletStore';
import { useTranslation } from '@/hooks/useTranslation';

export function LoginModal() {
  const { t } = useTranslation();
  const activeModal = useUiStore((s) => s.activeModal);
  const closeModal = useUiStore((s) => s.closeModal);
  const openModal = useUiStore((s) => s.openModal);
  const login = useAuthStore((s) => s.login);
  const fetchBalance = useWalletStore((s) => s.fetchBalance);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      await fetchBalance();
      closeModal();
      setEmail('');
      setPassword('');
    } catch {
      setError(t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={activeModal === 'login'} onClose={closeModal} title={t('auth.loginTitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-md bg-accent/10 px-3 py-2 text-sm text-accent">{error}</p>
        )}
        <div>
          <label htmlFor="login-email" className="mb-1 block text-xs text-muted">
            {t('auth.email')}
          </label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-card px-3 py-2.5 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none"
            placeholder={t('auth.emailPlaceholder')}
          />
        </div>
        <div>
          <label htmlFor="login-password" className="mb-1 block text-xs text-muted">
            {t('auth.password')}
          </label>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-card px-3 py-2.5 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none"
            placeholder="••••••••"
          />
        </div>
        <Button type="submit" fullWidth disabled={loading}>
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
