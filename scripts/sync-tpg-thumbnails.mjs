/**
 * Match TPG catalog games to assets/images thumbnails and copy into
 * public/providers/tpg/games/{slug}.png. Also rewrite catalog.json thumbnails.
 *
 * Matching order:
 *   1) Manual aliases by gameCode (typos / compressed names)
 *   2) Normalized exact match on gameName variants
 *   3) Fuzzy contains match (longer names first; each source file used once)
 *
 * Destination slug:
 *   - Keep existing catalog thumbnail basename when present (stable URLs)
 *   - Else slugify(gameName) + .png
 *
 * Usage:
 *   node scripts/sync-tpg-thumbnails.mjs
 *   node scripts/sync-tpg-thumbnails.mjs --source "D:/path/to/images"
 *   node scripts/sync-tpg-thumbnails.mjs --dry-run
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(FRONTEND_ROOT, '..');

const DEFAULT_SOURCE = path.resolve(REPO_ROOT, 'game_provider/TPG/assets/images');
const LEGACY_SOURCE = path.resolve(REPO_ROOT, 'game_provider/TPG/assets/All Games/325x250');
const DEFAULT_LOGO = path.resolve(
  REPO_ROOT,
  'game_provider/TPG/assets/TPG LOGO/TPG-logo-5759x1897/tpg-logo.png',
);
const CATALOG_PATH = path.resolve(
  REPO_ROOT,
  'casino-backend/app/Infrastructure/Provider/Adapters/Tpg/catalog.json',
);
const DEST_GAMES = path.join(FRONTEND_ROOT, 'public/providers/tpg/games');
const DEST_LOGO = path.join(FRONTEND_ROOT, 'public/providers/tpg.png');
const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);

/** Manual source filename overrides for typos / compressed names. */
const MANUAL_ALIASES = {
  '1-128': 'Go Rich Neiko.500x360EN.png', // Neko → Neiko
  '3-4': 'SuperSixBaccarat.495x342EN.png',
  '1-87': 'HighWay King Deluxe.495x342EN.png', // King (singular) Deluxe
};

function parseArgs(argv) {
  const out = {
    source: process.env.TPG_THUMB_SOURCE || DEFAULT_SOURCE,
    logo: process.env.TPG_LOGO_SOURCE || DEFAULT_LOGO,
    dryRun: false,
    writeCatalog: true,
  };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--source' && argv[i + 1]) {
      out.source = path.resolve(argv[++i]);
    } else if (argv[i] === '--logo' && argv[i + 1]) {
      out.logo = path.resolve(argv[++i]);
    } else if (argv[i] === '--dry-run') {
      out.dryRun = true;
    } else if (argv[i] === '--no-catalog') {
      out.writeCatalog = false;
    }
  }
  return out;
}

function slugifyName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeKey(input) {
  let s = String(input).toLowerCase();
  s = s.replace(/[×✕✖]/g, 'x').replace(/[–—]/g, '-');
  s = s.replace(/[''`´]/g, '');
  s = s.replace(/\d{3,4}\s*[x×]\s*\d{3,4}/g, '');
  s = s.replace(/(^|[_\s.\-])(en|zh|icon|english)($|[_\s.\-])/g, '$1$3');
  s = s.replace(/[^a-z0-9]+/g, '');
  return s;
}

function nameVariants(gameName) {
  const name = String(gameName);
  return [
    name,
    name.replace(/:/g, ' ').replace(/!/g, ''),
    name.replace(/Black Myth\s*:/gi, 'Black Myth '),
    name.replace(/Hold\s*&\s*Spin/gi, 'Hold and Spin'),
    name.replace(/Hold\s*&\s*Spin/gi, 'HoldSpin'),
    name.replace(/&/g, 'and'),
    name.replace(/&/g, ''),
    name.replace(/\//g, ''),
    name.replace(/\s+/g, ''),
    name.replace(/™/g, ''),
    name.replace(/GODZ/gi, 'Godz'),
  ];
}

function destFileName(game) {
  if (game.thumbnail && typeof game.thumbnail === 'string') {
    const base = path.basename(game.thumbnail);
    if (base) return base.replace(/\.(jpe?g|webp)$/i, '.png');
  }
  return `${slugifyName(game.gameName)}.png`;
}

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => IMAGE_EXT.has(path.extname(name).toLowerCase()))
    .map((name) => ({
      name,
      abs: path.join(dir, name),
      key: normalizeKey(path.basename(name, path.extname(name))),
    }));
}

function claim(fileMap, usedFiles, fileName) {
  if (!fileName || usedFiles.has(fileName)) return null;
  const entry = fileMap.get(fileName);
  if (!entry) return null;
  usedFiles.add(fileName);
  return entry;
}

function matchGames(games, images) {
  const fileMap = new Map(images.map((img) => [img.name, img]));
  const byKey = new Map();
  for (const img of images) {
    const list = byKey.get(img.key) ?? [];
    list.push(img);
    byKey.set(img.key, list);
  }

  const usedFiles = new Set();
  /** @type {Map<string, { game: object, source: object, dest: string }>} */
  const matched = new Map();
  const unmatched = [];

  // 1) Manual aliases
  for (const game of games) {
    const alias = MANUAL_ALIASES[game.gameCode];
    if (!alias) continue;
    const source = claim(fileMap, usedFiles, alias);
    if (!source) {
      unmatched.push({ game, reason: `alias missing: ${alias}` });
      continue;
    }
    matched.set(game.gameCode, {
      game,
      source,
      dest: destFileName(game),
    });
  }

  // 2) Exact normalized match
  for (const game of games) {
    if (matched.has(game.gameCode)) continue;

    const keys = new Set(nameVariants(game.gameName).map(normalizeKey).filter(Boolean));
    let hit = null;
    for (const key of keys) {
      const candidates = (byKey.get(key) ?? []).filter((img) => !usedFiles.has(img.name));
      if (candidates.length === 1) {
        hit = candidates[0];
        break;
      }
      if (candidates.length > 1) {
        // Prefer EN / larger naming; pick first sorted for stability
        hit = [...candidates].sort((a, b) => a.name.localeCompare(b.name))[0];
        break;
      }
    }
    if (hit) {
      usedFiles.add(hit.name);
      matched.set(game.gameCode, {
        game,
        source: hit,
        dest: destFileName(game),
      });
    }
  }

  // 3) Fuzzy contains — longer game keys first so Deluxe beats Kings
  const pending = games
    .filter((g) => !matched.has(g.gameCode))
    .map((g) => ({ game: g, key: normalizeKey(g.gameName) }))
    .filter((row) => row.key)
    .sort((a, b) => b.key.length - a.key.length || a.game.gameCode.localeCompare(b.game.gameCode));

  for (const { game, key } of pending) {
    let best = null;
    let bestScore = Infinity;
    for (const img of images) {
      if (usedFiles.has(img.name)) continue;
      const ik = img.key;
      if (!ik) continue;
      if (!(key.includes(ik) || ik.includes(key))) continue;
      if (Math.abs(ik.length - key.length) > 12) continue;
      const score = Math.abs(ik.length - key.length);
      if (score < bestScore || (score === bestScore && img.name.localeCompare(best?.name ?? '') < 0)) {
        best = img;
        bestScore = score;
      }
    }
    if (best) {
      usedFiles.add(best.name);
      matched.set(game.gameCode, {
        game,
        source: best,
        dest: destFileName(game),
      });
    } else {
      unmatched.push({ game, reason: 'no image match' });
    }
  }

  const unused = images.filter((img) => !usedFiles.has(img.name));
  return { matched: [...matched.values()], unmatched, unused };
}

async function writeDestPng(sourceAbs, destAbs) {
  const ext = path.extname(sourceAbs).toLowerCase();
  if (ext === '.png') {
    fs.copyFileSync(sourceAbs, destAbs);
    return;
  }
  await sharp(sourceAbs).png().toFile(destAbs);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  let sourceDir = opts.source;
  if (!fs.existsSync(sourceDir)) {
    if (sourceDir === DEFAULT_SOURCE && fs.existsSync(LEGACY_SOURCE)) {
      console.warn(`Primary source missing, falling back to: ${LEGACY_SOURCE}`);
      sourceDir = LEGACY_SOURCE;
    } else {
      console.error(`Source directory not found: ${sourceDir}`);
      process.exit(1);
    }
  }

  if (!fs.existsSync(CATALOG_PATH)) {
    console.error(`Catalog not found: ${CATALOG_PATH}`);
    process.exit(1);
  }

  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const games = catalog.games ?? [];
  const images = listImages(sourceDir);
  const { matched, unmatched, unused } = matchGames(games, images);

  console.log(`Catalog games: ${games.length}`);
  console.log(`Source images: ${images.length} (${sourceDir})`);
  console.log(`Matched: ${matched.length}`);
  console.log(`Unmatched: ${unmatched.length}`);
  console.log(`Unused source files: ${unused.length}`);

  if (unmatched.length) {
    console.error('\nUnmatched games:');
    for (const row of unmatched) {
      console.error(`  ${row.game.gameCode}\t${row.game.gameName}\t${row.reason}`);
    }
  }

  if (opts.dryRun) {
    console.log('\nDry run — sample mappings:');
    for (const row of matched.slice(0, 15)) {
      console.log(`  ${row.game.gameCode}\t${row.source.name}\t->\t${row.dest}`);
    }
    if (matched.length > 15) console.log(`  ... +${matched.length - 15} more`);
    process.exit(unmatched.length ? 1 : 0);
  }

  fs.mkdirSync(DEST_GAMES, { recursive: true });

  let written = 0;
  for (const row of matched) {
    const destAbs = path.join(DEST_GAMES, row.dest);
    await writeDestPng(row.source.abs, destAbs);
    row.game.thumbnail = `/providers/tpg/games/${row.dest}`;
    written += 1;
  }

  if (opts.writeCatalog) {
    fs.writeFileSync(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
    console.log(`Updated catalog thumbnails: ${CATALOG_PATH}`);
  }

  if (fs.existsSync(opts.logo)) {
    fs.mkdirSync(path.dirname(DEST_LOGO), { recursive: true });
    fs.copyFileSync(opts.logo, DEST_LOGO);
    console.log(`Logo -> ${DEST_LOGO}`);
  } else {
    console.warn(`Logo not found: ${opts.logo}`);
  }

  const nullLeft = games.filter((g) => !g.thumbnail).length;
  const destCount = fs.readdirSync(DEST_GAMES).filter((n) => IMAGE_EXT.has(path.extname(n).toLowerCase())).length;

  console.log(`Wrote ${written} thumbnails -> ${DEST_GAMES}`);
  console.log(`Dest file count: ${destCount}`);
  console.log(`Catalog thumbnail nulls left: ${nullLeft}`);

  if (unmatched.length || nullLeft > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
