import { useEffect, useState, type ReactNode } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { PlayerLevelBadge } from '@/components/player/PlayerLevelBadge';
import { VipLevelsModal } from '@/components/player/VipLevelsModal';
import { ProfileService } from '@/services/ProfileService';
import { useAuthStore } from '@/stores/authStore';
import { usePlayerStore } from '@/stores/playerStore';
import { DEFAULT_CURRENCY } from '@/stores/walletStore';
import { useTranslation } from '@/hooks/useTranslation';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AccountVerificationModal } from '@/components/profile/AccountVerificationModal';
import { KycVerificationModal } from '@/components/profile/KycVerificationModal';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';
import { VerificationIndicator } from '@/components/profile/VerificationIndicator';
import { formatCountryLabel } from '@/utils/formatCountryLabel';
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

export function ProfilePage() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const profile = usePlayerStore((s) => s.profile);
  const fetchProfile = usePlayerStore((s) => s.fetchProfile);
  const setProfile = usePlayerStore((s) => s.setProfile);
  const [loading, setLoading] = useState(true);
  const [verifyChannel, setVerifyChannel] = useState<'email' | 'phone' | null>(null);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [vipModalOpen, setVipModalOpen] = useState(false);

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

  if (loading) {
    return (
      <div className="py-12 text-center text-muted">{t('common.loadingProfile')}</div>
    );
  }

  const countryLabel = formatCountryLabel(profile?.country, profile?.country_name);
  const kycVerified = profile?.kyc_status === 'verified';

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
      <KycVerificationModal
        isOpen={kycModalOpen}
        profile={profile}
        onClose={() => {
          setKycModalOpen(false);
          void fetchProfile(true);
        }}
        onUpdated={handleVerified}
      />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{t('profile.title')}</h1>
        <p className="mt-1 text-sm text-muted">{profile?.email ?? '—'}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-white/10 bg-surface/90 p-6 shadow-card">
            <h2 className="mb-4 text-sm font-semibold text-white">{t('profile.vipStatus')}</h2>
            <div className="flex flex-wrap items-center gap-4">
              <PlayerLevelBadge
                slug={profile?.vip_level_slug ?? 'regular'}
                name={profile?.vip_level_name ?? 'Regular'}
                size={40}
              />
              <div>
                <p className="text-lg font-semibold text-white">
                  {profile?.vip_level_name ?? 'Regular'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setVipModalOpen(true)}
              className="mt-4 text-sm text-accent-gold hover:underline"
            >
              {t('profile.viewAllVipLevels')}
            </button>
          </section>

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

              <ProfileField variant="featured" label={t('profile.kyc')}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <VerificationIndicator
                    verified={kycVerified}
                    onVerify={
                      kycVerified
                        ? undefined
                        : () => setKycModalOpen(true)
                    }
                  />
                </div>
              </ProfileField>

              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ProfileField variant="compact" label={t('auth.username')}>
                    <span className="truncate">{profile?.nickname ?? '—'}</span>
                  </ProfileField>
                  <ProfileField variant="compact" label={t('profile.status')}>
                    {profile?.status ? <StatusBadge status={profile.status} /> : '—'}
                  </ProfileField>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <ProfileField variant="compact" label={t('profile.country')}>
                    <span className="truncate">{countryLabel}</span>
                  </ProfileField>
                  <ProfileField variant="compact" label={t('profile.currency')}>
                    <span>{profile?.currency ?? DEFAULT_CURRENCY}</span>
                  </ProfileField>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-surface/90 p-6 shadow-card">
            <h2 className="mb-4 text-sm font-semibold text-white">{t('profile.changePassword')}</h2>
            <ChangePasswordForm onChangePassword={ProfileService.changePassword} />
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

      {vipModalOpen && (
        <VipLevelsModal
          currentLevel={profile?.vip_level ?? 0}
          onClose={() => setVipModalOpen(false)}
        />
      )}
    </div>
  );
}
