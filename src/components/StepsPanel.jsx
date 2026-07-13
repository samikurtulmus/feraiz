import React, { useState } from "react";

// Hesabın adım adım açıklaması — motorun ürettiği steps[] listesini
// anayasa madde referanslarıyla birlikte gösterir.
export default function StepsPanel({ steps }) {
  const [open, setOpen] = useState(false);
  if (!steps || steps.length === 0) return null;

  return (
    <div className="no-print mt-4 rounded-2xl border border-subtle bg-paper dark:bg-slate-800 dark:border-slate-700">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
        aria-expanded={open}
      >
        <span className="font-semibold text-primary dark:text-slate-100">
          <i className="fa-solid fa-list-ol mr-2 text-accent"></i>
          Hesap nasıl yapıldı? (adım adım)
        </span>
        <i className={`fa-solid fa-chevron-${open ? "up" : "down"} text-primary/60 dark:text-slate-400`}></i>
      </button>
      {open && (
        <ol className="px-5 pb-4 space-y-2 list-decimal list-inside text-sm text-ink/90 dark:text-slate-200">
          {steps.map((s, i) => (
            <li key={i} className="leading-6">{s}</li>
          ))}
        </ol>
      )}
    </div>
  );
}
