import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isLanguage, type Language } from '@/i18n';

const RTL_LANGUAGES = new Set<Language>(['ar', 'ar-ma', 'ar-dz', 'ar-tn', 'fa', 'he', 'ur']);
const DEFAULT_LANGUAGE: Language = 'en';

export function isRtlLanguage(language: Language): boolean {
  return RTL_LANGUAGES.has(language);
}

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
      language: DEFAULT_LANGUAGE,
      setLanguage: (language) => {
        applyDocumentLanguage(language);
        set({ language });
      },
    }),
    {
      name: 'ibets24-language',
      onRehydrateStorage: () => (state) => {
        if (!state?.language) return;

        if (!isLanguage(state.language)) {
          state.language = DEFAULT_LANGUAGE;
        }

        applyDocumentLanguage(state.language);
      },
    },
  ),
);
