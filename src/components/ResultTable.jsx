import React from "react";
import { roundRowsToKurus } from "../lib/feraiz.js";

const fmt = (n) =>
  Number(n).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Pay çubuğu — tek seri (aynı ölçünün oranı), tek renk; kimliği satır etiketi taşır.
// Renkler kontrast/krom doğrulamasından geçirildi: açıkta #1baf7a, koyuda #199e70.
function ShareBar({ pct }) {
  return (
    <div className="mt-1 flex items-center gap-2" aria-hidden="true">
      <div className="h-1.5 flex-1 max-w-40 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#1baf7a] dark:bg-[#199e70]"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-ink/60 dark:text-slate-400">%{pct.toLocaleString("tr-TR", { maximumFractionDigits: 1 })}</span>
    </div>
  );
}

export default function ResultTable({ result }) {
  const rounded = roundRowsToKurus(result.rows, result.netForHeirs);
  const cardCls = "rounded-xl p-3 border border-subtle bg-white/70 dark:bg-slate-800 dark:border-slate-700";

  return (
    <section id="print-area" className="print-area bg-paper rounded-2xl p-5 shadow-soft border border-subtle dark:bg-slate-800/60 dark:border-slate-700">
      {/* Print Header */}
      <div className="flex justify-between items-center border-b border-subtle dark:border-slate-700 pb-2 mb-4">
        <div className="flex items-center gap-2">
          <i className="fas fa-balance-scale text-2xl text-accent"></i>
          <div>
            <h1 className="text-xl font-bold text-ink dark:text-slate-100">Feraiz.com</h1>
            <p className="text-xs text-ink/70 dark:text-slate-400">Feraiz: Kur'an'da belirlenmiş miras payları</p>
          </div>
        </div>
        <div className="text-sm text-ink/70 dark:text-slate-400">{new Date().toLocaleDateString("tr-TR")}</div>
      </div>

      {/* Besmele */}
      <div className="hidden text-center mb-3">
        <div className="text-2xl font-arabic">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        <div className="text-sm text-primary/80 mt-1">Rahmân ve Rahîm olan Allah'ın adıyla</div>
      </div>

      <h2 className="text-lg font-semibold mb-4 text-primary dark:text-slate-100">Sonuç</h2>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className={cardCls}>
          <div className="text-primary/80 dark:text-slate-300">Net Tereke (dağıtılacak)</div>
          <div className="text-xl font-semibold">{fmt(result.netForHeirs)} ₺</div>
        </div>
        <div className={cardCls}>
          <div className="text-primary/80 dark:text-slate-300">Toplam Dağıtılan</div>
          <div className="text-xl font-semibold">{fmt(result.sumAllocated)} ₺</div>
        </div>
      </div>

      {/* Motor uyarıları (yok sayılan temsil satırları, dağıtılamayan tutar vb.) */}
      {result.warnings?.length > 0 && (
        <div className="mt-3 grid gap-2">
          {result.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-700 p-3 text-sm text-amber-900 dark:text-amber-200">
              <i className="fa-solid fa-triangle-exclamation mt-0.5 text-amber-600 dark:text-amber-400"></i>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-2xl border border-subtle dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-accent/30 dark:bg-slate-700/60">
            <tr>
              <th className="text-left p-2">Mirasçı</th>
              <th className="text-left p-2">Oran</th>
              <th className="text-left p-2 hidden sm:table-cell">Dayanak</th>
              <th className="text-right p-2">Tutar (₺)</th>
            </tr>
          </thead>
          <tbody>
            {rounded.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-primary/70 dark:text-slate-400">Henüz pay yok. Girdileri doldurun.</td>
              </tr>
            )}
            {rounded.map((r, idx) => (
              <tr key={idx} className={r.warning ? "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200" : "odd:bg-light/60 dark:odd:bg-slate-800/80"}>
                <td className="p-2 align-top">
                  {r.heir}
                  {!r.warning && result.netForHeirs > 0 && (
                    <ShareBar pct={(r.amount / result.netForHeirs) * 100} />
                  )}
                </td>
                <td className="p-2 align-top">{r.fraction}</td>
                <td className="p-2 align-top text-primary/70 dark:text-slate-400 hidden sm:table-cell">{r.basis}</td>
                <td className="p-2 align-top text-right tabular-nums whitespace-nowrap">{fmt(r.amount)} ₺</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Not & Uyarı */}
      <div className="mt-5 grid gap-3">
        <div className="flex items-start gap-3 rounded-xl border border-accent/50 bg-accent/15 dark:bg-accent/10 p-3">
          <i className="fa-solid fa-hand-holding-heart mt-0.5"></i>
          <p className="text-sm text-ink/90 dark:text-slate-200">
            <strong>Not:</strong> Unutmayın: Mirasçı olmayan ihtiyaç sahiplerine de bir pay verin. (Nisâ 4/8)
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/40 dark:border-red-800 p-3">
          <i className="fa-solid fa-triangle-exclamation text-red-600 dark:text-red-400 mt-0.5"></i>
          <div className="text-sm text-red-800 dark:text-red-200">
            <p className="leading-7">
              Birinize ölüm geldiğinde ve geriye mal bıraktığında; ana-baba ve en yakınlara karşı size yüklenen o vasiyeti
              (mirası paylaştırma görevini), marufa (belirlenmiş paylara göre) yerine getirmeniz size farz kılınmıştır.
              Bu, yanlışlardan sakınanların boynuna borçtur. Bu emri duyduktan sonra kim onun yerine başka bir şey koyarsa,
              günahı onu değiştirenin boynunadır. Allah daima işitendir, bilendir.
            </p>
            <p className="mt-1 text-xs opacity-80">Bakara 2:180-181</p>
          </div>
        </div>
      </div>
    </section>
  );
}
