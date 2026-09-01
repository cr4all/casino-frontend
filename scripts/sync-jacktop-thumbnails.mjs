/**
 * Copy JackTop 400x300 PNG thumbnails into public/providers/jacktop/.
 *
 * Source layout (game_provider/JackTop/JackTop Image/):
 *   - Root PNGs  → live/table/crash/mini casino games (slugified gameName under /providers/jacktop/)
 *   - slot/*.png → slot games (slugified name under /providers/jacktop/slot/)
 *
 * Also copies vendor logo.png → public/providers/jacktop.png
 * and mirrors thumbnail paths into backend + source catalog JSON.
 *
 * Usage:
 *   node scripts/sync-jacktop-thumbnails.mjs
 *   node scripts/sync-jacktop-thumbnails.mjs --dry-run
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(FRONTEND_ROOT, '..');

const DEFAULT_SOURCE = path.resolve(REPO_ROOT, 'game_provider/JackTop/JackTop Image');
const DEFAULT_LOGO = path.resolve(REPO_ROOT, 'game_provider/JackTop/logo.png');
const SOURCE_CATALOG = path.resolve(REPO_ROOT, 'game_provider/JackTop/_catalog.json');
const BACKEND_CATALOG = path.resolve(
  REPO_ROOT,
  'casino-backend/app/Infrastructure/Provider/Adapters/Jacktop/catalog.json',
);
const DEST_ROOT = path.join(FRONTEND_ROOT, 'public/providers/jacktop');
const DEST_SLOT = path.join(DEST_ROOT, 'slot');
const DEST_LOGO = path.join(FRONTEND_ROOT, 'public/providers/jacktop.png');

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);

/** gameCode → source basename hint (without extension) when fuzzy match is ambiguous. */
const CASINO_ALIASES = {
  '200000003': 'lucky_chicken_crossing',
  '200000005': 'vip_vault_roulette',
  '200000015': 'crossfire_chicken',
  '200000016': 'teenpatti',
  '200000017': 'mr_mars',
  '200000018': 'mega_deal',
  '200000019': 'turbo_roulette',
  '200000021': 'poker_plus',
  '200000022': 'x777_vip_vault_roulette',
  '200000023': 'frost_cross',
};

/** gameCode → all tokens must appear in normalized source key (handles typos / Cyrillic homoglyphs). */
const CASINO_TOKEN_HINTS = {
  '200000003': ['lucky', 'crossing'],
};

function parseArgs(argv) {
  const out = {
    source: process.env.JACKTOP_THUMB_SOURCE || DEFAULT_SOURCE,
    logo: process.env.JACKTOP_LOGO_SOURCE || DEFAULT_LOGO,
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

function normalizeKey(input) {
  let s = String(input).toLowerCase();
  s = s.normalize('NFD').replace(/\p{M}/gu, '');
  s = s.replace(/[×✕✖]/g, 'x').replace(/[–—]/g, '-');
  s = s.replace(/[''`´]/g, '');
  s = s.replace(/\d{3,4}\s*[x×?]\s*\d{3,4}/g, '');
  s = s.replace(/400x300_?/g, '');
  s = s.replace(/400\?300_?/g, '');
  s = s.replace(/[^a-z0-9]+/g, '');
  return s;
}

function slugifyName(name) {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stripSizePrefix(fileName) {
  return fileName.replace(/^400[^_]*_?/i, '').replace(/\.(png|jpe?g|webp)$/i, '');
}

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => IMAGE_EXT.has(path.extname(name).toLowerCase()))
    .map((name) => ({
      name,
      abs: path.join(dir, name),
      key: normalizeKey(stripSizePrefix(name)),
    }));
}

function nameVariants(gameName) {
  const name = String(gameName);
  return [
    name,
    name.replace(/\s+/g, '_'),
    name.replace(/\s+/g, ''),
    name.replace(/\./g, ''),
    name.replace(/x5000/gi, ''),
    name.replace(/x555/gi, ''),
    name.replace(/x777/gi, 'x777'),
    name.replace(/7 /g, '7_'),
    name.replace(/Blackjack 7 /gi, 'Blackjack7_'),
  ];
}

function findCasinoSource(game, sources, used) {
  const tokens = CASINO_TOKEN_HINTS[game.gameCode];
  if (tokens) {
    const hit = sources.find(
      (s) => !used.has(s.abs) && tokens.every((token) => s.key.includes(normalizeKey(token))),
    );
    if (hit) return hit;
  }

  const alias = CASINO_ALIASES[game.gameCode];
  if (alias) {
    const hit = sources.find((s) => s.key.includes(normalizeKey(alias)) && !used.has(s.abs));
    if (hit) return hit;
  }

  for (const variant of nameVariants(game.gameName)) {
    const key = normalizeKey(variant);
    const exact = sources.find((s) => s.key === key && !used.has(s.abs));
    if (exact) return exact;
  }

  for (const variant of nameVariants(game.gameName)) {
    const key = normalizeKey(variant);
    if (key.length < 4) continue;
    const contains = sources.find(
      (s) => (s.key.includes(key) || key.includes(s.key)) && !used.has(s.abs) && s.key.length >= 4,
    );
    if (contains) return contains;
  }

  return null;
}

function copyFile(src, dest, dryRun) {
  if (!dryRun) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function readCatalog(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed.games) ? parsed.games : [];
}

function writeCatalog(filePath, games, dryRun) {
  const payload = {
    games: games.map(({ gameCode, gameName, gametype, thumbnail }) => ({
      gameCode,
      gameName,
      gametype,
      thumbnail,
    })),
  };
  if (!dryRun) {
    fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  }
}

function removeLegacyCodeThumbnails(destRoot, dryRun) {
  if (!fs.existsSync(destRoot)) return;
  for (const name of fs.readdirSync(destRoot)) {
    if (/^\d+\.png$/i.test(name)) {
      const abs = path.join(destRoot, name);
      if (!dryRun) fs.unlinkSync(abs);
      console.log(`${dryRun ? '[dry-run] ' : ''}removed legacy ${name}`);
    }
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const casinoDir = args.source;
  const slotDir = path.join(args.source, 'slot');

  if (!fs.existsSync(casinoDir)) {
    console.error(`Source not found: ${casinoDir}`);
    process.exit(1);
  }

  const catalogGames = readCatalog(SOURCE_CATALOG);
  const casinoSources = listImages(casinoDir);
  const slotSources = listImages(slotDir);
  const usedCasino = new Set();

  let casinoCopied = 0;
  const unmatchedCasino = [];
  const updatedGames = [];

  for (const game of catalogGames) {
    const gameCode = String(game.gameCode ?? '').trim();
    if (gameCode === '') continue;

    const slug = slugifyName(game.gameName);
    if (!slug) {
      unmatchedCasino.push(game);
      console.warn(`WARN: empty slug for casino ${gameCode} (${game.gameName})`);
      continue;
    }

    const source = findCasinoSource(game, casinoSources, usedCasino);
    const dest = path.join(DEST_ROOT, `${slug}.png`);
    const thumbnail = `/providers/jacktop/${slug}.png`;

    if (source) {
      copyFile(source.abs, dest, args.dryRun);
      usedCasino.add(source.abs);
      casinoCopied += 1;
      console.log(`${args.dryRun ? '[dry-run] ' : ''}casino ${slug}.png (${gameCode}) <- ${source.name}`);
    } else {
      unmatchedCasino.push(game);
      console.warn(`WARN: no source for casino ${gameCode} (${game.gameName})`);
    }

    updatedGames.push({
      gameCode,
      gameName: game.gameName,
      gametype: game.gametype,
      thumbnail,
    });
  }

  const unusedCasino = casinoSources.filter((s) => !usedCasino.has(s.abs));
  if (unusedCasino.length > 0) {
    console.warn('\nUnused casino source files (not in catalog):');
    for (const file of unusedCasino) {
      console.warn(`  - ${file.name}`);
    }
  }

  let slotCopied = 0;
  for (const source of slotSources) {
    const slug = slugifyName(stripSizePrefix(source.name).replace(/_/g, ' '));
    if (!slug) continue;
    const dest = path.join(DEST_SLOT, `${slug}.png`);
    copyFile(source.abs, dest, args.dryRun);
    slotCopied += 1;
    console.log(`${args.dryRun ? '[dry-run] ' : ''}slot ${slug}.png <- ${source.name}`);
  }

  if (fs.existsSync(args.logo)) {
    copyFile(args.logo, DEST_LOGO, args.dryRun);
    console.log(`${args.dryRun ? '[dry-run] ' : ''}logo -> public/providers/jacktop.png`);
  } else {
    console.warn(`WARN: logo not found: ${args.logo}`);
  }

  if (args.writeCatalog) {
    writeCatalog(BACKEND_CATALOG, updatedGames, args.dryRun);
    writeCatalog(SOURCE_CATALOG, updatedGames, args.dryRun);
    console.log(`\nUpdated catalogs (${updatedGames.length} casino games)`);
  }

  removeLegacyCodeThumbnails(DEST_ROOT, args.dryRun);

  console.log(
    `\nDone: ${casinoCopied}/${catalogGames.length} casino, ${slotCopied} slot thumbnails` +
      (args.dryRun ? ' (dry-run)' : ''),
  );

  if (unmatchedCasino.length > 0) {
    process.exitCode = 1;
  }
}

main();
