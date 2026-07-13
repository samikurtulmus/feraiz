import React from "react";

export default function AboutModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="about-title">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-paper text-ink dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 w-[min(640px,92vw)] rounded-2xl p-6 shadow-soft border border-subtle">
        <h3 id="about-title" className="text-xl font-bold text-primary dark:text-slate-100 mb-3">Hakkında</h3>

        <div className="space-y-3 text-sm text-ink/90 dark:text-slate-200 leading-relaxed">
          <p>
            Feraiz.com, Kur'an-ı Kerim'in Nisâ Suresi'nde ve diğer ayetlerde yer alan miras hükümlerini esas alarak
            eğitim ve araştırma amacıyla hazırlanmış bir hesaplama aracıdır. Hesaplama mantığı, uygulama içinde
            tanımlı “anayasa” kurallarına (eş payı önce, ebeveyn payları, alt soy ve temsil 2:1, kardeş temsili vb.)
            göre adım adım uygulanır ve sonuçlar şeffaf bir tabloda gösterilir.
          </p>

          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Temel dayanak:</strong> Nisâ 4/11, 4/12, 4/176 ve ilgili ayetler; Süleymaniye Vakfı meali.</li>
            <li><strong>Hesap sırası:</strong> Defin/borç sonrası net → eş payı → ebeveyn payları → alt soy/temsil → (gerekirse) kardeş/temsil.</li>
            <li><strong>Yuvarlama:</strong> Tutarlar kuruşa yuvarlanır; toplam her zaman net terekeye kuruşu kuruşuna eşittir.</li>
            <li><strong>Gizlilik:</strong> Girdiğiniz veriler tarayıcınızda işlenir; sunucuya kaydedilmez.</li>
          </ul>

          <p>
            <strong>Kapsam:</strong> Bu çalışma eş, çocuklar (ve temsil yoluyla torunlar), anne-baba ile
            öz / baba-bir / anne-bir kardeşleri (ve temsil yoluyla yeğenleri) kapsar. Dede/nine, amca, hala,
            dayı, teyze gibi diğer akrabaların payları bu çalışmanın kapsamı dışındadır ve hesaplayıcıda yer almaz.
          </p>

          <p className="text-ink/80 dark:text-slate-300">
            Yasal Uyarı: Bu araç bilgilendirme amaçlıdır; resmî veya dinî danışmanlık yerine geçmez. Nihai kararlarınız
            için yetkili mercilere ve uzmanlara danışınız.
          </p>

          <p className="text-ink/80 dark:text-slate-300">
            İletişim: <a className="underline" href="mailto:smkrtlms@gmail.com">smkrtlms@gmail.com</a>
          </p>
        </div>

        <div className="mt-5 flex justify-end">
          <button onClick={onClose} className="px-3 py-2 rounded-xl bg-secondary text-white hover:opacity-90">
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

