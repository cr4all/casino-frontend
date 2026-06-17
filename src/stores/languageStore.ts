import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language } from '@/i18n';

const RTL_LANGUAGES = new Set<Language>(['ar', 'ur']);

function applyDocumentLanguage(language: Language): void {
  document.documentElement.lang = language;
  document.documentElement.dir = RTL_LANGUAGES.has(language) ? 'rtl' : 'ltr';
}

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => {
        applyDocumentLanguage(language);
        set({ language });
      },
    }),
    {
      name: 'ibets24-language',
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          applyDocumentLanguage(state.language);
        }
      },
    },
  ),
);
