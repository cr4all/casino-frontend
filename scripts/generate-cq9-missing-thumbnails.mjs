/**
 * Generate CQ9-style circular emblem thumbnails for games missing official icons.
 * Overwrites only codes listed in .tmp-cq9-missing-thumbs.json (or --all-missing).
 * Keeps existing downloaded official arts untouched.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const catalogPath = path.resolve(root, '../casino-backend/storage/app/cq9-games.json');
const missingPath = path.join(root, '.tmp-cq9-missing-thumbs.json');
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

function displayTitle(game) {
  // Prefer English; fall back to original; redact overly explicit adult titles
  let title = englishName(game);
  const adult = isAdultCode(String(game.gamecode ?? '')) || isAdultTitle(title);
  if (adult) {
    title = 'CQ9 Exclusive';
  }
  return title;
}

function isAdultCode(code) {
  return /^60\d{2}$/.test(code) || code.startsWith('GO690');
}

function isAdultTitle(title) {
  return /sex|sexy|creampie|busty|bondage|ntr|gangbang|succubus|latex|lace|onsen|affair|shame|massage|swim|bunny|kimono|qipao|nurse|party|hostess|reclaim|defenseless|naughty|sweetie|blissful|drink to|tie me|double sex|train sex|devil|wild party|ditto|maiden/i.test(
    title,
  );
}

function themeFor(title, code) {
  const t = `${title} ${code}`.toLowerCase();
  if (/mahjong|麻将|hong zhong|fa cai|da fa/i.test(t)) {
    return { bg: ['#1a0a08', '#7a1f12'], accent: '#f5d76e', motif: 'tiles', glow: '#ff6b3d' };
  }
  if (/dragon|hunter|seti|egypt|pharaoh|aztec|olympus|qilin|horus/i.test(t)) {
    return { bg: ['#0b1a12', '#1f6b3a'], accent: '#e8c547', motif: 'relic', glow: '#7dffb3' };
  }
  if (/neko|cat|rabbit|pig|fudge|pets/i.test(t)) {
    return { bg: ['#1a1020', '#6b2d8b'], accent: '#ffb4e6', motif: 'charm', glow: '#ff7ad9' };
  }
  if (/cock|fowl|blade|gaff|boxing/i.test(t)) {
    return { bg: ['#140c08', '#8a3a12'], accent: '#ffd27a', motif: 'arena', glow: '#ff9a3c' };
  }
  if (/live|dealer|yaxing|ginkgo|mt-/i.test(t)) {
    return { bg: ['#081018', '#1a4a7a'], accent: '#7ec8ff', motif: 'live', glow: '#4db7ff' };
  }
  if (/bounty|bandito|wild|ace|rush|fifa|godzilla|bang/i.test(t)) {
    return { bg: ['#120810', '#6b1530'], accent: '#ffd36b', motif: 'action', glow: '#ff5e7a' };
  }
  if (/xmas|new year|fortune|lucky|gold|mayan|treasure|boot/i.test(t)) {
    return { bg: ['#101008', '#6b5210'], accent: '#ffe08a', motif: 'fortune', glow: '#ffd24d' };
  }
  if (/dead|devil|queen|cirque|hollywood|blast/i.test(t)) {
    return { bg: ['#0c0814', '#3b1a6b'], accent: '#d7b3ff', motif: 'mystic', glow: '#a56bff' };
  }
  if (isAdultCode(code) || isAdultTitle(title)) {
    return { bg: ['#120810', '#5a1838'], accent: '#f0c4d8', motif: 'vip', glow: '#ff6b9d' };
  }
  return { bg: ['#14080E', '#8B1A2B'], accent: '#D4AF37', motif: 'classic', glow: '#ff7a7a' };
}

function wrapLines(text, maxChars = 14, maxLines = 3) {
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

function motifSvg(motif, accent, glow) {
  switch (motif) {
    case 'tiles':
      return `
        <rect x="118" y="58" width="28" height="36" rx="4" fill="${accent}" opacity="0.95"/>
        <rect x="154" y="58" width="28" height="36" rx="4" fill="${accent}" opacity="0.75"/>
        <text x="132" y="82" text-anchor="middle" font-size="16" fill="#5a1208" font-family="Arial" font-weight="700">中</text>
        <circle cx="150" cy="52" r="18" fill="none" stroke="${glow}" stroke-width="3" opacity="0.55"/>`;
    case 'relic':
      return `
        <polygon points="150,48 168,78 150,98 132,78" fill="${accent}" opacity="0.95"/>
        <circle cx="150" cy="74" r="34" fill="none" stroke="${glow}" stroke-width="3" opacity="0.45"/>
        <circle cx="150" cy="74" r="18" fill="${glow}" opacity="0.25"/>`;
    case 'charm':
      return `
        <circle cx="150" cy="72" r="28" fill="${accent}" opacity="0.9"/>
        <circle cx="140" cy="64" r="4" fill="#2a1020"/>
        <circle cx="160" cy="64" r="4" fill="#2a1020"/>
        <path d="M138 78 Q150 90 162 78" stroke="#2a1020" stroke-width="3" fill="none"/>
        <circle cx="150" cy="72" r="40" fill="none" stroke="${glow}" stroke-width="3" opacity="0.4"/>`;
    case 'arena':
      return `
        <ellipse cx="150" cy="78" rx="46" ry="22" fill="none" stroke="${accent}" stroke-width="4"/>
        <circle cx="150" cy="68" r="16" fill="${accent}"/>
        <path d="M134 60 L166 76 M166 60 L134 76" stroke="#3a1808" stroke-width="3"/>`;
    case 'live':
      return `
        <rect x="118" y="54" width="64" height="40" rx="8" fill="${accent}" opacity="0.9"/>
        <circle cx="138" cy="74" r="8" fill="#082038"/>
        <rect x="152" y="66" width="22" height="16" rx="2" fill="#082038"/>
        <circle cx="150" cy="48" r="6" fill="${glow}"/>`;
    case 'action':
      return `
        <polygon points="150,46 175,90 125,90" fill="${accent}" opacity="0.95"/>
        <circle cx="150" cy="78" r="10" fill="#2a0810"/>
        <circle cx="150" cy="72" r="42" fill="none" stroke="${glow}" stroke-width="3" opacity="0.45"/>`;
    case 'fortune':
      return `
        <circle cx="150" cy="72" r="26" fill="${accent}"/>
        <text x="150" y="80" text-anchor="middle" font-size="22" fill="#5a4208" font-family="Arial" font-weight="700">$</text>
        <circle cx="150" cy="72" r="40" fill="none" stroke="${glow}" stroke-width="3" opacity="0.5"/>`;
    case 'mystic':
      return `
        <path d="M150 46 L170 90 L130 90 Z" fill="${accent}" opacity="0.9"/>
        <circle cx="150" cy="70" r="8" fill="#180828"/>
        <circle cx="150" cy="72" r="40" fill="none" stroke="${glow}" stroke-width="3" opacity="0.45"/>`;
    case 'vip':
      return `
        <circle cx="150" cy="70" r="30" fill="${accent}" opacity="0.85"/>
        <text x="150" y="78" text-anchor="middle" font-size="18" fill="#4a1830" font-family="Arial" font-weight="700">VIP</text>
        <circle cx="150" cy="70" r="42" fill="none" stroke="${glow}" stroke-width="3" opacity="0.45"/>`;
    default:
      return `
        <circle cx="150" cy="70" r="28" fill="${accent}" opacity="0.9"/>
        <text x="150" y="78" text-anchor="middle" font-size="16" fill="#4a1020" font-family="Arial" font-weight="700">CQ9</text>
        <circle cx="150" cy="70" r="40" fill="none" stroke="${glow}" stroke-width="3" opacity="0.4"/>`;
  }
}

function svgFor(game) {
  const code = String(game.gamecode ?? '');
  const title = displayTitle(game);
  const theme = themeFor(title, code);
  const lines = wrapLines(title);
  const titleSvg = lines
    .map((line, i) => {
      const y = 148 + i * 18 - (lines.length - 1) * 8;
      return `<text x="150" y="${y}" text-anchor="middle" fill="#FFF8EC" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700">${escapeXml(line)}</text>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.bg[0]}"/>
      <stop offset="100%" stop-color="${theme.bg[1]}"/>
    </linearGradient>
    <radialGradient id="spot" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="${theme.glow}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${theme.glow}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#000000"/>
  <circle cx="150" cy="105" r="88" fill="url(#bg)"/>
  <circle cx="150" cy="105" r="88" fill="url(#spot)"/>
  <circle cx="150" cy="105" r="88" fill="none" stroke="${theme.accent}" stroke-width="4"/>
  <circle cx="150" cy="105" r="80" fill="none" stroke="${theme.accent}" stroke-opacity="0.35" stroke-width="2"/>
  ${motifSvg(theme.motif, theme.accent, theme.glow)}
  ${titleSvg}
</svg>`;
}

async function main() {
  if (!fs.existsSync(catalogPath) || !fs.existsSync(missingPath)) {
    console.error('Need cq9-games.json and .tmp-cq9-missing-thumbs.json');
    process.exit(1);
  }

  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const missing = JSON.parse(fs.readFileSync(missingPath, 'utf8')).map((s) =>
    String(s).split(':')[0],
  );
  const byCode = new Map(catalog.map((g) => [String(g.gamecode), g]));
  fs.mkdirSync(outDir, { recursive: true });

  let written = 0;
  for (const code of missing) {
    const game = byCode.get(code) || { gamecode: code, gamename: code };
    const out = path.join(outDir, `${code}.png`);
    const svg = Buffer.from(svgFor(game));
    // pad like official downloads: circle with black letterbox
    const fitted = await sharp(svg)
      .resize(Math.round(WIDTH * 0.86), Math.round(HEIGHT * 0.86), { fit: 'inside' })
      .png()
      .toBuffer();
    await sharp({
      create: { width: WIDTH, height: HEIGHT, channels: 3, background: { r: 0, g: 0, b: 0 } },
    })
      .composite([{ input: fitted, gravity: 'centre' }])
      .png({ compressionLevel: 9 })
      .toFile(out);
    written += 1;
  }

  const aliasSrc = path.join(outDir, 'VPCQGP01_GROUP.png');
  const aliasDst = path.join(outDir, 'VPCQGP01 GROUP.png');
  if (fs.existsSync(aliasSrc)) fs.copyFileSync(aliasSrc, aliasDst);

  console.log(`Generated ${written} missing thumbnails`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
