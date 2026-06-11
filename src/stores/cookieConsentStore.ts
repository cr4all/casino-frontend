import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type CookieConsentLevel = 'pending' | 'necessary' | 'all';

export interface CookiePreferences {
  analytics: boolean;
  chat: boolean;
}

interface CookieConsentState {
  level: CookieConsentLevel;
  preferences: CookiePreferences;
  settingsOpen: boolean;
  acceptAll: () => void;
  acceptNecessary: () => void;
  savePreferences: (preferences: CookiePreferences) => void;
  openSettings: () => void;
  closeSettings: () => void;
}

const ALL_PREFERENCES: CookiePreferences = { analytics: true, chat: true };
const NECESSARY_PREFERENCES: CookiePreferences = { analytics: false, chat: false };

export const useCookieConsentStore = create<CookieConsentState>()(
  persist(
    (set) => ({
      level: 'pending',
      preferences: NECESSARY_PREFERENCES,
      settingsOpen: false,

      acceptAll: () =>
        set({
          level: 'all',
          preferences: ALL_PREFERENCES,
          settingsOpen: false,
        }),

      acceptNecessary: () =>
        set({
          level: 'necessary',
          preferences: NECESSARY_PREFERENCES,
          settingsOpen: false,
        }),

      savePreferences: (preferences) =>
        set({
          level: preferences.analytics || preferences.chat ? 'all' : 'necessary',
          preferences,
          settingsOpen: false,
        }),

      openSettings: () => set({ settingsOpen: true }),
      closeSettings: () => set({ settingsOpen: false }),
    }),
    {
      name: 'ibets24-cookie-consent',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        level: state.level,
        preferences: state.preferences,
      }),
    },
  ),
);

export function canLoadChat(level: CookieConsentLevel, preferences: CookiePreferences): boolean {
  return level !== 'pending' && preferences.chat;
}

export function canLoadAnalytics(level: CookieConsentLevel, preferences: CookiePreferences): boolean {
  return level !== 'pending' && preferences.analytics;
}
