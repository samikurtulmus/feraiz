# Feraiz.com — Ayet Bazlı Miras Hesaplayıcı

React + Vite + Tailwind ile geliştirilmiş, Süleymaniye Vakfı meali esaslı feraiz (İslam miras hukuku) hesaplayıcısı. Hesaplama kuralları `anayasa.md` belgesinde tanımlıdır; motor bu kurallara test paketiyle bağlanmıştır.

## Gerekenler
- Node.js 18+ (https://nodejs.org)

## Geliştirme
```bash
npm install
npm run dev        # http://localhost:5173
npm run test       # hesap motoru + codec testleri (her değişiklikten sonra çalıştırın)
```

## Proje yapısı
- `src/lib/feraiz.js` — hesap motoru (saf fonksiyon; `anayasa.md`'ye bağlı)
- `src/lib/feraiz.test.js` — anayasa maddelerine göre senaryo testleri
- `src/lib/urlState.js` — paylaşım linki / senaryo kaydı codec'i
- `src/lib/scenarios.js` — localStorage senaryo kayıtları
- `anayasa.md` — hesaplama kurallarının tek kaynağı (v2.7)
- `public/` — statik dosyalar (meal alt sitesi, privacy/terms, ads.txt, favicon'lar)

## Reklam ayarları
AdSense slot ID'leri ortam değişkeninden okunur; `.env.example` dosyasını `.env.local`
olarak kopyalayıp gerçek slot ID'lerini girin. Girilmezse placeholder kullanılır.

## Yayınlama (Release Checklist)
1. `npm run test` → tüm testler yeşil olmalı (kırmızı varken yayınlamayın)
2. `npm run build` → `dist/` oluşur
3. `npm run preview` ile dumanı testi:
   - Hesap: eş + anne + baba + 1 kız senaryosunda toplam = net olmalı
   - Paylaş butonu link üretiyor, link yeni sekmede aynı sonucu açıyor
   - Yazdır / PDF önizlemesi düzgün
   - `/meal/`, `/privacy.html`, `/terms.html`, `/ads.txt` erişilebilir
   - Karanlık tema düğmesi çalışıyor
4. `dist/` içeriğini hosting'e yükleyin (bir önceki yayın `v1-prod` git tag'inde saklıdır)
5. Yayın sonrası canlıda 3. adımdaki senaryoyu elle doğrulayın; AdSense konsolunda reklam durumunu kontrol edin

## Notlar
- Kapsam: eş, çocuk/torun (temsil), anne-baba, kardeş/yeğen (temsil). Dede/nine, amca vb. kapsam dışıdır (`anayasa.md` Madde 10).
- Para asla ortada kalmaz: dağıtılamayan tutar varsa sonuçta uyarı satırı olarak görünür (Madde 9).
- Tutarlar kuruşa yuvarlanır; yuvarlama farkı en büyük kesir yöntemiyle dağıtılır, toplam daima net'e eşittir.
