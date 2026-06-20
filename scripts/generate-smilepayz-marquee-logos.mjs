import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../public/payment-logos/marquee');
const methodsPath = path.join(__dirname, '../src/data/smilepayzPaymentMethods.json');
const SMILEPAYZ_PAYMENT_METHODS = JSON.parse(readFileSync(methodsPath, 'utf8'));
const WIDTH = 184;
const HEIGHT = 60;

function fontSize(label) {
  if (label.length > 14) return 16;
  if (label.length > 10) return 18;
  if (label.length > 7) return 22;
  return 26;
}

function abbrev(label) {
  const words = label.split(/\s+/).filter(Boolean);
  if (words.length === 1) return label.slice(0, 4).toUpperCase();
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function buildSvg({ label, color }) {
  const fs = fontSize(label);
  const abbr = abbrev(label);
  const textColor = color.toLowerCase() === '#ffd100' ? '#1A1A1A' : color;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="184" height="60" viewBox="0 0 184 60" fill="none">
    <rect x="18" y="18" width="24" height="24" rx="5" fill="${color}"/>
    <text x="30" y="35" text-anchor="middle" fill="${color === '#FFD100' ? '#1A1A1A' : '#FFFFFF'}" font-family="Arial, Helvetica, sans-serif" font-size="9" font-weight="800">${abbr}</text>
    <text x="108" y="39" text-anchor="middle" fill="${textColor}" font-family="Arial, Helvetica, sans-serif" font-size="${fs}" font-weight="800">${label}</text>
  </svg>`;
}

const customSvgs = {
  gcash: `<svg xmlns="http://www.w3.org/2000/svg" width="184" height="60" viewBox="0 0 184 60" fill="none"><text x="92" y="39" text-anchor="middle" fill="#007DFE" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800">GCash</text></svg>`,
  maya: `<svg xmlns="http://www.w3.org/2000/svg" width="184" height="60" viewBox="0 0 184 60" fill="none"><circle cx="34" cy="30" r="14" fill="#00B14F"/><path d="M28 30c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><text x="108" y="39" text-anchor="middle" fill="#00B14F" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700">maya</text></svg>`,
  grabpay: `<svg xmlns="http://www.w3.org/2000/svg" width="184" height="60" viewBox="0 0 184 60" fill="none"><text x="92" y="39" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="800"><tspan fill="#00B14F">Grab</tspan><tspan fill="#1A1A1A">Pay</tspan></text></svg>`,
  shopeepay: `<svg xmlns="http://www.w3.org/2000/svg" width="184" height="60" viewBox="0 0 184 60" fill="none"><rect x="18" y="16" width="28" height="28" rx="8" fill="#EE4D2D"/><path d="M26 30h12M32 24v12" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><text x="112" y="39" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="800" fill="#EE4D2D">ShopeePay</text></svg>`,
  qris: `<svg xmlns="http://www.w3.org/2000/svg" width="184" height="60" viewBox="0 0 184 60" fill="none"><rect x="22" y="18" width="10" height="10" fill="#111"/><rect x="36" y="18" width="10" height="10" fill="#111"/><rect x="22" y="32" width="10" height="10" fill="#111"/><rect x="36" y="32" width="4" height="4" fill="#111"/><rect x="42" y="38" width="4" height="4" fill="#111"/><text x="112" y="39" text-anchor="middle" fill="#111" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="800">QRIS</text></svg>`,
  pix: `<svg xmlns="http://www.w3.org/2000/svg" width="184" height="60" viewBox="0 0 184 60" fill="none"><path d="M38 24l8 8-8 8M46 24l8 8-8 8" stroke="#32BCAD" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><text x="118" y="39" text-anchor="middle" fill="#32BCAD" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800">PIX</text></svg>`,
  upi: `<svg xmlns="http://www.w3.org/2000/svg" width="184" height="60" viewBox="0 0 184 60" fill="none"><path d="M24 38V22l8 10 8-10v16" stroke="#097939" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M24 22h16" stroke="#FF6F00" stroke-width="3" stroke-linecap="round"/><text x="118" y="39" text-anchor="middle" fill="#097939" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="800">UPI</text></svg>`,
  vietqr: `<svg xmlns="http://www.w3.org/2000/svg" width="184" height="60" viewBox="0 0 184 60" fill="none"><rect x="20" y="18" width="10" height="10" fill="#E31E24"/><rect x="34" y="18" width="10" height="10" fill="#1B3A68"/><rect x="20" y="32" width="10" height="10" fill="#1B3A68"/><rect x="34" y="32" width="10" height="10" fill="#E31E24"/><text x="112" y="39" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="800"><tspan fill="#E31E24">Viet</tspan><tspan fill="#1B3A68">QR</tspan></text></svg>`,
};

await mkdir(outDir, { recursive: true });

for (const method of SMILEPAYZ_PAYMENT_METHODS) {
  const svg = customSvgs[method.id] ?? buildSvg(method);
  const svgPath = path.join(outDir, `${method.id}.svg`);
  const pngPath = path.join(outDir, `${method.id}.png`);

  await writeFile(svgPath, svg.trim());
  await sharp(Buffer.from(svg.trim()))
    .resize(WIDTH, HEIGHT, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(pngPath);

  console.log(`Generated ${method.id}.png`);
}

console.log(`Done — ${SMILEPAYZ_PAYMENT_METHODS.length} SmilePayz payment logos.`);
