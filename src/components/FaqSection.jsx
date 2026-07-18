import React from "react";
import { useLocale } from "../i18n/index.js";

// SSS — sayfadaki görünür içerik; FAQPage yapılandırılmış verisi (applySeo)
// aynı sözlük girdilerinden beslenir, ikisi asla ayrışamaz.
export default function FaqSection() {
  const { t } = useLocale();
  if (!t.faq?.length) return null;

  return (
    <section className="no-print mt-4 rounded-2xl border border-subtle bg-paper dark:bg-slate-800 dark:border-slate-700 p-5">
      <h2 className="font-semibold text-primary dark:text-slate-100 mb-2">
        <i className="fa-solid fa-circle-question me-2 text-accent"></i>
        {t.faqTitle}
      </h2>
      <div className="divide-y divide-subtle dark:divide-slate-700">
        {t.faq.map((f, i) => (
          <details key={i} className="py-2">
            <summary className="cursor-pointer select-none text-sm font-medium text-ink dark:text-slate-200">
              {f.q}
            </summary>
            <p className="mt-2 text-sm leading-6 text-ink/80 dark:text-slate-300">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
