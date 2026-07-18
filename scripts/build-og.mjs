// Sosyal paylaşım görseli: public/og-image.png (1200×630)
// Marka ikonu (android-chrome-512) + başlık metni. İkon/başlık değişince: npm run og
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const icon = readFileSync(new URL("../public/android-chrome-512x512.png", import.meta.url));
const iconB64 = icon.toString("base64");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#1F4D3F"/>
  <rect x="0" y="614" width="1200" height="16" fill="#D9A441"/>
  <image href="data:image/png;base64,${iconB64}" x="80" y="135" width="360" height="360"/>
  <g font-family="Georgia, 'Times New Roman', serif">
    <text x="510" y="270" font-size="88" font-weight="bold" fill="#D9A441">Feraiz.com</text>
    <text x="512" y="345" font-size="38" fill="#F8F5EC">Ayet Bazlı Miras Hesaplayıcı</text>
    <text x="512" y="425" font-size="28" fill="#F8F5EC" opacity="0.85">Kur'an'da belirlenmiş miras payları —</text>
    <text x="512" y="463" font-size="28" fill="#F8F5EC" opacity="0.85">adım adım, şeffaf ve ücretsiz</text>
    <text x="512" y="540" font-size="24" fill="#D9A441" opacity="0.9">Türkçe · English · العربية · Deutsch · Français</text>
  </g>
</svg>`;

const png = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync(new URL("../public/og-image.png", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"), png);
console.log("public/og-image.png üretildi (1200×630)");
