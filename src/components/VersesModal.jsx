import React from "react";
import { useLocale } from "../i18n/index.js";

// Ayet kartları: Süleymaniye Vakfı meali esaslı Türkçe kaynak metinler.
// Detay bağlantıları Ayet Panosu'na (meal alt sitesi) gider.
const CARD_DATA = [
  {
    id: "nisa-4-11",
    surah: "Nisâ",
    ref: "4/11",
    tr: "Allah, ölenin evladı konusunda size görev yüklemektedir…",
  },
  {
    id: "nisa-4-12",
    surah: "Nisâ",
    ref: "4/12",
    tr: "Hanımlarınızın çocukları yoksa bıraktıklarının yarısı sizindir…",
  },
  {
    id: "nisa-4-176",
    surah: "Nisâ",
    ref: "4/176",
    tr: "Senden fetva istiyorlar. Kelâle ile ilgili fetvayı Allah veriyor…",
  },
  {
    id: "nisa-4-8",
    surah: "Nisâ",
    ref: "4/8",
    tr: "Paylaşım sırasında akrabalar, yetimler ve yoksullar bulunursa…",
  },
];

export default function VersesModal({ open, onClose }) {
  const { t } = useLocale();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-paper text-ink dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 w-[min(880px,94vw)] max-h-[85vh] overflow-y-auto rounded-2xl p-6 shadow-soft border border-subtle">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-primary dark:text-slate-100">{t.versesTitle}</h3>
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-secondary text-white">{t.close}</button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {CARD_DATA.map((card) => (
            <div key={card.id} className="rounded-xl border border-subtle dark:border-slate-700 bg-white/80 dark:bg-slate-800 p-3 shadow-sm">
              <div className="text-xs text-ink/60 dark:text-slate-400 mb-1">{card.surah} — {card.ref}</div>
              <div className="text-sm text-ink/80 dark:text-slate-200 mt-1">{card.tr}</div>
              <div className="mt-3 flex justify-end">
                <a className="text-sm underline text-primary dark:text-slate-300" href={import.meta.env.BASE_URL + "meal/"} target="_blank" rel="noopener">
                  {t.versesOpen}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
