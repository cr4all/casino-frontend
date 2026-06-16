import type { Game } from '@/types';

const THUMBNAIL_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;

function slugifyGameName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** API thumbnail 없을 때 시도할 로컬 경로 목록 (우선순위 순) */
export function getLocalGameThumbnailCandidates(game: Game): string[] {
  const hallSlug = game.vendor?.slug;
  if (!hallSlug) return [];

  const gameSlug = slugifyGameName(game.name);
  if (!gameSlug) return [];

  return THUMBNAIL_EXTENSIONS.map(
    (ext) => `/providers/${hallSlug}/${gameSlug}.${ext}`,
  );
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
