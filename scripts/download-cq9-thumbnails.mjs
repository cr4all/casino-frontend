/**
 * Download CQ9 thumbnails using embedded gameList JSON (game_id → icon.en)
 * from site.cq9gaming.com/en/games.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const catalogPath = path.resolve(root, '../casino-backend/storage/app/cq9-games.json');
const outDir = path.join(root, 'public/providers/cq9');
const htmlCache = path.join(root, '.tmp-cq9-games.html');
const WIDTH = 300;
const HEIGHT = 210;

function extractGameList(html) {
  const marker = '"gameList":';
  const start = html.indexOf(marker);
  if (start < 0) throw new Error('gameList not found');
  let i = start + marker.length;
  while (html[i] && /\s/.test(html[i])) i += 1;
  if (html[i] !== '[') throw new Error('gameList is not an array');
  let depth = 0;
  let end = -1;
  for (let j = i; j < html.length; j += 1) {
    const ch = html[j];
    if (ch === '[') depth += 1;
    else if (ch === ']') {
      depth -= 1;
      if (depth === 0) {
        end = j + 1;
        break;
      }
    }
  }
  if (end < 0) throw new Error('failed to close gameList array');
  return JSON.parse(html.slice(i, end));
}

async function download(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(20000),
    headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://site.cq9gaming.com/' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const games = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const html = fs.readFileSync(htmlCache, 'utf8');
  const list = extractGameList(html);
  const byId = new Map();
  for (const item of list) {
    const id = String(item.game_id ?? item.gamecode ?? '');
    const icon = item.icon?.en || item.icon?.cn || Object.values(item.icon || {})[0];
    if (id && typeof icon === 'string') byId.set(id, icon);
  }
  console.log(`gameList icons=${byId.size}, catalog=${games.length}`);
  fs.mkdirSync(outDir, { recursive: true });

  let matched = 0;
  let missing = 0;
  const missingNames = [];

  for (const game of games) {
    const code = String(game.gamecode ?? '').trim();
    if (!code) continue;
    const url = byId.get(code);
    const out = path.join(outDir, `${code}.png`);
    if (!url) {
      missing += 1;
      missingNames.push(`${code}:${game.gamename}`);
      continue;
    }
    try {
      const buf = await download(url);
      const fitted = await sharp(buf)
        .resize(Math.round(WIDTH * 0.86), Math.round(HEIGHT * 0.86), {
          fit: 'inside',
          withoutEnlargement: false,
        })
        .png()
        .toBuffer();

      await sharp({
        create: {
          width: WIDTH,
          height: HEIGHT,
          channels: 3,
          background: { r: 0, g: 0, b: 0 },
        },
      })
        .composite([{ input: fitted, gravity: 'centre' }])
        .png({ compressionLevel: 9 })
        .toFile(out);
      matched += 1;
      if (matched % 40 === 0) console.log(`… ${matched}`);
    } catch (err) {
      missing += 1;
      missingNames.push(`${code}:${game.gamename} (${err.message})`);
    }
  }

  const aliasSrc = path.join(outDir, 'VPCQGP01_GROUP.png');
  const aliasDst = path.join(outDir, 'VPCQGP01 GROUP.png');
  if (fs.existsSync(aliasSrc)) fs.copyFileSync(aliasSrc, aliasDst);

  fs.writeFileSync(
    path.join(root, '.tmp-cq9-missing-thumbs.json'),
    JSON.stringify(missingNames, null, 2),
  );
  console.log(`Done matched=${matched} missing=${missing}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
