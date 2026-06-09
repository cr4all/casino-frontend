import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '@/i18n';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => {
        document.documentElement.lang = language;
        set({ language });
      },
    }),
    {
      name: 'ibets24-language',
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          document.documentElement.lang = state.language;
        }
      },
    },
  ),
);
