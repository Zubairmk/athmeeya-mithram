import sharp from "sharp";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, "..", "public", "icons");
const svg = readFileSync(path.join(iconsDir, "icon-source.svg"));

// Maskable icon needs the artwork inset within a ~40% safe-zone circle
// so Android's shape mask doesn't clip it.
const maskableSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#16332E"/>
  <g transform="translate(256 256) scale(0.6) translate(-256 -256)">
    <circle cx="256" cy="256" r="120" fill="#C79A46"/>
    <circle cx="305" cy="222" r="102" fill="#16332E"/>
  </g>
</svg>
`;

const targets = [
  { file: "icon-192.png", size: 192, source: svg },
  { file: "icon-512.png", size: 512, source: svg },
  { file: "apple-touch-icon.png", size: 180, source: svg },
  { file: "icon-maskable-512.png", size: 512, source: Buffer.from(maskableSvg) },
];

for (const target of targets) {
  await sharp(target.source)
    .resize(target.size, target.size)
    .png()
    .toFile(path.join(iconsDir, target.file));
  console.log(`wrote ${target.file}`);
}
