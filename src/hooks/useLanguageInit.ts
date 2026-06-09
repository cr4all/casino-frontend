import { useEffect } from 'react';
import { playerApi } from '@/api/wallet.api';
import { isLanguage } from '@/i18n';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';

export function useLanguageInit() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  useEffect(() => {
    const stored = useLanguageStore.getState().language;
    document.documentElement.lang = stored;
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    playerApi
      .getMe()
      .then((profile) => {
        if (profile.language && isLanguage(profile.language)) {
          setLanguage(profile.language);
        }
      })
      .catch(() => undefined);
  }, [isAuthenticated, setLanguage]);
}
