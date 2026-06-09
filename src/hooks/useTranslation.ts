import { useCallback } from 'react';
import { playerApi } from '@/api/wallet.api';
import { useAuthStore } from '@/stores/authStore';
import {
  LANGUAGES,
  translate,
  translateCollectionSlug,
  translateGameType,
  translateStatus,
  type Language,
} from '@/i18n';
import { useLanguageStore } from '@/stores/languageStore';

export function useTranslation() {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(language, key, params),
    [language],
  );

  const changeLanguage = useCallback(
    async (next: Language) => {
      setLanguage(next);
      if (useAuthStore.getState().isAuthenticated) {
        try {
          await playerApi.updateProfile({ language: next });
        } catch {
          // keep local preference even if sync fails
        }
      }
    },
    [setLanguage],
  );

  const tGameType = useCallback(
    (slug: string, fallbackName: string) => translateGameType(language, slug, fallbackName),
    [language],
  );

  const tCollection = useCallback(
    (slug: string) => translateCollectionSlug(language, slug),
    [language],
  );

  const tStatus = useCallback((status: string) => translateStatus(language, status), [language]);

  return {
    language,
    languages: LANGUAGES,
    t,
    tGameType,
    tCollection,
    tStatus,
    changeLanguage,
    setLanguage,
  };
}
