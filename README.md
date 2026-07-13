# Feraiz Hesaplayıcı — React + Vite + Tailwind (Windows 11)

## Gerekenler
- Node.js 18+ (https://nodejs.org)
- Bir terminal (Komut İstemi, PowerShell veya Windows Terminal)

## Kurulum
1. Bu klasörü açın ve terminalde şu komutları çalıştırın:
   ```bash
   npm install
   npm run dev
   ```
2. Terminalde çıkan yerel adresi (genelde `http://localhost:5173`) tarayıcıda açın.

## Build (Statik Çıktı)
```bash
npm run build
npm run preview
```
`dist/` klasörünü hostinginize yükleyebilirsiniz.

## Notlar
- `src/lib/feraiz.js` içinde hesaplama mantığı vardır.
- `public/` içinde `ayetler.html` ve kart görünümü `ilgili-ayetler.html` mevcuttur.
- Tasarım Tailwind CSS ile yapılmıştır.
