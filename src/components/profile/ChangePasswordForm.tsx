import { useState, type FormEvent } from 'react';
import { Button } from '@/components/common/Button';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { useTranslation } from '@/hooks/useTranslation';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  collectFieldErrors,
  hasFieldErrors,
  omitFieldError,
  requiredValue,
  type FieldErrors,
} from '@/utils/formValidation';

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validateForm = (): boolean => {
    const required = (field: string, value: string) =>
      requiredValue(value) ? undefined : t('common.fieldRequired', { field });

    let newPasswordError: string | undefined;
    if (!requiredValue(newPassword)) {
      newPasswordError = t('common.fieldRequired', { field: t(`${ns}.newPassword`) });
    } else if (newPassword.length < 8) {
      newPasswordError = t('common.fieldMinLength', { count: 8 });
    }

    let confirmError: string | undefined;
    if (!requiredValue(confirmPassword)) {
      confirmError = t('common.fieldRequired', { field: t(`${ns}.confirmNewPassword`) });
    } else if (newPassword !== confirmPassword) {
      confirmError = t('common.fieldPasswordMismatch');
    }

    const errors = collectFieldErrors([
      ['current_password', required(t('profile.currentPassword'), currentPassword)],
      ['password', newPasswordError],
      ['password_confirmation', confirmError],
    ]);

    setFieldErrors(errors);
    return !hasFieldErrors(errors);
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMessageKey('');
    setPasswordError('');
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setSaving(true);

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
    <form onSubmit={handlePasswordSubmit} noValidate className="space-y-4">
      <PasswordInput
        id="current-password"
        label={t('profile.currentPassword')}
        autoComplete="current-password"
        value={currentPassword}
        onChange={(e) => {
          setCurrentPassword(e.target.value);
          setFieldErrors((prev) => omitFieldError(prev, 'current_password'));
        }}
        error={fieldErrors.current_password}
      />
      <PasswordInput
        id="new-password"
        label={t(`${ns}.newPassword`)}
        autoComplete="new-password"
        value={newPassword}
        onChange={(e) => {
          setNewPassword(e.target.value);
          setFieldErrors((prev) => omitFieldError(prev, 'password'));
        }}
        error={fieldErrors.password}
      />
      <PasswordInput
        id="confirm-new-password"
        label={t(`${ns}.confirmNewPassword`)}
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          setFieldErrors((prev) => omitFieldError(prev, 'password_confirmation'));
        }}
        error={fieldErrors.password_confirmation}
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
