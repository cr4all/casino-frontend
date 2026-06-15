import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { playerApi } from '@/api/wallet.api';
import { useAuthStore } from '@/stores/authStore';
import { usePlayerStore } from '@/stores/playerStore';
import { DEFAULT_CURRENCY } from '@/stores/walletStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/common/Button';
import { LanguageSelector } from '@/components/common/LanguageSelector';

export function ProfilePage() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const profile = usePlayerStore((s) => s.profile);
  const fetchProfile = usePlayerStore((s) => s.fetchProfile);
  const setProfile = usePlayerStore((s) => s.setProfile);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [messageKey, setMessageKey] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    if (!isAuthenticated) return;

    if (profile) {
      setNickname(profile.nickname ?? '');
      setLoading(false);
      return;
    }

    fetchProfile()
      .then((data) => {
        if (data) setNickname(data.nickname ?? '');
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, profile, fetchProfile]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessageKey('');
    try {
      const updated = await playerApi.updateProfile({ nickname });
      setProfile(updated);
      setMessageKey('success');
    } catch {
      setMessageKey('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-muted">{t('common.loadingProfile')}</div>
    );
  }

  return (
    <div className="py-8 max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-white">{t('profile.title')}</h1>
      <div className="rounded-lg bg-surface p-6 border border-white/5 shadow-card">
        <div className="mb-6 space-y-3">
          <div>
            <span className="text-xs text-muted">{t('profile.email')}</span>
            <p className="text-sm text-white">{profile?.email}</p>
          </div>
          <div>
            <span className="text-xs text-muted">{t('profile.status')}</span>
            <p className="text-sm capitalize text-accent-gold">{profile?.status}</p>
          </div>
          <div>
            <span className="text-xs text-muted">{t('profile.currency')}</span>
            <p className="text-sm text-white">{profile?.currency ?? DEFAULT_CURRENCY}</p>
          </div>
          <div>
            <span className="text-xs text-muted">{t('profile.country')}</span>
            <p className="text-sm text-white">{profile?.country ?? '—'}</p>
          </div>
        </div>

        <div className="mb-6 border-b border-white/5 pb-6">
          <p className="mb-3 text-xs font-medium text-muted">{t('profile.account')}</p>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/transactions"
              className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white hover:border-accent/40 hover:text-accent"
            >
              {t('nav.transactions')}
            </Link>
            <Link
              to="/deposit"
              className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white hover:border-accent/40 hover:text-accent"
            >
              {t('nav.depositLabel')}
            </Link>
            <Link
              to="/withdraw"
              className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white hover:border-accent/40 hover:text-accent"
            >
              {t('nav.withdrawLabel')}
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <LanguageSelector variant="profile" />
          <div>
            <label htmlFor="nickname" className="mb-1 block text-xs text-muted">
              {t('auth.nickname')}
            </label>
            <input
              id="nickname"
              type="text"
              maxLength={50}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-card px-3 py-2.5 text-sm text-white focus:border-accent focus:outline-none"
            />
          </div>
          {messageKey && (
            <p className={`text-sm ${messageKey === 'success' ? 'text-accent-gold' : 'text-accent'}`}>
              {messageKey === 'success' ? t('profile.updateSuccess') : t('profile.updateFailed')}
            </p>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? t('common.saving') : t('profile.saveChanges')}
          </Button>
        </form>
      </div>
    </div>
  );
}
