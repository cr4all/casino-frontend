import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** v3: outdoor is CSS default; indoor-contrast class only when turned off. */
const STORAGE_KEY = 'ibets24-contrast-v3';

function applyContrastMode(outdoorEnabled: boolean): void {
  if (typeof document === 'undefined') return;
  // Outdoor = default theme (no special class). Indoor = opt-in dark class.
  document.documentElement.classList.toggle('indoor-contrast', !outdoorEnabled);
  document.documentElement.classList.remove('high-contrast');
}

function readInitialOutdoor(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { highContrast?: boolean } };
      if (typeof parsed?.state?.highContrast === 'boolean') {
        return parsed.state.highContrast;
      }
    }
  } catch {
    // fall through to default
  }

  return true;
}

const initialOutdoor =
  typeof window !== 'undefined' ? readInitialOutdoor() : true;

if (typeof document !== 'undefined') {
  applyContrastMode(initialOutdoor);
}

interface ContrastState {
  /** true = outdoor (bright, default), false = indoor (dark) */
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  toggleHighContrast: () => void;
}

export const useContrastStore = create<ContrastState>()(
  persist(
    (set, get) => ({
      highContrast: initialOutdoor,
      setHighContrast: (enabled) => {
        applyContrastMode(enabled);
        set({ highContrast: enabled });
      },
      toggleHighContrast: () => {
        const next = !get().highContrast;
        applyContrastMode(next);
        set({ highContrast: next });
      },
    }),
    {
      name: STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        applyContrastMode(state.highContrast);
      },
    },
  ),
);

/** Re-apply after mount (covers late rehydrate). */
export function initContrastPreference(): void {
  applyContrastMode(useContrastStore.getState().highContrast);
}
