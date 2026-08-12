/**
 * Copy TPG game thumbnails (325x250) and logo into public/providers/tpg.
 *
 * Source filenames are Title Case (e.g. "Ancient Dragons.png").
 * Destination matches catalog thumbnail paths: /providers/tpg/games/{kebab-slug}.png
 *
 * Usage:
 *   node scripts/sync-tpg-thumbnails.mjs
 *   node scripts/sync-tpg-thumbnails.mjs --source "D:/path/to/325x250"
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(__dirname, '..');
const DEFAULT_GAMES = path.resolve(
  FRONTEND_ROOT,
  '../game_provider/TPG/assets/All Games/325x250',
);
const DEFAULT_LOGO = path.resolve(
  FRONTEND_ROOT,
  '../game_provider/TPG/assets/TPG LOGO/TPG-logo-5759x1897/tpg-logo.png',
);
const DEST_GAMES = path.join(FRONTEND_ROOT, 'public/providers/tpg/games');
const DEST_LOGO = path.join(FRONTEND_ROOT, 'public/providers/tpg.png');
const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function parseArgs(argv) {
  const out = {
    source: process.env.TPG_THUMB_SOURCE || DEFAULT_GAMES,
    logo: process.env.TPG_LOGO_SOURCE || DEFAULT_LOGO,
  };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--source' && argv[i + 1]) {
      out.source = path.resolve(argv[++i]);
    }
    if (argv[i] === '--logo' && argv[i + 1]) {
      out.logo = path.resolve(argv[++i]);
    }
  }
  return out;
}

function toSlug(filename) {
  const base = path.basename(filename, path.extname(filename));
  return base
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function main() {
  const { source, logo } = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(source)) {
    console.error(`Source directory not found: ${source}`);
    process.exit(1);
  }

  ensureDir(DEST_GAMES);

  let copied = 0;
  for (const name of fs.readdirSync(source)) {
    const ext = path.extname(name).toLowerCase();
    if (!IMAGE_EXT.has(ext)) continue;

    const slug = toSlug(name);
    if (!slug) continue;

    const dest = path.join(DEST_GAMES, `${slug}.png`);
    fs.copyFileSync(path.join(source, name), dest);
    copied += 1;
  }

  if (fs.existsSync(logo)) {
    ensureDir(path.dirname(DEST_LOGO));
    fs.copyFileSync(logo, DEST_LOGO);
    console.log(`Logo -> ${DEST_LOGO}`);
  } else {
    console.warn(`Logo not found: ${logo}`);
  }

  console.log(`Copied ${copied} game thumbnails -> ${DEST_GAMES}`);
}

main();
