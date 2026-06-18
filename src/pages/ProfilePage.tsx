import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { playerApi } from '@/api/wallet.api';
import { useAuthStore } from '@/stores/authStore';
import { usePlayerStore } from '@/stores/playerStore';
import { DEFAULT_CURRENCY } from '@/stores/walletStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AccountVerificationModal } from '@/components/profile/AccountVerificationModal';
import { VerificationIndicator } from '@/components/profile/VerificationIndicator';
import { formatCountryLabel } from '@/utils/formatCountryLabel';
import { getApiErrorMessage } from '@/utils/apiError';
import type { PlayerProfile } from '@/types';

function ProfileField({
  label,
  children,
  variant = 'default',
}: {
  label: string;
  children: ReactNode;
  variant?: 'default' | 'featured' | 'compact';
}) {
  const shellClass =
    variant === 'featured'
      ? 'rounded-xl border border-white/10 bg-card/50 px-5 py-4'
      : variant === 'compact'
        ? 'rounded-lg border border-white/5 bg-card/30 px-3 py-2.5'
        : 'rounded-lg border border-white/5 bg-card/40 px-4 py-3';

  const labelClass =
    variant === 'featured'
      ? 'text-xs font-semibold uppercase tracking-wider text-muted'
      : 'text-[10px] font-medium uppercase tracking-wider text-muted';

  const valueClass =
    variant === 'featured'
      ? 'mt-2 text-base font-medium leading-relaxed text-white'
      : variant === 'compact'
        ? 'mt-1 text-xs text-white'
        : 'mt-1 text-sm text-white';

  return (
    <div className={shellClass}>
      <p className={labelClass}>{label}</p>
      <div className={valueClass}>{children}</div>
    </div>
  );
}

const inputClassName =
  'w-full rounded-md border border-white/10 bg-card px-3 py-2.5 text-sm text-white focus:border-accent focus:outline-none';

export function ProfilePage() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const profile = usePlayerStore((s) => s.profile);
  const fetchProfile = usePlayerStore((s) => s.fetchProfile);
  const setProfile = usePlayerStore((s) => s.setProfile);
  const [loading, setLoading] = useState(true);
  const [verifyChannel, setVerifyChannel] = useState<'email' | 'phone' | null>(null);
  const [saving, setSaving] = useState(false);
  const [passwordMessageKey, setPasswordMessageKey] = useState<'success' | 'error' | ''>('');
  const [passwordError, setPasswordError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;

    if (profile) {
      setLoading(false);
      return;
    }

    fetchProfile().finally(() => setLoading(false));
  }, [isAuthenticated, profile, fetchProfile]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setPasswordMessageKey('');
    setPasswordError('');

    try {
      await playerApi.changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessageKey('success');
    } catch (err) {
      setPasswordMessageKey('error');
      setPasswordError(getApiErrorMessage(err, t('profile.passwordUpdateFailed')));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-muted">{t('common.loadingProfile')}</div>
    );
  }

  const countryLabel = formatCountryLabel(profile?.country, profile?.country_name);

  const handleVerified = (updated: PlayerProfile) => {
    setProfile(updated);
  };

  return (
    <div className="mx-auto max-w-4xl py-8">
      <AccountVerificationModal
        channel={verifyChannel}
        destination={
          verifyChannel === 'email' ? profile?.email ?? '' : profile?.phone ?? ''
        }
        onClose={() => setVerifyChannel(null)}
        onVerified={handleVerified}
      />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t('profile.title')}</h1>
        <p className="mt-1 text-sm text-muted">{profile?.email ?? '—'}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-white/10 bg-surface/90 p-6 shadow-card">
            <h2 className="mb-4 text-sm font-semibold text-white">{t('profile.accountDetails')}</h2>
            <div className="space-y-3">
              <ProfileField variant="featured" label={t('profile.email')}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="break-all">{profile?.email ?? '—'}</span>
                  {profile?.email && (
                    <VerificationIndicator
                      verified={profile.email_verified ?? false}
                      onVerify={
                        profile.email_verified ? undefined : () => setVerifyChannel('email')
                      }
                    />
                  )}
                </div>
              </ProfileField>

              <ProfileField variant="featured" label={t('profile.phone')}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span>{profile?.phone ?? '—'}</span>
                  {profile?.phone && (
                    <VerificationIndicator
                      verified={profile.phone_verified ?? false}
                      onVerify={
                        profile.phone_verified ? undefined : () => setVerifyChannel('phone')
                      }
                    />
                  )}
                </div>
              </ProfileField>

              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <ProfileField variant="compact" label={t('auth.username')}>
                    <span className="truncate">{profile?.nickname ?? '—'}</span>
                  </ProfileField>
                  <ProfileField variant="compact" label={t('profile.country')}>
                    <span className="truncate">{countryLabel}</span>
                  </ProfileField>
                  <ProfileField variant="compact" label={t('profile.currency')}>
                    <span>{profile?.currency ?? DEFAULT_CURRENCY}</span>
                  </ProfileField>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <ProfileField variant="compact" label={t('profile.status')}>
                    {profile?.status ? <StatusBadge status={profile.status} /> : '—'}
                  </ProfileField>
                  <ProfileField variant="compact" label={t('profile.kycStatus')}>
                    {profile?.kyc_status ? <StatusBadge status={profile.kyc_status} /> : '—'}
                  </ProfileField>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-surface/90 p-6 shadow-card">
            <h2 className="mb-4 text-sm font-semibold text-white">{t('profile.changePassword')}</h2>
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
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-white/10 bg-surface/90 p-6 shadow-card">
            <h2 className="mb-4 text-sm font-semibold text-white">{t('profile.quickActions')}</h2>
            <div className="flex flex-col gap-2">
              <Link
                to="/transactions"
                className="rounded-lg border border-white/10 bg-card/50 px-4 py-3 text-sm text-white transition-colors hover:border-accent/40 hover:text-accent"
              >
                {t('nav.transactions')}
              </Link>
              <Link
                to="/deposit"
                className="rounded-lg border border-white/10 bg-card/50 px-4 py-3 text-sm text-white transition-colors hover:border-accent/40 hover:text-accent"
              >
                {t('nav.depositLabel')}
              </Link>
              <Link
                to="/withdraw"
                className="rounded-lg border border-white/10 bg-card/50 px-4 py-3 text-sm text-white transition-colors hover:border-accent/40 hover:text-accent"
              >
                {t('nav.withdrawLabel')}
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
