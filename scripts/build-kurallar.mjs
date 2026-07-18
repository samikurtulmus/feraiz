// KURALLAR.md → public/kurallar.html
// KURALLAR.md her değiştiğinde çalıştırın: npm run kurallar
import { readFileSync, writeFileSync } from "node:fs";
import { marked } from "marked";

const md = readFileSync(new URL("../KURALLAR.md", import.meta.url), "utf-8");
const body = marked.parse(md);

const html = `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Hesaplama Kuralları | Feraiz.com</title>
  <link rel="icon" href="/favicon.ico" />
  <meta name="description" content="Feraiz.com miras hesaplama motorunun dayandığı kuralların tam metni" />
  <link rel="canonical" href="https://feraiz.com/kurallar.html" />
  <meta property="og:title" content="Hesaplama Kuralları | Feraiz.com" />
  <meta property="og:description" content="Feraiz.com hesaplama kurallarının tam metni." />
  <meta property="og:type" content="article" />
  <meta property="og:locale" content="tr_TR" />
  <meta property="og:url" content="https://feraiz.com/kurallar.html" />
  <style>
    :root{color-scheme: light dark}
    body{font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; margin:0; color:#0f172a; background:#F8F5EC}
    .container{max-width:860px;margin:40px auto;padding:0 16px 64px}
    h1{font-size:26px;color:#1F4D3F;line-height:1.3}
    h2{font-size:20px;color:#1F4D3F;margin:32px 0 8px;border-bottom:2px solid #D9A441;padding-bottom:6px}
    h3{font-size:16px;color:#2E7D64;margin:20px 0 6px}
    p,li{line-height:1.75}
    a{color:#1F4D3F}
    blockquote{margin:12px 0;padding:10px 14px;background:#fff;border-inline-start:4px solid #D9A441;border-radius:8px}
    table{border-collapse:collapse;width:100%;margin:12px 0}
    th,td{border:1px solid #d9d4c5;padding:8px;text-align:start}
    thead{background:#1F4D3F;color:#fff}
    code{background:#efe9da;padding:1px 5px;border-radius:5px}
    pre{background:#efe9da;padding:12px;border-radius:10px;overflow-x:auto}
    hr{border:none;border-top:1px solid #d9d4c5;margin:28px 0}
    .top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:8px}
    .back{display:inline-block;background:#2E7D64;color:#fff;text-decoration:none;padding:8px 14px;border-radius:10px;font-size:14px}
    .note{background:#fff;border:1px solid #d9d4c5;border-radius:10px;padding:10px 14px;font-size:14px;margin:16px 0}
    @media (prefers-color-scheme: dark){
      body{background:#0f172a;color:#e2e8f0}
      h1,h2,a{color:#a7d7c5}
      h3{color:#7cc0a8}
      blockquote,.note{background:#1e293b;border-color:#334155}
      th,td{border-color:#334155}
      code,pre{background:#1e293b}
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="top">
      <a class="back" href="/">← feraiz.com</a>
    </div>
    <div class="note">
      Bu belge, feraiz.com hesaplama motorunun uyduğu kuralların <strong>tam ve bağlayıcı metnidir</strong>.
      Hesaplayıcıdaki her sonuç bu maddelerle test edilerek doğrulanır. Belgenin aslı Türkçedir. /
      <em>This document is the authoritative rule source of the feraiz.com calculator; the Turkish original prevails.</em>
    </div>
    ${body}
  </div>
</body>
</html>
`;

writeFileSync(new URL("../public/kurallar.html", import.meta.url), html, "utf-8");
console.log("public/kurallar.html üretildi");
