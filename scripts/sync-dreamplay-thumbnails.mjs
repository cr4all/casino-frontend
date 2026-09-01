/**
 * Flatten Dreamplay 287x193 PNG icons into public/providers/dreamplay/{game_id}.png.
 *
 * Dreamplay Games API has no thumbnail/logo URL. Icons live in
 * game_provider/DreamPlay/_drive_assets/{nn}-{slug}/.../static/png/.
 * Catalog sync (FunTa pattern) stores the relative path; Admin prefixes FRONTEND_URL.
 *
 * Matching order:
 *   1) Manual aliases (filename/folder slug → Games API game_id)
 *   2) Normalized folder slug (strip leading NN-)
 *   3) Normalized filename slug
 * Prefer the game's own asset folder over a leftover copy in a sibling folder.
 * Skip "(2)" duplicates when a cleaner 287x193 file exists.
 *
 * Usage:
 *   node scripts/sync-dreamplay-thumbnails.mjs
 *   node scripts/sync-dreamplay-thumbnails.mjs --dry-run
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(FRONTEND_ROOT, '..');

const DEFAULT_SOURCE = path.resolve(REPO_ROOT, 'game_provider/DreamPlay/_drive_assets');
const GAMELIST_PATH = path.resolve(REPO_ROOT, 'game_provider/DreamPlay/_gamelist.json');
const MAP_PATH = path.resolve(REPO_ROOT, 'game_provider/DreamPlay/_thumb_map.json');
const DEST_DIR = path.join(FRONTEND_ROOT, 'public/providers/dreamplay');
const PUBLIC_PREFIX = '/providers/dreamplay';

/** 287x193 including Latin x and Cyrillic х used in some Dreamplay filenames. */
const SIZE_RE = /287[\s_\-]*[x×хX][\s_\-]*193/i;

/**
 * Filename/folder slugs that do not equal Games API game_id.
 * Keys are normalizeSlug() output.
 */
const MANUAL_ALIASES = {
  'lucky-koins': 'lucky-coins',
  'emodjinator': 'emojinator',
  'sheriff-chase-coin-chase': 'sheriff-chase',
  'sweet-crumbles-holiday-cravings': 'sweet-crumbles-holiday',
  'dream-turtles-sw': 'dream-turtles',
};

function parseArgs(argv) {
  const out = {
    source: process.env.DREAMPLAY_THUMB_SOURCE || DEFAULT_SOURCE,
    dryRun: false,
  };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--source' && argv[i + 1]) {
      out.source = path.resolve(argv[++i]);
    } else if (argv[i] === '--dry-run') {
      out.dryRun = true;
    }
  }
  return out;
}

function normalizeSlug(input) {
  return String(input)
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/[''`´]/g, '-')
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function aliasSlug(slug) {
  const key = normalizeSlug(slug);
  return MANUAL_ALIASES[key] ?? key;
}

function folderSlug(folderName) {
  return aliasSlug(String(folderName).replace(/^\d+[–-]+/, ''));
}

function fileSlug(filename) {
  let stem = String(filename).replace(/\.png$/i, '');
  stem = stem.replace(new RegExp(SIZE_RE.source, 'gi'), '');
  stem = stem.replace(/^\d+[–-]+/, '');
  stem = stem.replace(/-\(\d+\)/g, '');
  stem = stem.replace(/-+$/g, '');
  return aliasSlug(stem);
}

function isThumbPng(name) {
  return SIZE_RE.test(name) && /\.png$/i.test(name);
}

function walkThumbs(root) {
  /** @type {{ abs: string, name: string, rel: string, folder: string }[]} */
  const out = [];

  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(abs);
        continue;
      }
      if (!ent.isFile() || !isThumbPng(ent.name)) {
        continue;
      }
      const rel = path.relative(root, abs).replaceAll('\\', '/');
      const folder = rel.split('/')[0] ?? '';
      out.push({ abs, name: ent.name, rel, folder });
    }
  }

  walk(root);
  return out;
}

function scoreCandidate(file, gameId) {
  const fromFolder = folderSlug(file.folder);
  const fromFile = fileSlug(file.name);
  let score = 0;

  if (fromFolder === gameId) {
    score += 100;
  }
  if (fromFile === gameId) {
    score += 50;
  }
  if (/\(\d+\)/.test(file.name)) {
    score -= 20;
  }
  const sizeHits = [...file.name.matchAll(new RegExp(SIZE_RE.source, 'gi'))];
  if (sizeHits.length > 1) {
    score -= 5;
  }
  if (fromFolder && fromFolder !== gameId) {
    score -= 40;
  }
  // Prefer the shorter original filename when scores tie (drop "287x193-287x193" copies).
  score -= Math.min(file.name.length, 80) / 1000;

  return score;
}

function pickBest(gameId, files) {
  let best = null;
  let bestScore = -Infinity;
  for (const file of files) {
    const score = scoreCandidate(file, gameId);
    if (score < 50) {
      continue;
    }
    if (
      score > bestScore ||
      (score === bestScore && file.rel.localeCompare(best?.rel ?? '') < 0)
    ) {
      best = file;
      bestScore = score;
    }
  }
  return best ? { file: best, score: bestScore } : null;
}

function publicPath(gameId) {
  return `${PUBLIC_PREFIX}/${gameId}.png`;
}

function loadCatalogGames() {
  if (!fs.existsSync(GAMELIST_PATH)) {
    return [];
  }
  const decoded = JSON.parse(fs.readFileSync(GAMELIST_PATH, 'utf8'));
  const games = Array.isArray(decoded?.games) ? decoded.games : [];
  return games
    .map((game) => ({
      game_id: String(game.game_id ?? ''),
      title: String(game.title ?? game.game_id ?? ''),
      game_type: game.game_type ?? null,
      rtp: game.rtp ?? null,
      is_promo_free_spin_available: game.is_promo_free_spin_available ?? null,
    }))
    .filter((game) => game.game_id !== '');
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(opts.source)) {
    console.error(`Dreamplay asset source not found: ${opts.source}`);
    process.exit(1);
  }

  const catalog = loadCatalogGames();
  const files = walkThumbs(opts.source);
  const catalogIds = new Set(catalog.map((g) => g.game_id));

  const extraIds = new Set();
  for (const file of files) {
    extraIds.add(folderSlug(file.folder));
    extraIds.add(fileSlug(file.name));
  }
  extraIds.delete('');

  const allIds = [...new Set([...catalogIds, ...extraIds])].sort((a, b) => a.localeCompare(b));

  /** @type {{ game_id: string, title: string|null, in_games_api: boolean, thumbnail: string, source: string, score: number }[]} */
  const matched = [];
  /** @type {{ game_id: string, title: string|null, in_games_api: boolean }[]} */
  const unmatched = [];

  for (const gameId of allIds) {
    const catalogGame = catalog.find((g) => g.game_id === gameId);
    const hit = pickBest(gameId, files);
    if (!hit) {
      if (catalogIds.has(gameId)) {
        unmatched.push({
          game_id: gameId,
          title: catalogGame?.title ?? null,
          in_games_api: true,
        });
      }
      continue;
    }
    matched.push({
      game_id: gameId,
      title: catalogGame?.title ?? null,
      in_games_api: catalogIds.has(gameId),
      thumbnail: publicPath(gameId),
      source: hit.file.rel,
      score: hit.score,
    });
  }

  const usedRels = new Set(matched.map((row) => row.source));
  const unused = files.filter((file) => !usedRels.has(file.rel));

  const apiMatched = matched.filter((row) => row.in_games_api);
  const assetsOnly = matched.filter((row) => !row.in_games_api);

  console.log(`Games API titles: ${catalog.length}`);
  console.log(`287x193 PNG sources: ${files.length}`);
  console.log(`Mapped (in Games API): ${apiMatched.length}/${catalog.length}`);
  console.log(`Mapped (assets only, not in current Games API): ${assetsOnly.length}`);
  console.log(`Unmatched Games API titles: ${unmatched.length}`);
  console.log(`Unused source files: ${unused.length}`);

  if (unmatched.length) {
    console.error('\nUnmatched catalog games:');
    for (const row of unmatched) {
      console.error(`  ${row.game_id}\t${row.title ?? ''}`);
    }
  }

  if (opts.dryRun) {
    console.log('\nDry run — mappings:');
    for (const row of matched) {
      const tag = row.in_games_api ? 'API' : 'asset';
      console.log(`  [${tag}] ${row.game_id}  <-  ${row.source}`);
    }
    process.exit(unmatched.length ? 1 : 0);
  }

  fs.mkdirSync(DEST_DIR, { recursive: true });

  let written = 0;
  for (const row of matched) {
    const destAbs = path.join(DEST_DIR, `${row.game_id}.png`);
    const sourceAbs = path.join(opts.source, row.source);
    fs.copyFileSync(sourceAbs, destAbs);
    written += 1;
  }

  const catalogById = new Map(catalog.map((g) => [g.game_id, g]));
  const nextGamelist = {
    status: true,
    thumbnail_url_pattern: `${PUBLIC_PREFIX}/{game_id}.png`,
    games: catalog.map((game) => ({
      ...game,
      thumbnail: catalogById.has(game.game_id)
        ? (matched.find((row) => row.game_id === game.game_id)?.thumbnail ?? null)
        : null,
    })),
  };
  fs.writeFileSync(GAMELIST_PATH, `${JSON.stringify(nextGamelist, null, 2)}\n`, 'utf8');

  const mapDoc = {
    url_pattern: `${PUBLIC_PREFIX}/{game_id}.png`,
    dest_dir: 'casino-frontend/public/providers/dreamplay',
    size: '287x193',
    catalog_count: catalog.length,
    mapped_in_games_api: apiMatched.length,
    mapped_assets_only: assetsOnly.length,
    unmatched: unmatched,
    unused_sources: unused.map((file) => file.rel),
    aliases: MANUAL_ALIASES,
    games: matched,
  };
  fs.writeFileSync(MAP_PATH, `${JSON.stringify(mapDoc, null, 2)}\n`, 'utf8');

  console.log(`Wrote ${written} thumbnails -> ${DEST_DIR}`);
  console.log(`Updated ${GAMELIST_PATH}`);
  console.log(`Wrote ${MAP_PATH}`);

  if (unmatched.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
