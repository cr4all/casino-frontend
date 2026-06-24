import { useEffect } from 'react';
import { isLanguage } from '@/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { usePlayerStore } from '@/stores/playerStore';

export function useLanguageInit() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAffiliateUser = useAuthStore((s) => s.user?.role === 'affiliate');
  const profileLanguage = usePlayerStore((s) => s.profile?.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  useEffect(() => {
    const stored = useLanguageStore.getState().language;
    document.documentElement.lang = stored;
  }, []);

  useEffect(() => {
    if (
      !isAuthenticated ||
      isAffiliateUser ||
      !profileLanguage ||
      !isLanguage(profileLanguage)
    ) {
      return;
    }

    setLanguage(profileLanguage);
  }, [isAuthenticated, isAffiliateUser, profileLanguage, setLanguage]);
}
