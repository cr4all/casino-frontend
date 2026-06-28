import { useCallback } from 'react';
import { playerApi } from '@/api/wallet.api';
import { useAuthStore } from '@/stores/authStore';
import { usePlayerStore } from '@/stores/playerStore';
import {
  LANGUAGES,
  translate,
  translateBonusType,
  translateCollectionSlug,
  translateGameType,
  translateDestinationField,
  translatePaymentInfoField,
  translatePaymentMethod,
  translatePaymentOptionLabel,
  translatePaymentType,
  translateStatus,
  translateTxType,
  type Language,
} from '@/i18n';
import { formatDateTime } from '@/utils/formatDateTime';
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
      const { isAuthenticated, user } = useAuthStore.getState();
      if (!isAuthenticated || user?.role === 'affiliate') {
        return;
      }

      try {
        const updated = await playerApi.updateProfile({ language: next });
        usePlayerStore.getState().setProfile(updated);
      } catch {
        // keep local preference even if sync fails
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

  const tPaymentMethod = useCallback(
    (name: string | null | undefined) => translatePaymentMethod(language, name),
    [language],
  );

  const tPaymentOptionLabel = useCallback(
    (label: string | null | undefined) => translatePaymentOptionLabel(language, label),
    [language],
  );

  const tPaymentInfoField = useCallback(
    (fieldKey: string) => translatePaymentInfoField(language, fieldKey),
    [language],
  );

  const tDestinationField = useCallback(
    (fieldName: string, fallbackLabel: string) => translateDestinationField(language, fieldName, fallbackLabel),
    [language],
  );

  const tPaymentType = useCallback(
    (type: string | null | undefined) => translatePaymentType(language, type),
    [language],
  );

  const tTxType = useCallback((type: string) => translateTxType(language, type), [language]);

  const formatDate = useCallback(
    (value: string | null | undefined) => formatDateTime(value, language),
    [language],
  );

  const tBonusType = useCallback((type: string) => translateBonusType(language, type), [language]);

  return {
    language,
    languages: LANGUAGES,
    t,
    tGameType,
    tCollection,
    tStatus,
    tPaymentMethod,
    tPaymentOptionLabel,
    tPaymentInfoField,
    tDestinationField,
    tPaymentType,
    tTxType,
    tBonusType,
    formatDate,
    changeLanguage,
    setLanguage,
  };
}
