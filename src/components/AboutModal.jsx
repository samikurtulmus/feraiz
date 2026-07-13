import React from "react";
import { useLocale } from "../i18n/index.js";

export default function AboutModal({ open, onClose }) {
  const { t } = useLocale();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="about-title">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-paper text-ink dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 w-[min(640px,92vw)] max-h-[85vh] overflow-y-auto rounded-2xl p-6 shadow-soft border border-subtle">
        <h3 id="about-title" className="text-xl font-bold text-primary dark:text-slate-100 mb-3">{t.aboutTitle}</h3>

        <div className="space-y-3 text-sm text-ink/90 dark:text-slate-200 leading-relaxed">
          <p>{t.aboutP1}</p>

          <ul className="list-disc ps-5 space-y-1">
            <li>{t.aboutB1}</li>
            <li>{t.aboutB2}</li>
            <li>{t.aboutB3}</li>
            <li>{t.aboutB4}</li>
          </ul>

          <p>{t.aboutScope}</p>

          <p>
            {t.aboutRules}{" "}
            <a className="underline" href={import.meta.env.BASE_URL + "kurallar.html"} target="_blank" rel="noopener">
              {t.rulesLink}
            </a>
          </p>

          <p className="text-ink/80 dark:text-slate-300">{t.aboutLegal}</p>

          <p className="text-ink/80 dark:text-slate-300">
            {t.aboutContactLabel} <a className="underline" href="mailto:smkrtlms@gmail.com">smkrtlms@gmail.com</a>
          </p>
        </div>

        <div className="mt-5 flex justify-end">
          <button onClick={onClose} className="px-3 py-2 rounded-xl bg-secondary text-white hover:opacity-90">
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
