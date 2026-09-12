import type { Game } from '@/types';
import { resolveAssetUrl} from '@/data/resolveAssetUrl';

const THUMBNAIL_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;
/** Prefer webp first when matching by game_code (VAGaming icons under casino-assets /providers/vagaming/). */
const CODE_THUMBNAIL_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg'] as const;
/** FunTa ships per-game icons as `{game_code}.jpg` under casino-assets /providers/funta/. */
const FUNTA_CODE_THUMBNAIL_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;
/** Dreamplay ships 287x193 icons as `{game_id}.png` under casino-assets /providers/dreamplay/. */
const DREAMPLAY_CODE_THUMBNAIL_EXTENSIONS = ['png', 'webp', 'jpg', 'jpeg'] as const;
/** TurboGames (direct Hub) lobby cards: 3:2 art as `{game_id}.png|jpg|webp` under casino-assets /providers/turbogames/. */
const TURBOGAMES_CODE_THUMBNAIL_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'] as const;
/** Zillion has no remote thumb API; lobby cards are `{game_id}.png` under casino-assets /providers/zillion/. */
const ZILLION_CODE_THUMBNAIL_EXTENSIONS = ['png', 'webp', 'jpg', 'jpeg'] as const;
/** JackTop has no remote thumb API; lobby cards use slugified names under /providers/jacktop/ (casino-assets). */
const JACKTOP_CODE_THUMBNAIL_EXTENSIONS = ['png', 'webp', 'jpg', 'jpeg'] as const;
/** Megafair has no remote thumb API; lobby cards are `{gameId}.png` under casino-assets /providers/megafair/. */
const MEGAFAIR_CODE_THUMBNAIL_EXTENSIONS = ['png', 'webp', 'jpg', 'jpeg'] as const;
/** CQ9 single-file cards under casino-assets /providers/cq9/{gamecode}.* (no bg/icon overlay). */
const CQ9_CODE_THUMBNAIL_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'] as const;
/** Lucky Heaven lobby cards: slugified game names as `{name}.jpg` under /providers/luckyheaven/. */
const LUCKYHEAVEN_CODE_THUMBNAIL_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;

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

function isDreamplaySlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  const key = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
  return key === 'dreamplay' || key.includes('dreamplay');
}

function isTurboGamesSlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  const key = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
  return key === 'turbogames' || key === 'turbo' || key.includes('turbogame');
}

function isZillionSlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  const key = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
  // Local folder is misspelled Zilion; product slug is zillion.
  return key === 'zillion' || key === 'zilion' || key.includes('zillion');
}

function isJacktopSlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  const key = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
  return key === 'jacktop' || key.includes('jacktop');
}

function isMegafairSlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  const key = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
  return key === 'megafair' || key.includes('megafair');
}

function isCq9Slug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  const key = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
  return key === 'cq9' || key.includes('cq9');
}

function isLuckyHeavenSlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  const key = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
  return key === 'luckyheaven' || key.includes('luckyheaven');
}

function providerFolders(game: Game): string[] {
  const folders = [game.vendor?.slug, game.provider?.slug].filter(
    (slug): slug is string => typeof slug === 'string' && slug.length > 0,
  );

  // FunTa hall external id is FTGSLOT; assets live under casino-assets /providers/funta/.
  if (folders.some(isFunTaSlug) && !folders.includes('funta')) {
    folders.push('funta');
  }

  if (folders.some(isDreamplaySlug) && !folders.includes('dreamplay')) {
    folders.push('dreamplay');
  }

  if (folders.some(isTurboGamesSlug) && !folders.includes('turbogames')) {
    folders.push('turbogames');
  }

  if (folders.some(isZillionSlug) && !folders.includes('zillion')) {
    folders.push('zillion');
  }

  if (folders.some(isJacktopSlug) && !folders.includes('jacktop')) {
    folders.push('jacktop');
  }

  if (folders.some(isMegafairSlug) && !folders.includes('megafair')) {
    folders.push('megafair');
  }

  if (folders.some(isCq9Slug) && !folders.includes('cq9')) {
    folders.push('cq9');
  }

  if (folders.some(isLuckyHeavenSlug) && !folders.includes('luckyheaven')) {
    folders.push('luckyheaven');
  }

  return [...new Set(folders)];
}

export function isCq9Game(game: Game): boolean {
  return [game.vendor?.slug, game.provider?.slug].some(isCq9Slug);
}

export function isFunTaGame(game: Game): boolean {
  return [game.vendor?.slug, game.provider?.slug].some(isFunTaSlug);
}

export function isDreamplayGame(game: Game): boolean {
  return [game.vendor?.slug, game.provider?.slug].some(isDreamplaySlug);
}

export function isTurboGamesGame(game: Game): boolean {
  return [game.vendor?.slug, game.provider?.slug].some(isTurboGamesSlug);
}

export function isZillionGame(game: Game): boolean {
  return [game.vendor?.slug, game.provider?.slug].some(isZillionSlug);
}

export function isJacktopGame(game: Game): boolean {
  return [game.vendor?.slug, game.provider?.slug].some(isJacktopSlug);
}

export function isMegafairGame(game: Game): boolean {
  return [game.vendor?.slug, game.provider?.slug].some(isMegafairSlug);
}

export function isLuckyHeavenGame(game: Game): boolean {
  return [game.vendor?.slug, game.provider?.slug].some(isLuckyHeavenSlug);
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

  const gameCode = game.game_code?.trim();
  const gameSlug = slugifyGameName(game.name);

  if (isJacktopGame(game)) {
    const jacktopExtensions = JACKTOP_CODE_THUMBNAIL_EXTENSIONS;
    if (gameSlug) {
      for (const ext of jacktopExtensions) {
        push(`/providers/jacktop/${gameSlug}.${ext}`);
        push(`/providers/jacktop/slot/${gameSlug}.${ext}`);
      }
    }
    return candidates;
  }

  // CQ9: only /providers/cq9/{gamecode}.* (flat singles; no bg/icon or cq9_ fallback).
  if (isCq9Game(game)) {
    if (gameCode) {
      for (const ext of CQ9_CODE_THUMBNAIL_EXTENSIONS) {
        push(`/providers/cq9/${gameCode}.${ext}`);
      }
    }
    return candidates;
  }

  const codeExtensions = isFunTaGame(game)
    ? FUNTA_CODE_THUMBNAIL_EXTENSIONS
    : isDreamplayGame(game)
      ? DREAMPLAY_CODE_THUMBNAIL_EXTENSIONS
      : isTurboGamesGame(game)
        ? TURBOGAMES_CODE_THUMBNAIL_EXTENSIONS
        : isZillionGame(game)
          ? ZILLION_CODE_THUMBNAIL_EXTENSIONS
          : isMegafairGame(game)
            ? MEGAFAIR_CODE_THUMBNAIL_EXTENSIONS
            : isLuckyHeavenGame(game)
              ? LUCKYHEAVEN_CODE_THUMBNAIL_EXTENSIONS
              : CODE_THUMBNAIL_EXTENSIONS;

  if (gameCode) {
    for (const folder of folders) {
      for (const ext of codeExtensions) {
        push(`/providers/${folder}/${gameCode}.${ext}`);
      }
    }
  }

  if (gameSlug) {
    const nameExtensions = isFunTaGame(game)
      ? FUNTA_CODE_THUMBNAIL_EXTENSIONS
      : isDreamplayGame(game)
        ? DREAMPLAY_CODE_THUMBNAIL_EXTENSIONS
        : isTurboGamesGame(game)
          ? TURBOGAMES_CODE_THUMBNAIL_EXTENSIONS
          : isZillionGame(game)
            ? ZILLION_CODE_THUMBNAIL_EXTENSIONS
            : isLuckyHeavenGame(game)
              ? LUCKYHEAVEN_CODE_THUMBNAIL_EXTENSIONS
              : THUMBNAIL_EXTENSIONS;
    for (const folder of folders) {
      // TPG (and similar) ship name-slug thumbs under casino-assets /providers/{slug}/games/.
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
    const resolved = resolveAssetUrl(game.thumbnail);
    if (resolved) candidates.push(resolved);
  }

  for (const url of getLocalGameThumbnailCandidates(game)) {
    const resolved = resolveAssetUrl(url);
    if (resolved && !candidates.includes(resolved)) {
      candidates.push(resolved);
    }
  }

  return candidates;
}

export function getGameThumbnailUrl(game: Game): string | null {
  return getGameThumbnailCandidates(game)[0] ?? null;
}
