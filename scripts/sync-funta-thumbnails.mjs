/**
 * Flatten FunTa banner materials into public/providers/funta/{gameId}.jpg
 * for VA-style local thumbnail fallback (no CQ9 bg/icon overlay).
 *
 * Source pick order: 英 en → 簡 zh → 日 ja, size folder 245x180.
 * Non-JPEG sources (png/webp) are converted to JPEG so Admin/API paths stay uniform.
 *
 * Usage:
 *   node scripts/sync-funta-thumbnails.mjs
 *   node scripts/sync-funta-thumbnails.mjs --source "D:/path/to/01_banner"
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(__dirname, '..');
const DEFAULT_MATERIALS = path.resolve(
  FRONTEND_ROOT,
  '../game_provider/funta/0_Game Materials(遊戲素材)_通用簡英日(語言別)/01_banner',
);
const DEST_DIR = path.join(FRONTEND_ROOT, 'public/providers/funta');
const SIZE_FOLDER = '245x180';
const LANG_ORDER = ['英 en', '簡 zh', '日 ja'];
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function parseArgs(argv) {
  const out = { source: process.env.FUNTA_BANNER_SOURCE || DEFAULT_MATERIALS };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--source' && argv[i + 1]) {
      out.source = path.resolve(argv[++i]);
    }
  }
  return out;
}

function parseGameId(filename) {
  const match = filename.match(/^(\d+)/);
  if (!match) return null;
  return String(Number(match[1]));
}

/** Lower score = better pick within the same language folder. */
function rankFile(filename, preferredLangTokens) {
  const lower = filename.toLowerCase();
  let score = 100;

  if (/other\s*lang/.test(lower) || /all\s*lang/.test(lower)) {
    score += 50;
  }

  for (const token of preferredLangTokens) {
    if (lower.includes(`_${token}_`) || lower.endsWith(`_${token}.jpg`) || lower.endsWith(`_${token}.png`)) {
      score -= 20;
      break;
    }
  }

  if (/_0*1\.(jpg|jpeg|png|webp)$/i.test(filename)) {
    score -= 5;
  }

  return score;
}

function preferredTokensForLangFolder(langFolder) {
  if (langFolder.includes('en')) return ['en'];
  if (langFolder.includes('zh')) return ['zh', 'cn'];
  if (langFolder.includes('ja')) return ['ja', 'jp'];
  return [];
}

function collectBestPerId(sizeDir, langFolder) {
  /** @type {Map<string, { file: string, score: number }>} */
  const best = new Map();
  if (!fs.existsSync(sizeDir)) {
    return best;
  }

  const tokens = preferredTokensForLangFolder(langFolder);
  for (const name of fs.readdirSync(sizeDir)) {
    const ext = path.extname(name).toLowerCase();
    if (!IMAGE_EXT.has(ext)) continue;

    const id = parseGameId(name);
    if (id === null) continue;

    const score = rankFile(name, tokens);
    const prev = best.get(id);
    if (!prev || score < prev.score || (score === prev.score && name.localeCompare(prev.file) < 0)) {
      best.set(id, { file: name, score });
    }
  }

  return best;
}

async function main() {
  const { source: bannerRoot } = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(bannerRoot)) {
    console.error(`FunTa banner source not found: ${bannerRoot}`);
    process.exit(1);
  }

  fs.mkdirSync(DEST_DIR, { recursive: true });

  /** @type {Map<string, { src: string, lang: string }>} */
  const chosen = new Map();
  const collisions = [];

  for (const langFolder of LANG_ORDER) {
    const sizeDir = path.join(bannerRoot, langFolder, SIZE_FOLDER);
    const best = collectBestPerId(sizeDir, langFolder);

    for (const [id, { file }] of best) {
      if (chosen.has(id)) {
        collisions.push({ id, skippedLang: langFolder, file });
        continue;
      }

      chosen.set(id, {
        src: path.join(sizeDir, file),
        lang: langFolder,
      });
    }
  }

  let copied = 0;
  for (const [id, { src, lang }] of [...chosen.entries()].sort((a, b) => Number(a[0]) - Number(b[0]))) {
    const dest = path.join(DEST_DIR, `${id}.jpg`);
    // Remove legacy non-jpg sibling so only one extension remains per id.
    for (const staleExt of ['.png', '.webp', '.jpeg']) {
      const stale = path.join(DEST_DIR, `${id}${staleExt}`);
      if (fs.existsSync(stale)) {
        fs.unlinkSync(stale);
      }
    }

    const srcExt = path.extname(src).toLowerCase();
    if (srcExt === '.jpg' || srcExt === '.jpeg') {
      fs.copyFileSync(src, dest);
    } else {
      // png/webp → jpg so FE fallback and Admin DB paths are always .jpg
      await sharp(src).jpeg({ quality: 90 }).toFile(dest);
    }
    copied += 1;
    console.log(`OK  ${id}.jpg  <-  [${lang}] ${path.basename(src)}`);
  }

  console.log('');
  console.log(`Copied: ${copied}`);
  console.log(`Skipped (already filled by higher-priority lang): ${collisions.length}`);
  console.log(`Destination: ${DEST_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
