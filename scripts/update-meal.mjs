// Ayet Panosu meal güncelleyici — npm run meal
//
// suleymaniyevakfimeali.com'daki 114 sure sayfasını nazik bir hızda çeker,
// ayetleri ayrıştırır, dipnot işaretçilerini ([*], [1*] ... [10*]) temizler ve
// public/meal/tum_ayetlerwitharabic.json içindeki meal metinlerini günceller.
// Arapça metinlere ve kayıt sırasına dokunmaz; her surede ayet sayısını doğrular.
import { readFileSync, writeFileSync } from "node:fs";

const BASE = "https://www.suleymaniyevakfimeali.com";
const JSON_URL = new URL("../public/meal/tum_ayetlerwitharabic.json", import.meta.url);
const BEKLEME_MS = 350; // sunucuya nazik davran

const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

async function getir(url) {
  for (let deneme = 1; deneme <= 3; deneme++) {
    try {
      // Sunucu, "Mozilla" ile başlamayan User-Agent'lara 500 döndürüyor
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; feraiz.com meal guncelleme; +https://github.com/samikurtulmus/feraiz)" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (deneme === 3) throw new Error(`${url} alınamadı: ${e.message}`);
      await bekle(2000);
    }
  }
}

// HTML entity çözümü (sayfalarda geçen adlandırılmış + sayısal entity'ler)
const ENTITY = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…", ndash: "–", mdash: "—" };
function entityCoz(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-zA-Z]+);/g, (m, ad) => ENTITY[ad] ?? m);
}

// Dipnot işaretçileri + işaretçiden boşalan noktalama temizliği
function temizle(metin) {
  return metin
    .replace(/\[\s*\d{0,2}\s*\*?\s*\]/g, "")
    .replace(/ /g, " ")
    .replace(/\(\s*\)/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/ +([.,;:!?…])/g, "$1")
    .replace(/\s*\n\s*/g, " ")
    .trim()
    .replace(/[([]\s*$/, "")
    .trim();
}

// --- 1) Ana sayfadan kanonik sırada sure linkleri ---
const ana = await getir(BASE + "/");
const linkler = [...new Set([...ana.matchAll(/href="(\/Meal\/[^"]+\.htm)"/g)].map((m) => m[1]))];
if (linkler.length !== 114) throw new Error(`114 sure linki bekleniyordu, ${linkler.length} bulundu`);

// --- 2) Mevcut JSON ve sure grupları (kayıt sırası korunur) ---
const veriler = JSON.parse(readFileSync(JSON_URL, "utf-8"));
const sureSirasi = [...new Set(veriler.map((a) => a.sure_adi))];
if (sureSirasi.length !== 114) throw new Error("JSON'da 114 sure bekleniyordu");

// --- 3) Sureleri çek, ayrıştır, güncelle ---
const AYET_RE = /<span id="(\d+)text">([\s\S]*?)<\/span>/g;
let degisen = 0, ayni = 0, eksik = 0;

const alinamayanlar = [];
for (let i = 0; i < 114; i++) {
  const sureAdi = sureSirasi[i];
  // Kaynak site zaman zaman tek tek sayfalarda 500 dönebiliyor;
  // alınamayan surenin mevcut metni korunur, iş iptal edilmez.
  let sayfa = "";
  try {
    sayfa = await getir(BASE + linkler[i]);
  } catch (e) {
    alinamayanlar.push(sureAdi);
    console.warn(`\n⚠ ${sureAdi} alınamadı (${e.message}) — mevcut metin korunuyor`);
  }
  await bekle(BEKLEME_MS);

  const siteAyetler = new Map();
  for (const m of sayfa.matchAll(AYET_RE)) {
    const parca = m[2].split("<hr")[0].replace(/<[^>]+>/g, "");
    siteAyetler.set(Number(m[1]), temizle(entityCoz(parca)));
  }

  const kayitlar = veriler.filter((a) => a.sure_adi === sureAdi);
  if (siteAyetler.size !== kayitlar.length) {
    console.warn(`⚠ ${sureAdi}: sitede ${siteAyetler.size}, bizde ${kayitlar.length} ayet — sayılar farklı!`);
  }
  for (const a of kayitlar) {
    const yeni = siteAyetler.get(a.ayet_numarasi);
    const eskiTemiz = temizle(a.meal);
    if (yeni && yeni.length > 3) {
      yeni !== eskiTemiz ? degisen++ : ayni++;
      a.meal = yeni;
    } else {
      eksik++;
      a.meal = eskiTemiz; // site vermezse en azından işaretçisiz hali kalsın
    }
  }
  process.stdout.write(`\r${i + 1}/114 ${sureAdi}                    `);
}

// --- 4) Doğrulama ve yazma ---
if (veriler.length !== 6236) throw new Error("Toplam ayet sayısı bozuldu!");
const kalanMarker = veriler.filter((a) => /\[\s*\d{0,2}\s*\*?\s*\]/.test(a.meal)).length;
const bos = veriler.filter((a) => !a.meal.trim()).length;
console.log(`\n\ndeğişen: ${degisen} | aynı: ${ayni} | sitede bulunamayan: ${eksik}`);
console.log(`kalan işaretçi: ${kalanMarker} | boş meal: ${bos}`);
if (alinamayanlar.length) console.log(`alınamayan sureler (eski metin korundu): ${alinamayanlar.join(", ")} — daha sonra tekrar deneyin`);
if (kalanMarker || bos) throw new Error("Doğrulama başarısız — JSON yazılmadı!");

writeFileSync(JSON_URL, JSON.stringify(veriler, null, 1), "utf-8");
console.log("public/meal/tum_ayetlerwitharabic.json güncellendi");
