/**
 * Generate local CQ9 game thumbnails into public/providers/cq9/{gamecode}.png
 *
 * Source catalog: casino-backend/storage/app/cq9-games.json
 * (refresh with: php scripts/fetch-cq9-games.php)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const catalogPath = path.resolve(root, '../casino-backend/storage/app/cq9-games.json');
const outDir = path.join(root, 'public/providers/cq9');

const WIDTH = 300;
const HEIGHT = 210;

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function englishName(game) {
  const nameset = Array.isArray(game.nameset) ? game.nameset : [];
  const en = nameset.find((n) => n && n.lang === 'en' && n.name);
  if (en?.name) return String(en.name);
  return String(game.gamename ?? game.gamecode ?? 'CQ9');
}

function wrapLines(text, maxChars = 18, maxLines = 3) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [text];
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = word.length > maxChars ? `${word.slice(0, maxChars - 1)}…` : word;
    if (lines.length >= maxLines - 1) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines.slice(0, maxLines);
}

function svgFor(game) {
  const code = String(game.gamecode ?? '');
  const title = englishName(game);
  const lines = wrapLines(title);
  const titleSvg = lines
    .map((line, i) => {
      const y = 96 + i * 28 - ((lines.length - 1) * 14);
      return `<text x="150" y="${y}" text-anchor="middle" fill="#F7F2E8" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700">${escapeXml(line)}</text>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#14080E"/>
      <stop offset="55%" stop-color="#4A1020"/>
      <stop offset="100%" stop-color="#8B1A2B"/>
    </linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.14"/>
      <stop offset="45%" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#shine)"/>
  <rect x="10" y="10" width="280" height="190" rx="14" fill="none" stroke="#D4AF37" stroke-opacity="0.85" stroke-width="2"/>
  <text x="150" y="44" text-anchor="middle" fill="#D4AF37" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" letter-spacing="3">CQ9</text>
  ${titleSvg}
  <text x="150" y="178" text-anchor="middle" fill="#F7F2E8" fill-opacity="0.55" font-family="Arial, Helvetica, sans-serif" font-size="13">${escapeXml(code)}</text>
</svg>`;
}

async function main() {
  if (!fs.existsSync(catalogPath)) {
    console.error(`Missing catalog: ${catalogPath}`);
    console.error('Run: php scripts/fetch-cq9-games.php (in casino-backend)');
    process.exit(1);
  }

  const games = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  if (!Array.isArray(games) || games.length === 0) {
    console.error('Catalog is empty');
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });

  let written = 0;
  for (const game of games) {
    const code = String(game.gamecode ?? '').trim();
    if (!code) continue;
    const out = path.join(outDir, `${code}.png`);
    await sharp(Buffer.from(svgFor(game)))
      .png({ compressionLevel: 9 })
      .toFile(out);
    written += 1;
    if (written % 50 === 0) console.log(`… ${written}/${games.length}`);
  }

  // Alias for frontend path that used a space instead of underscore
  const aliasSrc = path.join(outDir, 'VPCQGP01_GROUP.png');
  const aliasDst = path.join(outDir, 'VPCQGP01 GROUP.png');
  if (fs.existsSync(aliasSrc) && !fs.existsSync(aliasDst)) {
    fs.copyFileSync(aliasSrc, aliasDst);
  }

  console.log(`Wrote ${written} thumbnails to ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
