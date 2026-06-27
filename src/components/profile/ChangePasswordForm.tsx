import { useState, type FormEvent } from 'react';
import { Button } from '@/components/common/Button';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { useTranslation } from '@/hooks/useTranslation';
import { getApiErrorMessage } from '@/utils/apiError';

export type ChangePasswordPayload = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

type ChangePasswordFormProps = {
  onChangePassword: (payload: ChangePasswordPayload) => Promise<unknown>;
  onSuccess?: () => void;
  translationNamespace?: 'profile' | 'affiliate';
};

export function ChangePasswordForm({
  onChangePassword,
  onSuccess,
  translationNamespace = 'profile',
}: ChangePasswordFormProps) {
  const { t } = useTranslation();
  const ns = translationNamespace;
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
      setPasswordError(getApiErrorMessage(err, t(`${ns}.passwordUpdateFailed`)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handlePasswordSubmit} className="space-y-4">
      <PasswordInput
        id="current-password"
        label={t('profile.currentPassword')}
        required
        autoComplete="current-password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <PasswordInput
        id="new-password"
        label={t(`${ns}.newPassword`)}
        required
        minLength={8}
        autoComplete="new-password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <PasswordInput
        id="confirm-new-password"
        label={t(`${ns}.confirmNewPassword`)}
        required
        minLength={8}
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      {passwordMessageKey === 'success' && (
        <p className="text-sm text-accent-gold">{t(`${ns}.passwordUpdateSuccess`)}</p>
      )}
      {passwordMessageKey === 'error' && (
        <p className="text-sm text-red-400">{passwordError}</p>
      )}
      <Button type="submit" disabled={saving}>
        {saving ? t('common.saving') : t(`${ns}.changePassword`)}
      </Button>
    </form>
  );
}
