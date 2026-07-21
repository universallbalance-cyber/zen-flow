// Generates PWA icon assets (apple-touch-icon, manifest icons, favicon) into public/
const path = require('path');
const Jimp = require('jimp-compact');

const SOURCE = path.join(__dirname, '..', 'assets', 'icon.png');
const OUT_DIR = path.join(__dirname, '..', 'public');
const BG = 0x1a2535ff; // matches app.json splash/adaptive-icon backgroundColor

async function flattenOnBackground(image, size) {
  const canvas = new Jimp(size, size, BG);
  const resized = image.clone().resize(size, size, Jimp.RESIZE_BICUBIC);
  canvas.composite(resized, 0, 0);
  return canvas;
}

async function main() {
  const source = await Jimp.read(SOURCE);

  const targets = [
    { file: 'apple-touch-icon.png', size: 180, flatten: true },
    { file: 'icon-192.png', size: 192, flatten: true },
    { file: 'icon-512.png', size: 512, flatten: true },
    { file: 'icon-512-maskable.png', size: 512, flatten: true },
    { file: 'favicon-32.png', size: 32, flatten: true },
    { file: 'favicon-16.png', size: 16, flatten: true },
  ];

  for (const t of targets) {
    const img = t.flatten ? await flattenOnBackground(source, t.size) : source.clone().resize(t.size, t.size, Jimp.RESIZE_BICUBIC);
    const dest = path.join(OUT_DIR, t.file);
    await img.writeAsync(dest);
    console.log('wrote', dest);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
