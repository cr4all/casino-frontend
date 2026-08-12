import type { Game } from '@/types';

const THUMBNAIL_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;
/** Prefer webp first when matching by game_code (VAGaming icons are *.webp). */
const CODE_THUMBNAIL_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg'] as const;
/** FunTa ships per-game icons as `{game_code}.jpg` under /providers/funta/. */
const FUNTA_CODE_THUMBNAIL_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;
const CQ9_BG_EXTENSIONS = ['jpg', 'png', 'jpeg', 'webp'] as const;
const CQ9_ICON_EXTENSIONS = ['png', 'webp', 'jpg', 'jpeg'] as const;
/** Archived single-file CQ9 assets (pre-overlay). */
const CQ9_LEGACY_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'] as const;

function slugifyGameName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function isFunTaSlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  const key = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
  return key === 'funta' || key === 'ftgslot' || key.includes('funta');
}

function providerFolders(game: Game): string[] {
  const folders = [game.vendor?.slug, game.provider?.slug].filter(
    (slug): slug is string => typeof slug === 'string' && slug.length > 0,
  );

  // FunTa hall external id is FTGSLOT; assets live under /providers/funta/.
  if (folders.some(isFunTaSlug) && !folders.includes('funta')) {
    folders.push('funta');
  }

  return [...new Set(folders)];
}

export function isCq9Game(game: Game): boolean {
  return providerFolders(game).includes('cq9');
}

export function isFunTaGame(game: Game): boolean {
  return [game.vendor?.slug, game.provider?.slug].some(isFunTaSlug);
}

export type Cq9OverlayCandidates = {
  backgrounds: string[];
  icons: string[];
  /** Single-image fallbacks from archived /providers/cq9_ assets. */
  legacy: string[];
};

/** CQ9 demo-style layered assets: background + icon overlay by gamecode. */
export function getCq9OverlayCandidates(game: Game): Cq9OverlayCandidates | null {
  if (!isCq9Game(game)) return null;

  const gameCode = game.game_code?.trim();
  if (!gameCode) return null;

  const backgrounds = CQ9_BG_EXTENSIONS.map((ext) => `/providers/cq9/bg/${gameCode}.${ext}`);
  const icons = CQ9_ICON_EXTENSIONS.map((ext) => `/providers/cq9/icon/${gameCode}.${ext}`);
  const legacy = [
    ...CQ9_LEGACY_EXTENSIONS.map((ext) => `/providers/cq9_/${gameCode}.${ext}`),
    ...CQ9_LEGACY_EXTENSIONS.map((ext) => `/providers/cq9_/thumbs/${gameCode}.${ext}`),
  ];

  return { backgrounds, icons, legacy };
}

/** API thumbnail 없을 때 시도할 로컬 경로 목록 (우선순위 순) */
export function getLocalGameThumbnailCandidates(game: Game): string[] {
  const folders = providerFolders(game);
  if (folders.length === 0) return [];

  const candidates: string[] = [];
  const push = (url: string) => {
    if (!candidates.includes(url)) {
      candidates.push(url);
    }
  };

  // CQ9 uses layered bg+icon rendering; expose icon (then legacy) for single-img callers.
  const cq9 = getCq9OverlayCandidates(game);
  if (cq9) {
    for (const url of [...cq9.icons, ...cq9.legacy]) {
      push(url);
    }
    return candidates;
  }

  const gameCode = game.game_code?.trim();
  const codeExtensions = isFunTaGame(game)
    ? FUNTA_CODE_THUMBNAIL_EXTENSIONS
    : CODE_THUMBNAIL_EXTENSIONS;

  if (gameCode) {
    for (const folder of folders) {
      for (const ext of codeExtensions) {
        push(`/providers/${folder}/${gameCode}.${ext}`);
      }
    }
  }

  const gameSlug = slugifyGameName(game.name);
  if (gameSlug) {
    const nameExtensions = isFunTaGame(game)
      ? FUNTA_CODE_THUMBNAIL_EXTENSIONS
      : THUMBNAIL_EXTENSIONS;
    for (const folder of folders) {
      // TPG (and similar) ship name-slug thumbs under /providers/{slug}/games/.
      for (const ext of nameExtensions) {
        push(`/providers/${folder}/games/${gameSlug}.${ext}`);
      }
      for (const ext of nameExtensions) {
        push(`/providers/${folder}/${gameSlug}.${ext}`);
      }
    }
  }

  return candidates;
}

/** API thumbnail + 로컬 fallback 후보 (중복 제거, 우선순위 유지) */
export function getGameThumbnailCandidates(game: Game): string[] {
  const candidates: string[] = [];

  if (game.thumbnail) {
    candidates.push(game.thumbnail);
  }

  for (const url of getLocalGameThumbnailCandidates(game)) {
    if (!candidates.includes(url)) {
      candidates.push(url);
    }
  }

  return candidates;
}

export function getGameThumbnailUrl(game: Game): string | null {
  return getGameThumbnailCandidates(game)[0] ?? null;
}
