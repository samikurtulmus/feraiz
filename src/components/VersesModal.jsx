import React from "react";

const CARD_DATA = [
  {
    id: "nisa-4-11",
    surah: "Nisâ",
    ref: "4/11",
    arabic: "…",
    tr: "Allah, ölenin evladı konusunda size görev yüklemektedir…",
    link: import.meta.env.BASE_URL + "ayetler.html#nisa-4-11"
  },
  {
    id: "nisa-4-12",
    surah: "Nisâ",
    ref: "4/12",
    arabic: "…",
    tr: "Hanımlarınızın çocukları yoksa bıraktıklarının yarısı sizindir…",
    link: import.meta.env.BASE_URL + "ayetler.html#nisa-4-12"
  },
  {
    id: "nisa-4-176",
    surah: "Nisâ",
    ref: "4/176",
    arabic: "…",
    tr: "Senden fetva istiyorlar. Kelâle ile ilgili fetvayı Allah veriyor…",
    link: import.meta.env.BASE_URL + "ayetler.html#nisa-4-176"
  },
  {
    id: "nisa-4-8",
    surah: "Nisâ",
    ref: "4/8",
    arabic: "…",
    tr: "Paylaşım sırasında akrabalar, yetimler ve yoksullar bulunursa…",
    link: import.meta.env.BASE_URL + "ayetler.html#nisa-4-8"
  },
];

export default function VersesModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-paper text-ink w-[min(880px,94vw)] rounded-2xl p-6 shadow-soft border border-subtle">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-primary">Hesaplamada Referans Verilen Ayetler</h3>
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-secondary text-white">Kapat</button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CARD_DATA.map(card => (
            <div key={card.id} className="rounded-xl border border-subtle bg-white/80 p-3 shadow-sm">
              <div className="text-xs text-ink/60 mb-1">{card.surah} — {card.ref}</div>
              <div className="text-lg leading-relaxed font-arabic">{card.arabic}</div>
              <div className="text-sm text-ink/80 mt-2">{card.tr}</div>
              <div className="mt-3 flex justify-end">
                <a className="text-sm underline text-primary" href={card.link} target="_blank" rel="noreferrer">
                  Detay / Kaynak
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
