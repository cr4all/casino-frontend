import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { playerApi } from '@/api/wallet.api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/common/Button';
import type { PlayerProfile } from '@/types';

export function ProfilePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    playerApi
      .getMe()
      .then((data) => {
        setProfile(data);
        setNickname(data.nickname ?? '');
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const updated = await playerApi.updateProfile({ nickname });
      setProfile(updated);
      setMessage('Profile updated successfully.');
    } catch {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-muted">Loading profile...</div>
    );
  }

  return (
    <div className="py-8 max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-white">My Profile</h1>
      <div className="rounded-lg bg-surface p-6 border border-white/5 shadow-card">
        <div className="mb-6 space-y-3">
          <div>
            <span className="text-xs text-muted">Email</span>
            <p className="text-sm text-white">{profile?.email}</p>
          </div>
          <div>
            <span className="text-xs text-muted">Status</span>
            <p className="text-sm capitalize text-accent-gold">{profile?.status}</p>
          </div>
          <div>
            <span className="text-xs text-muted">Currency</span>
            <p className="text-sm text-white">{profile?.currency ?? 'EUR'}</p>
          </div>
          <div>
            <span className="text-xs text-muted">Country</span>
            <p className="text-sm text-white">{profile?.country ?? '—'}</p>
          </div>
        </div>

        <div className="mb-6 border-b border-white/5 pb-6">
          <p className="mb-3 text-xs font-medium text-muted">Account</p>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/bets"
              className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white hover:border-accent/40 hover:text-accent"
            >
              Bet History
            </Link>
            <Link
              to="/transactions"
              className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white hover:border-accent/40 hover:text-accent"
            >
              Transactions
            </Link>
            <Link
              to="/deposit"
              className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white hover:border-accent/40 hover:text-accent"
            >
              Deposit
            </Link>
            <Link
              to="/withdraw"
              className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-white hover:border-accent/40 hover:text-accent"
            >
              Withdraw
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nickname" className="mb-1 block text-xs text-muted">
              Nickname
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
          {message && (
            <p className={`text-sm ${message.includes('success') ? 'text-accent-gold' : 'text-accent'}`}>
              {message}
            </p>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  );
}
