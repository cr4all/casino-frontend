import { useState, type FormEvent } from 'react';
import { Button } from '@/components/common/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { getApiErrorMessage } from '@/utils/apiError';

export type ChangePasswordPayload = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

const inputClassName =
  'w-full rounded-md border border-white/10 bg-card px-3 py-2.5 text-sm text-white focus:border-accent focus:outline-none';

type ChangePasswordFormProps = {
  onChangePassword: (payload: ChangePasswordPayload) => Promise<void>;
  onSuccess?: () => void;
};

export function ChangePasswordForm({ onChangePassword, onSuccess }: ChangePasswordFormProps) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [passwordMessageKey, setPasswordMessageKey] = useState<'success' | 'error' | ''>('');
  const [passwordError, setPasswordError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setPasswordMessageKey('');
    setPasswordError('');

    try {
      await onChangePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessageKey('success');
      onSuccess?.();
    } catch (err) {
      setPasswordMessageKey('error');
      setPasswordError(getApiErrorMessage(err, t('profile.passwordUpdateFailed')));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handlePasswordSubmit} className="space-y-4">
      <div>
        <label htmlFor="current-password" className="mb-1 block text-xs font-medium text-muted">
          {t('profile.currentPassword')}
        </label>
        <input
          id="current-password"
          type="password"
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className={inputClassName}
        />
      </div>
      <div>
        <label htmlFor="new-password" className="mb-1 block text-xs font-medium text-muted">
          {t('profile.newPassword')}
        </label>
        <input
          id="new-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={inputClassName}
        />
      </div>
      <div>
        <label htmlFor="confirm-new-password" className="mb-1 block text-xs font-medium text-muted">
          {t('profile.confirmNewPassword')}
        </label>
        <input
          id="confirm-new-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputClassName}
        />
      </div>
      {passwordMessageKey === 'success' && (
        <p className="text-sm text-accent-gold">{t('profile.passwordUpdateSuccess')}</p>
      )}
      {passwordMessageKey === 'error' && (
        <p className="text-sm text-red-400">{passwordError}</p>
      )}
      <Button type="submit" disabled={saving}>
        {saving ? t('common.saving') : t('profile.changePassword')}
      </Button>
    </form>
  );
}
