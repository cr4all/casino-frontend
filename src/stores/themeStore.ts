import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const THEME_STORAGE_KEY = 'ibets24-theme';

export type Theme = 'dark' | 'light';

const DEFAULT_THEME: Theme = 'dark';

export function isTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light';
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

function readStoredTheme(): Theme {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return DEFAULT_THEME;

    const parsed = JSON.parse(raw) as { state?: { theme?: unknown } };
    if (isTheme(parsed?.state?.theme)) {
      return parsed.state.theme;
    }
  } catch {
    // fall through to default
  }

  return DEFAULT_THEME;
}

const initialTheme = typeof window !== 'undefined' ? readStoredTheme() : DEFAULT_THEME;

if (typeof document !== 'undefined') {
  applyTheme(initialTheme);
}

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: initialTheme,
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () => {
        const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        set({ theme: next });
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const theme = isTheme(state.theme) ? state.theme : DEFAULT_THEME;
        if (theme !== state.theme) {
          state.theme = theme;
        }
        applyTheme(theme);
      },
    },
  ),
);

/** Re-apply after mount (covers late rehydrate). */
export function initThemePreference(): void {
  applyTheme(useThemeStore.getState().theme);
}
