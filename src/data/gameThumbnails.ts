import type { Game } from '@/types';

const THUMBNAIL_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;
/** Prefer webp first when matching by game_code (VAGaming icons are *.webp). */
const CODE_THUMBNAIL_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg'] as const;
/** CQ9 icons are PNG under /providers/cq9/thumbs — skip webp 404 churn. */
const CQ9_CODE_THUMBNAIL_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'] as const;

function slugifyGameName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function providerFolders(game: Game): string[] {
  const folders = [game.vendor?.slug, game.provider?.slug].filter(
    (slug): slug is string => typeof slug === 'string' && slug.length > 0,
  );

  return [...new Set(folders)];
}

function cq9ThumbPath(fileBase: string, ext: string): string {
  // New path breaks CDN/browser caches that still serve old VIP placeholders.
  return `/providers/cq9/thumbs/${fileBase}.${ext}?v=5`;
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
  if (gameCode) {
    for (const folder of folders) {
      if (folder === 'cq9') {
        for (const ext of CQ9_CODE_THUMBNAIL_EXTENSIONS) {
          push(cq9ThumbPath(gameCode, ext));
        }
        continue;
      }
      for (const ext of CODE_THUMBNAIL_EXTENSIONS) {
        push(`/providers/${folder}/${gameCode}.${ext}`);
      }
    }
  }

  const gameSlug = slugifyGameName(game.name);
  if (gameSlug) {
    for (const folder of folders) {
      if (folder === 'cq9') {
        for (const ext of THUMBNAIL_EXTENSIONS) {
          push(cq9ThumbPath(gameSlug, ext));
        }
        continue;
      }
      for (const ext of THUMBNAIL_EXTENSIONS) {
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
