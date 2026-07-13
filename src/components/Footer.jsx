import React from "react";

export default function Footer() {
  return (
    <footer className="bg-primary text-light py-6 mt-12 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm space-y-2 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <p>
          2025 Feraiz.com | Tüm hakları saklıdır. {"|"}{" "}
          <a href="mailto:smkrtlms@gmail.com" className="underline">İletişim</a>
        </p>
        <p className="text-xs">
          Yasal Uyarı: Bu araç, bilgilendirme amaçlıdır. Yasal veya dini bir danışmanlık niteliği taşımaz.
        </p>
        <p className="text-xs">
          <a href={import.meta.env.BASE_URL + 'privacy.html'} className="underline">Gizlilik</a>
          {" | "}
          <a href={import.meta.env.BASE_URL + 'terms.html'} className="underline">Koşullar</a>
        </p>
      </div>
    </footer>
  );
}

