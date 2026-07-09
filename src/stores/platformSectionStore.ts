import { create } from 'zustand';

export type PlatformSection = 'casino' | 'sports';

const SIDEBAR_SECTION_KEY = 'casino-sidebar-section';

export function resolvePlatformSection(pathname: string): PlatformSection {
  return pathname.startsWith('/sports') ? 'sports' : 'casino';
}

function readInitialSection(): PlatformSection {
  if (typeof window === 'undefined') {
    return 'casino';
  }

  return resolvePlatformSection(window.location.pathname);
}

interface PlatformSectionState {
  section: PlatformSection;
  setSection: (section: PlatformSection) => void;
  syncFromPathname: (pathname: string) => void;
}

export const usePlatformSectionStore = create<PlatformSectionState>((set) => ({
  section: readInitialSection(),

  setSection: (section) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SIDEBAR_SECTION_KEY, section);
    }
    set({ section });
  },

  syncFromPathname: (pathname) => {
    const section = resolvePlatformSection(pathname);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SIDEBAR_SECTION_KEY, section);
    }
    set({ section });
  },
}));
