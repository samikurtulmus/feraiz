import React from "react";

const fmt = (n) => Number(n).toLocaleString("tr-TR");

export default function ResultTable({ result }) {
  return (
    <section id="print-area" className="print-area bg-paper rounded-2xl p-5 shadow-soft border border-subtle">
      {/* Print Header */}
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <div className="flex items-center gap-2">
          <i className="fas fa-balance-scale text-2xl text-accent"></i>
          <div>
            <h1 className="text-xl font-bold text-ink">Feraiz.com</h1>
            <p className="text-xs text-ink/70">Feraiz: Kur'an'da belirlenmiş miras payları</p>
          </div>
        </div>
        <div className="text-sm text-ink/70">{new Date().toLocaleDateString("tr-TR")}</div>
      </div>

      {/* Besmele */}
      <div className="hidden text-center mb-3">
        <div className="text-2xl font-arabic">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        <div className="text-sm text-primary/80 mt-1">Rahmân ve Rahîm olan Allah'ın adıyla</div>
      </div>

      {/* Ayet metni */}
      <div className="hidden mb-5 text-center max-w-3xl mx-auto">
        <p className="italic text-sm md:text-[15px] print:text-xs text-ink/90 leading-7 md:leading-8">
          Birinize ölüm geldiğinde ve geriye mal bıraktığında; ana-baba ve en yakınlara karşı size yüklenen o vasiyeti
          (mirası paylaştırma görevini), marufa (belirlenmiş paylara göre) yerine getirmeniz size farz kılınmıştır.
          Bu, yanlışlardan sakınanların boynuna borçtur. Bu emri duyduktan sonra kim onun yerine başka bir şey koyarsa,
          günahı onu değiştirenin boynunadır. Allah daima işitendir, bilendir.
        </p>
        <p className="mt-2 text-sm text-primary/70">Bakara 2:180–181</p>
      </div>

      <h2 className="text-lg font-semibold mb-4 text-primary">Sonuç</h2>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl p-3 border border-subtle bg-white/70">
          <div className="text-primary/80">Net (Vasiyet/Borç öncesi)</div>
          <div className="text-xl font-semibold">{fmt(result.netBeforeWill)} ₺</div>
        </div>
        <div className="rounded-xl p-3 border border-subtle bg-white/70">
          <div className="text-primary/80">Vasiyet/Borç indirimi</div>
          <div className="text-xl font-semibold">{fmt(result.will)} ₺</div>
        </div>
        <div className="rounded-xl p-3 border border-subtle bg-white/70">
          <div className="text-primary/80">Mirasçılara Taban</div>
          <div className="text-xl font-semibold">{fmt(result.netForHeirs)} ₺</div>
        </div>
        <div className="rounded-xl p-3 border border-subtle bg-white/70">
          <div className="text-primary/80">Toplam Dağıtılan</div>
          <div className="text-xl font-semibold">{fmt(result.sumAllocated)} ₺</div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-subtle">
        <table className="w-full text-sm">
          <thead className="bg-accent/30">
            <tr>
              <th className="text-left p-2">Mirasçı</th>
              <th className="text-left p-2">Oran</th>
              <th className="text-left p-2">Dayanak</th>
              <th className="text-right p-2">Tutar (₺)</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-primary/70">Henüz pay yok. Girdileri doldurun.</td>
              </tr>
            )}
            {result.rows.map((r, idx) => (
              <tr key={idx} className="odd:bg-light/60">
                <td className="p-2">{r.heir}</td>
                <td className="p-2">{r.fraction}</td>
                <td className="p-2 text-primary/70">{r.basis}</td>
                <td className="p-2 text-right">{fmt(r.amount)} ₺</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Not & Uyarı */}
      <div className="mt-5 grid gap-3">
        <div className="flex items-start gap-3 rounded-xl border border-accent/50 bg-accent/15 p-3">
          <i className="fa-solid fa-hand-holding-heart mt-0.5"></i>
          <p className="text-sm text-ink/90">
            <strong>Not:</strong> Unutmayın: Mirasçı olmayan ihtiyaç sahiplerine de bir pay verin. (Nisâ 4/8)
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-3">
          <i className="fa-solid fa-triangle-exclamation text-red-600 mt-0.5"></i>
          <div className="text-sm text-red-800">
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
