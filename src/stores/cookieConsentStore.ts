import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type CookieConsentLevel = 'pending' | 'necessary' | 'custom' | 'all';

export interface CookiePreferences {
  analytics: boolean;
  chat: boolean;
}

interface CookieConsentState {
  level: CookieConsentLevel;
  preferences: CookiePreferences;
  settingsOpen: boolean;
  hasHydrated: boolean;
  acceptAll: () => void;
  acceptNecessary: () => void;
  savePreferences: (preferences: CookiePreferences) => void;
  openSettings: () => void;
  closeSettings: () => void;
  setHasHydrated: (value: boolean) => void;
}

const ALL_PREFERENCES: CookiePreferences = { analytics: true, chat: true };
const NECESSARY_PREFERENCES: CookiePreferences = { analytics: false, chat: false };

function deriveLevel(preferences: CookiePreferences): CookieConsentLevel {
  if (!preferences.analytics && !preferences.chat) return 'necessary';
  if (preferences.analytics && preferences.chat) return 'all';
  return 'custom';
}

function markCookieConsentHydrated() {
  // localStorage rehydration is sync and can finish during create(), before the
  // const binding exists — defer so we never hit the TDZ and leave hasHydrated false.
  queueMicrotask(() => {
    useCookieConsentStore.setState({ hasHydrated: true });
  });
}

export const useCookieConsentStore = create<CookieConsentState>()(
  persist(
    (set) => ({
      level: 'pending',
      preferences: NECESSARY_PREFERENCES,
      settingsOpen: false,
      hasHydrated: false,

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
          level: deriveLevel(preferences),
          preferences: {
            analytics: preferences.analytics,
            chat: preferences.chat,
          },
          settingsOpen: false,
        }),

      openSettings: () => set({ settingsOpen: true }),
      closeSettings: () => set({ settingsOpen: false }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'ibets24-cookie-consent',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        level: state.level,
        preferences: state.preferences,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<CookieConsentState> | undefined;
        const current = currentState as CookieConsentState;

        if (!persisted?.level) {
          return current;
        }

        return {
          ...current,
          level: persisted.level,
          preferences: {
            analytics: persisted.preferences?.analytics ?? false,
            chat: persisted.preferences?.chat ?? false,
          },
        };
      },
      // Defer past create() TDZ: sync localStorage rehydrate can finish during create(),
      // and referencing useCookieConsentStore inline would throw before setHasHydrated runs.
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Cookie consent rehydration failed', error);
        }
        markCookieConsentHydrated();
      },
    },
  ),
);

// Backup if rehydration already finished before listeners were attached.
if (useCookieConsentStore.persist.hasHydrated()) {
  markCookieConsentHydrated();
} else {
  useCookieConsentStore.persist.onFinishHydration(() => {
    markCookieConsentHydrated();
  });
}

export function canLoadChat(level: CookieConsentLevel, preferences: CookiePreferences): boolean {
  return level !== 'pending' && preferences.chat;
}

export function canLoadAnalytics(level: CookieConsentLevel, preferences: CookiePreferences): boolean {
  return level !== 'pending' && preferences.analytics;
}
