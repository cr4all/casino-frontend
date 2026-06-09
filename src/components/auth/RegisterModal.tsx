import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useWalletStore } from '@/stores/walletStore';

export function RegisterModal() {
  const activeModal = useUiStore((s) => s.activeModal);
  const closeModal = useUiStore((s) => s.closeModal);
  const openModal = useUiStore((s) => s.openModal);
  const register = useAuthStore((s) => s.register);
  const fetchBalance = useWalletStore((s) => s.fetchBalance);

  const [form, setForm] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    nickname: '',
    country: 'DE',
    currency: 'EUR',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      await fetchBalance();
      closeModal();
      setForm({
        email: '',
        password: '',
        password_confirmation: '',
        nickname: '',
        country: 'DE',
        currency: 'EUR',
      });
    } catch {
      setError('Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={activeModal === 'register'} onClose={closeModal} title="Register">
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <p className="rounded-md bg-accent/10 px-3 py-2 text-sm text-accent">{error}</p>
        )}
        <div>
          <label htmlFor="reg-email" className="mb-1 block text-xs text-muted">Email</label>
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
          <label htmlFor="reg-nickname" className="mb-1 block text-xs text-muted">Nickname</label>
          <input
            id="reg-nickname"
            type="text"
            required
            maxLength={50}
            value={form.nickname}
            onChange={(e) => update('nickname', e.target.value)}
            className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-country" className="mb-1 block text-xs text-muted">Country</label>
            <input
              id="reg-country"
              type="text"
              required
              maxLength={2}
              value={form.country}
              onChange={(e) => update('country', e.target.value.toUpperCase())}
              className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="reg-currency" className="mb-1 block text-xs text-muted">Currency</label>
            <input
              id="reg-currency"
              type="text"
              required
              maxLength={3}
              value={form.currency}
              onChange={(e) => update('currency', e.target.value.toUpperCase())}
              className="w-full rounded-md border border-white/10 bg-card px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label htmlFor="reg-password" className="mb-1 block text-xs text-muted">Password</label>
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
            Confirm Password
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
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </Button>
        <p className="text-center text-xs text-muted">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => openModal('login')}
            className="text-accent hover:underline"
          >
            Login
          </button>
        </p>
      </form>
    </Modal>
  );
}
