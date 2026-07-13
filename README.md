# Feraiz.com — Ayet Bazlı Miras Hesaplayıcı / Quran-Based Islamic Inheritance Calculator

**🇹🇷 Türkçe** | [🇬🇧 English below](#english)

Süleymaniye Vakfı meali esaslı feraiz (İslam miras hukuku) hesaplayıcısı. React + Vite + Tailwind.
Hesaplama kuralları [anayasa.md](anayasa.md) belgesinde tanımlıdır; motor bu kurallara **43 otomatik testle** bağlanmıştır. Canlı: **https://feraiz.com**

**Diller:** Türkçe · English · العربية · Deutsch · Français

## Özellikler
- Eş, çocuk/torun (temsil), anne-baba, öz/baba-bir/anne-bir kardeş ve yeğen (temsil) payları
- Adım adım hesap açıklaması (anayasa madde referanslarıyla)
- Sonucu link olarak paylaşma, senaryo kaydetme (tarayıcıda), yazdır/PDF
- 5 dil + RTL (Arapça), karanlık tema
- "Para asla ortada kalmaz" (Madde 9) garantisi: mirasçısı olmayan kalan, amme malı olarak gösterilir

## Geliştirme
```bash
npm install
npm run dev        # http://localhost:5173
npm run test       # motor + codec + i18n testleri (her değişiklikten sonra çalıştırın)
npm run anayasa    # anayasa.md değiştiyse public/anayasa.html'i yeniden üret
```

## Proje yapısı
- `src/lib/feraiz.js` — hesap motoru (saf fonksiyon; `anayasa.md`'ye bağlı, dil sözlüğü parametreli)
- `src/lib/feraiz.test.js` — anayasa maddelerine göre senaryo testleri
- `src/i18n/` — dil sözlükleri (tr/en/ar/de/fr) ve yerelleştirme çekirdeği
- `src/lib/urlState.js` — paylaşım linki / senaryo kaydı codec'i
- `anayasa.md` — hesaplama kurallarının tek ve bağlayıcı kaynağı (Türkçe asıl metin)
- `public/` — statik dosyalar (anayasa.html, meal alt sitesi, privacy/terms, ads.txt)

## Katkı
Katkılar memnuniyetle karşılanır. Kurallar:
1. **Hesap davranışını değiştiren her PR, `anayasa.md` güncellemesi ve test içermelidir.** Anayasa ile motor asla ayrışamaz.
2. `npm run test` yeşil olmadan PR açmayın.
3. Yeni dil eklemek için `src/i18n/locales/` altına Türkçe sözlükle aynı anahtarları taşıyan bir dosya ekleyin — `i18n.test.js` eksik anahtarı otomatik yakalar.

## Reklam ayarları
AdSense slot ID'leri ortam değişkeninden okunur; `.env.example` → `.env.local` kopyalayıp doldurun.

## Yayınlama (Release Checklist)
1. `npm run test` → tüm testler yeşil
2. `npm run build` → `dist/`
3. `npm run preview` ile smoke: hesap doğru, paylaş linki çalışıyor, 5 dil + RTL görünümü, print, `/anayasa.html`, `/meal/`, `/privacy.html`, `/ads.txt` erişilebilir
4. `dist/` içeriğini hosting'e yükleyin (önceki yayın git tag'lerinde saklıdır)
5. Canlıda bir senaryoyu elle doğrulayın

## Lisans
[AGPL-3.0-or-later](LICENSE) — bu projeyi (değiştirerek de olsa) bir sunucuda çalıştıran herkes,
kaynak kodunu kullanıcılarına açık tutmakla yükümlüdür. Amaç: bu araç her zaman açık kalsın.

Yasal Uyarı: Bu araç bilgilendirme amaçlıdır; yasal veya dinî danışmanlık niteliği taşımaz.

---

<a name="english"></a>
# English

An Islamic inheritance (faraid) calculator based on the Quran, following the Suleymaniye Foundation
rendering. Built with React + Vite + Tailwind. The calculation rules are defined in
[anayasa.md](anayasa.md) (the "constitution", Turkish original is authoritative) and the engine is
pinned to those rules by **43 automated tests**. Live at **https://feraiz.com**.

**Languages:** Türkçe · English · العربية · Deutsch · Français

## Features
- Shares for spouse, children/grandchildren (representation), parents, full/paternal/maternal siblings and nephews (representation)
- Step-by-step explanation of every calculation with article references
- Shareable result links, saved scenarios (browser-local), print/PDF
- 5 languages incl. RTL Arabic, dark mode
- "Money is never left over" guarantee (Article 9): an heirless residue is shown as public property

## Contributing
1. **Any PR that changes calculation behaviour must update `anayasa.md` and the tests.** The engine and the constitution must never diverge.
2. Run `npm run test` before opening a PR.
3. To add a language, drop a file into `src/i18n/locales/` mirroring the Turkish dictionary keys — `i18n.test.js` catches missing keys automatically.

## License
[AGPL-3.0-or-later](LICENSE). Anyone running this project (even modified) on a server must keep the
source available to its users — so the tool stays open forever.

Disclaimer: this tool is informational only; it is not legal or religious advice.
