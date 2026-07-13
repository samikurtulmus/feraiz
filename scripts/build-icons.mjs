// public/favicon.svg → tüm PNG ikonlar + favicon.ico
// İkon rengi/şekli değişince çalıştırın: npm run icons
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const svg = readFileSync(new URL("../public/favicon.svg", import.meta.url));
const out = (name) => new URL(`../public/${name}`, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const targets = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "android-chrome-192x192.png", size: 192 },
  { name: "android-chrome-512x512.png", size: 512 },
];

for (const t of targets) {
  const buf = await sharp(svg, { density: 512 }).resize(t.size, t.size).png().toBuffer();
  writeFileSync(out(t.name), buf);
  console.log(`${t.name} (${t.size}px)`);
}

const ico = await pngToIco([out("favicon-32x32.png"), out("favicon-16x16.png")]);
writeFileSync(out("favicon.ico"), ico);
console.log("favicon.ico");
