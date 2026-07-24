/**
 * Pad CQ9 thumbnails to exact 4:3 without cropping the circular emblem.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../public/providers/cq9');
const WIDTH = 400;
const HEIGHT = 300; // 4:3

const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.png'));
let n = 0;
for (const f of files) {
  const fp = path.join(dir, f);
  const buf = fs.readFileSync(fp);
  await sharp(buf)
    .resize(WIDTH, HEIGHT, {
      fit: 'contain',
      position: 'centre',
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    })
    .png({ compressionLevel: 9 })
    .toFile(fp + '.tmp');
  fs.renameSync(fp + '.tmp', fp);
  n += 1;
  if (n % 50 === 0) console.log(`… ${n}/${files.length}`);
}
console.log(`Padded ${n} files to ${WIDTH}x${HEIGHT} (contain)`);
