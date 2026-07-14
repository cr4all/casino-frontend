import { create } from 'zustand';

export type PlatformSection = 'casino' | 'sports';

const SIDEBAR_SECTION_KEY = 'casino-sidebar-section';

function isSportsPath(pathname: string): boolean {
  return pathname.startsWith('/sports');
}

/** Routes that belong exclusively to the casino lobby experience. */
function isCasinoExclusivePath(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname.startsWith('/category') ||
    pathname.startsWith('/games') ||
    pathname.startsWith('/providers') ||
    pathname.startsWith('/search')
  );
}

export function resolvePlatformSection(pathname: string): PlatformSection {
  if (isSportsPath(pathname)) {
    return 'sports';
  }

  if (isCasinoExclusivePath(pathname)) {
    return 'casino';
  }

  return 'casino';
}

function readStoredSection(): PlatformSection | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = window.localStorage.getItem(SIDEBAR_SECTION_KEY);
  return stored === 'sports' || stored === 'casino' ? stored : null;
}

function persistSection(section: PlatformSection) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SIDEBAR_SECTION_KEY, section);
  }
}

function readInitialSection(): PlatformSection {
  if (typeof window === 'undefined') {
    return 'casino';
  }

  const pathname = window.location.pathname;

  if (isSportsPath(pathname)) {
    return 'sports';
  }

  if (isCasinoExclusivePath(pathname)) {
    return 'casino';
  }

  return readStoredSection() ?? 'casino';
}

interface PlatformSectionState {
  section: PlatformSection;
  setSection: (section: PlatformSection) => void;
  syncFromPathname: (pathname: string) => void;
}

export const usePlatformSectionStore = create<PlatformSectionState>((set, get) => ({
  section: readInitialSection(),

  setSection: (section) => {
    persistSection(section);
    set({ section });
  },

  syncFromPathname: (pathname) => {
    if (isSportsPath(pathname)) {
      persistSection('sports');
      set({ section: 'sports' });
      return;
    }

    if (isCasinoExclusivePath(pathname)) {
      persistSection('casino');
      set({ section: 'casino' });
      return;
    }

    // Shared account pages (deposit, withdraw, notices, …): keep current section.
    const current = get().section;
    persistSection(current);
  },
}));
