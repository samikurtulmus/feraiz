import React, { useEffect, useState } from "react";
import NumberInput from "./components/NumberInput.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import AboutModal from "./components/AboutModal.jsx";
import ResultTable from "./components/ResultTable.jsx";
import StepsPanel from "./components/StepsPanel.jsx";
import VersesModal from "./components/VersesModal.jsx";
import GoogleAd from "./components/GoogleAd.jsx";
import { computeDistribution } from "./lib/feraiz.js";
import { encodeState, decodeState, defaultState } from "./lib/urlState.js";
import { listScenarios, saveScenario, loadScenario, deleteScenario } from "./lib/scenarios.js";
import { locales, detectLang, persistLang, applySeo, LocaleProvider } from "./i18n/index.js";

const toN = (digits) => Number(digits || "0");

// Paylaşım linkiyle gelindiyse form URL'deki durumla açılır
const initialForm = typeof window !== "undefined" ? decodeState(window.location.search) : defaultState();
const initialLang = detectLang();

const THEME_KEY = "feraiz.theme";
const initialTheme =
  typeof window !== "undefined"
    ? localStorage.getItem(THEME_KEY) ||
      (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : "light";

export default function App() {
  const [form, setForm] = useState(initialForm);
  const upd = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));
  const updChecked = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.checked }));

  // Temsili hat satırları için ortak yardımcılar
  const addRow = (field, empty) => () => setForm((f) => ({ ...f, [field]: [...f[field], empty] }));
  const setRow = (field, idx, patch) =>
    setForm((f) => {
      const arr = [...f[field]];
      arr[idx] = { ...arr[idx], ...patch };
      return { ...f, [field]: arr };
    });
  const delRow = (field, idx) =>
    setForm((f) => {
      const arr = [...f[field]];
      arr.splice(idx, 1);
      return { ...f, [field]: arr };
    });

  // --- Dil ---
  const [lang, setLangState] = useState(initialLang);
  const L = locales[lang];
  const t = L.ui;
  const setLang = (code) => {
    setLangState(code);
    persistLang(code);
  };
  useEffect(() => {
    applySeo(L);
  }, [L]);

  // --- Tema ---
  const [theme, setTheme] = useState(initialTheme);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Yazdırma/PDF her zaman açık temada yapılır: koyu temanın açık renkli
  // metinleri beyaz kağıtta okunmaz hâle geliyor.
  useEffect(() => {
    const beforePrint = () => document.documentElement.classList.remove("dark");
    const afterPrint = () => document.documentElement.classList.toggle("dark", theme === "dark");
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
    return () => {
      window.removeEventListener("beforeprint", beforePrint);
      window.removeEventListener("afterprint", afterPrint);
    };
  }, [theme]);

  // --- Modallar & bildirimler ---
  const [aboutOpen, setAboutOpen] = useState(false);
  const [versesOpen, setVersesOpen] = useState(false);
  const [shareMsg, setShareMsg] = useState("");

  // --- Senaryolar ---
  const [scenarios, setScenarios] = useState(() => listScenarios());
  const [scenarioName, setScenarioName] = useState("");
  const [selectedScenario, setSelectedScenario] = useState("");

  // --- Hesap (ucuz olduğu için her render'da; memo gerekmiyor) ---
  const result = computeDistribution(
    {
      gross: toN(form.gross),
      funeral: toN(form.funeral),
      debts: toN(form.debts),
      decedentSex: form.decedentSex,
      husbandExists: form.husbandExists,
      wivesCount: toN(form.wivesCount),
      sons: toN(form.sons),
      daughters: toN(form.daughters),
      motherExists: form.motherExists,
      fatherExists: form.fatherExists,
      maternalSiblings: toN(form.maternalSiblings),
      fullBrothers: toN(form.fullBrothers),
      fullSisters: toN(form.fullSisters),
      halfPatBrothers: toN(form.halfPatBrothers),
      halfPatSisters: toN(form.halfPatSisters),
      deceasedChildren: form.deceasedChildren.map((it) => ({
        sex: it.sex, grandsons: toN(it.grandsons), granddaughters: toN(it.granddaughters),
      })),
      deceasedFullSiblings: form.deceasedFullSiblings.map((it) => ({
        sex: it.sex, sons: toN(it.sons), daughters: toN(it.daughters),
      })),
      deceasedHalfPatSiblings: form.deceasedHalfPatSiblings.map((it) => ({
        sex: it.sex, sons: toN(it.sons), daughters: toN(it.daughters),
      })),
      deceasedMaternalSiblings: form.deceasedMaternalSiblings.map((it) => ({
        sons: toN(it.sons), daughters: toN(it.daughters),
      })),
    },
    L.engine
  );

  // --- Girdi doğrulama uyarıları (motoru etkilemez, bilgilendirir) ---
  const inputWarnings = [];
  if (toN(form.debts) + toN(form.funeral) > toN(form.gross) && toN(form.gross) > 0)
    inputWarnings.push(t.warnDebtsExceed);
  if (form.decedentSex === "male" && toN(form.wivesCount) > 4)
    inputWarnings.push(t.warnWives4);

  const clearForm = () => {
    setForm(defaultState());
    setSelectedScenario("");
    if (window.location.search) window.history.replaceState(null, "", window.location.pathname);
  };

  const shareLink = async () => {
    const qs = encodeState(form) + (lang !== "tr" ? `&lang=${lang}` : "");
    const url = `${window.location.origin}${window.location.pathname}?${qs}`;
    window.history.replaceState(null, "", `?${qs}`);
    try {
      if (navigator.share) {
        await navigator.share({ title: L.seo.title, url });
        setShareMsg(t.shared);
      } else {
        await navigator.clipboard.writeText(url);
        setShareMsg(t.copied);
      }
    } catch {
      setShareMsg(t.inAddressBar);
    }
    setTimeout(() => setShareMsg(""), 3000);
  };

  const onSaveScenario = () => {
    saveScenario(scenarioName, form);
    setScenarios(listScenarios());
    setScenarioName("");
  };

  const onLoadScenario = (id) => {
    setSelectedScenario(id);
    if (!id) return;
    const loaded = loadScenario(id);
    if (loaded) setForm(loaded);
  };

  const onDeleteScenario = () => {
    if (!selectedScenario) return;
    deleteScenario(selectedScenario);
    setScenarios(listScenarios());
    setSelectedScenario("");
  };

  const fmtMoney = (n) =>
    Number(n).toLocaleString(L.numberLocale, { maximumFractionDigits: 2 }) + L.moneySuffix;

  const inputCls = "dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100";
  const sectionCls =
    "bg-paper rounded-2xl p-5 shadow-soft border border-subtle dark:bg-slate-800/60 dark:border-slate-700";
  const groupCls = "rounded-xl border border-subtle dark:border-slate-700 mt-4";
  const summaryCls =
    "cursor-pointer select-none list-none flex items-center justify-between p-3 font-semibold text-primary dark:text-slate-100";
  const labelCls = "text-sm text-primary/80 dark:text-slate-300";

  // Temsili hat satırı (vefat etmiş çocuk/kardeş) düzenleyici.
  // Bilerek bileşen değil düz fonksiyon: render içinde tanımlı bir bileşen her
  // tuş vuruşunda remount olur ve input odağı kaybolur.
  const renderHatRows = ({ field, title, emptyRow, sexOptions, aField, bField, aLabel, bLabel, emptyHint }) => (
    <div className="mt-4 border-t border-subtle dark:border-slate-700 pt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-primary dark:text-slate-200">{title}</h4>
        <button type="button" className="px-2 py-1 rounded-lg bg-secondary text-white text-sm" onClick={addRow(field, emptyRow)}>
          {t.addRow}
        </button>
      </div>
      {form[field].length === 0 && <p className="text-sm text-primary/70 dark:text-slate-400">{emptyHint}</p>}
      <div className="grid gap-3">
        {form[field].map((row, idx) => (
          <div key={idx} className={`grid ${sexOptions ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"} gap-2 items-end`}>
            {sexOptions && (
              <div>
                <label className={labelCls}>{t.sex}</label>
                <select
                  value={row.sex}
                  onChange={(e) => setRow(field, idx, { sex: e.target.value })}
                  className={`mt-1 w-full rounded-xl p-2 border border-subtle ${inputCls}`}
                >
                  <option value="male">{sexOptions[0]}</option>
                  <option value="female">{sexOptions[1]}</option>
                </select>
              </div>
            )}
            <div>
              <label className={labelCls}>{aLabel}</label>
              <NumberInput className={inputCls} valueDigits={row[aField]} onChangeDigits={(v) => setRow(field, idx, { [aField]: v })} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>{bLabel}</label>
              <NumberInput className={inputCls} valueDigits={row[bField]} onChangeDigits={(v) => setRow(field, idx, { [bField]: v })} placeholder="0" />
            </div>
            <div className="flex justify-end">
              <button type="button" className="px-2 py-2 rounded-lg bg-red-500 text-white text-sm" onClick={() => delRow(field, idx)}>
                {t.delete}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <LocaleProvider value={{ L, t, lang, setLang }}>
    <div className="min-h-[100vh] min-h-[100dvh] bg-light text-ink dark:bg-slate-900 dark:text-slate-100">
      <Header
        onOpenAbout={() => setAboutOpen(true)}
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
      />

      {/* Side rail ads (desktop) — içerik oluşmadan gösterme (policy) */}
      {result.rows.length > 0 && (
        <>
          <div className="no-print hidden xl:block fixed left-4 top-28 space-y-4 z-0">
            <GoogleAd slot={import.meta.env.VITE_GADS_SLOT_LEFT || "1234567890"} style={{ width: 160, height: 600 }} />
          </div>
          <div className="no-print hidden xl:block fixed right-4 top-28 space-y-4 z-0">
            <GoogleAd slot={import.meta.env.VITE_GADS_SLOT_RIGHT || "1234567891"} style={{ width: 160, height: 600 }} />
          </div>
        </>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6 pb-28 md:pb-12 grid md:grid-cols-2 gap-6">
        {/* Girdiler */}
        <section className={sectionCls}>
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <h2 className="text-lg font-semibold text-primary dark:text-slate-100">{t.inputs}</h2>
            {/* Senaryo kaydet/yükle */}
            <div className="no-print flex items-center gap-1.5 text-sm flex-wrap">
              <input
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder={t.scenarioName}
                className={`w-28 rounded-lg px-2 py-1.5 border border-subtle ${inputCls}`}
              />
              <button type="button" onClick={onSaveScenario} className="px-2 py-1.5 rounded-lg bg-secondary text-white" title={t.saveTitle}>
                {t.save}
              </button>
              {scenarios.length > 0 && (
                <>
                  <select
                    value={selectedScenario}
                    onChange={(e) => onLoadScenario(e.target.value)}
                    className={`max-w-36 rounded-lg px-2 py-1.5 border border-subtle ${inputCls}`}
                    title={t.loadTitle}
                  >
                    <option value="">{t.savedPlaceholder}</option>
                    {scenarios.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {selectedScenario && (
                    <button type="button" onClick={onDeleteScenario} className="px-2 py-1.5 rounded-lg bg-red-500 text-white" title={t.deleteTitle}>
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Girdi doğrulama uyarıları */}
          {inputWarnings.length > 0 && (
            <div className="mb-3 grid gap-2">
              {inputWarnings.map((w, i) => (
                <div key={i} className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-700 p-2.5 text-sm text-amber-900 dark:text-amber-200">
                  <i className="fa-solid fa-circle-info me-1.5 text-amber-600 dark:text-amber-400"></i>
                  {w}
                </div>
              ))}
            </div>
          )}

          {/* 1) Tereke */}
          <details open className={groupCls}>
            <summary className={summaryCls}>
              <span><i className="fa-solid fa-coins me-2 text-accent"></i>{t.estate}</span>
              <i className="fa-solid fa-chevron-down text-primary/50 dark:text-slate-400"></i>
            </summary>
            <div className="p-3 pt-0 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>{t.gross}</label>
                <NumberInput className={inputCls} valueDigits={form.gross} onChangeDigits={upd("gross")} />
              </div>
              <div>
                <label className={labelCls}>{t.funeral}</label>
                <NumberInput className={inputCls} valueDigits={form.funeral} onChangeDigits={upd("funeral")} />
              </div>
              <div>
                <label className={labelCls}>{t.debts}</label>
                <NumberInput className={inputCls} valueDigits={form.debts} onChangeDigits={upd("debts")} />
              </div>
            </div>
          </details>

          {/* 2) Aile: eş, çocuklar, ebeveyn */}
          <details open className={groupCls}>
            <summary className={summaryCls}>
              <span><i className="fa-solid fa-people-roof me-2 text-accent"></i>{t.family}</span>
              <i className="fa-solid fa-chevron-down text-primary/50 dark:text-slate-400"></i>
            </summary>
            <div className="p-3 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                <div className="flex items-center gap-3">
                  <span className={labelCls}>{t.decedentSex}</span>
                  <label className="text-sm inline-flex items-center gap-1">
                    <input type="radio" name="sex" checked={form.decedentSex === "male"} onChange={() => upd("decedentSex")("male")} /> {t.male}
                  </label>
                  <label className="text-sm inline-flex items-center gap-1">
                    <input type="radio" name="sex" checked={form.decedentSex === "female"} onChange={() => upd("decedentSex")("female")} /> {t.female}
                  </label>
                </div>

                {form.decedentSex === "male" ? (
                  <div>
                    <label className={labelCls}>{t.wivesCount}</label>
                    <NumberInput className={inputCls} valueDigits={form.wivesCount} onChangeDigits={upd("wivesCount")} placeholder="0" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input id="husbandExists" type="checkbox" className="accent-secondary" checked={form.husbandExists} onChange={updChecked("husbandExists")} />
                    <label htmlFor="husbandExists" className={labelCls}>{t.husbandExists}</label>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t.sons}</label>
                  <NumberInput className={inputCls} valueDigits={form.sons} onChangeDigits={upd("sons")} placeholder="0" />
                </div>
                <div>
                  <label className={labelCls}>{t.daughters}</label>
                  <NumberInput className={inputCls} valueDigits={form.daughters} onChangeDigits={upd("daughters")} placeholder="0" />
                </div>
              </div>

              {renderHatRows({
                field: "deceasedChildren",
                title: t.deceasedChildren,
                emptyRow: { sex: "male", grandsons: "", granddaughters: "" },
                sexOptions: [t.sonOpt, t.daughterOpt],
                aField: "grandsons", bField: "granddaughters",
                aLabel: t.grandsonM, bLabel: t.grandsonF,
                emptyHint: t.deceasedChildrenHint,
              })}

              <div className="mt-4 border-t border-subtle dark:border-slate-700 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <input id="motherExists" type="checkbox" className="accent-secondary" checked={form.motherExists} onChange={updChecked("motherExists")} />
                  <label htmlFor="motherExists" className={labelCls}>{t.motherAlive}</label>
                </div>
                <div className="flex items-center gap-2">
                  <input id="fatherExists" type="checkbox" className="accent-secondary" checked={form.fatherExists} onChange={updChecked("fatherExists")} />
                  <label htmlFor="fatherExists" className={labelCls}>{t.fatherAlive}</label>
                </div>
              </div>
            </div>
          </details>

          {/* 3) Kardeşler */}
          <details open className={groupCls}>
            <summary className={summaryCls}>
              <span><i className="fa-solid fa-people-group me-2 text-accent"></i>{t.siblings}</span>
              <i className="fa-solid fa-chevron-down text-primary/50 dark:text-slate-400"></i>
            </summary>
            <div className="p-3 pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>{t.maternalTotal}</label>
                  <NumberInput className={inputCls} valueDigits={form.maternalSiblings} onChangeDigits={upd("maternalSiblings")} placeholder="0" />
                </div>
                <div>
                  <label className={labelCls}>{t.fullBrothers}</label>
                  <NumberInput className={inputCls} valueDigits={form.fullBrothers} onChangeDigits={upd("fullBrothers")} placeholder="0" />
                </div>
                <div>
                  <label className={labelCls}>{t.fullSisters}</label>
                  <NumberInput className={inputCls} valueDigits={form.fullSisters} onChangeDigits={upd("fullSisters")} placeholder="0" />
                </div>
                <div>
                  <label className={labelCls}>{t.halfPatBrothers}</label>
                  <NumberInput className={inputCls} valueDigits={form.halfPatBrothers} onChangeDigits={upd("halfPatBrothers")} placeholder="0" />
                </div>
                <div>
                  <label className={labelCls}>{t.halfPatSisters}</label>
                  <NumberInput className={inputCls} valueDigits={form.halfPatSisters} onChangeDigits={upd("halfPatSisters")} placeholder="0" />
                </div>
              </div>

              {renderHatRows({
                field: "deceasedFullSiblings",
                title: t.deceasedFull,
                emptyRow: { sex: "male", sons: "", daughters: "" },
                sexOptions: [t.fullM, t.fullF],
                aField: "sons", bField: "daughters",
                aLabel: t.childM, bLabel: t.childF,
                emptyHint: t.deceasedFullHint,
              })}
              {renderHatRows({
                field: "deceasedHalfPatSiblings",
                title: t.deceasedHalfPat,
                emptyRow: { sex: "male", sons: "", daughters: "" },
                sexOptions: [t.halfM, t.halfF],
                aField: "sons", bField: "daughters",
                aLabel: t.childM, bLabel: t.childF,
                emptyHint: t.deceasedHalfPatHint,
              })}
              {renderHatRows({
                field: "deceasedMaternalSiblings",
                title: t.deceasedMaternal,
                emptyRow: { sons: "", daughters: "" },
                sexOptions: null,
                aField: "sons", bField: "daughters",
                aLabel: t.childM, bLabel: t.childF,
                emptyHint: t.deceasedMaternalHint,
              })}
            </div>
          </details>

          {/* Aksiyonlar */}
          <div className="no-print flex items-center justify-center gap-3 pt-6 flex-wrap">
            <button onClick={shareLink} className="px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 shadow-sm" title={t.shareTitle}>
              <i className="fa-solid fa-share-nodes me-1.5"></i>{t.share}
            </button>
            <button onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-accent text-ink hover:opacity-90 shadow-sm">
              {t.print}
            </button>
            <button onClick={clearForm} className="px-4 py-2 rounded-xl bg-secondary text-white hover:opacity-90 shadow-sm" title={t.clearTitle}>
              {t.clear}
            </button>
          </div>
          {shareMsg && (
            <p className="text-center text-sm mt-2 text-secondary dark:text-teal-300" role="status">
              <i className="fa-solid fa-check me-1"></i>{shareMsg}
            </p>
          )}
        </section>

        {/* Sonuç */}
        <div id="sonuc">
          <ResultTable result={result} onOpenVerses={() => setVersesOpen(true)} />
          <StepsPanel steps={result.steps} />
        </div>
      </main>

      {/* Mobil yapışkan özet çubuğu */}
      {result.rows.length > 0 && (
        <a
          href="#sonuc"
          className="no-print md:hidden fixed bottom-0 inset-x-0 z-20 bg-primary text-white px-4 py-3 flex items-center justify-between shadow-[0_-4px_12px_rgba(0,0,0,.15)] pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <span className="text-sm opacity-90">{t.distributed}</span>
          <span className="font-semibold">{fmtMoney(result.sumAllocated)}</span>
          <span className="text-sm underline">{t.goToResult}</span>
        </a>
      )}

      <Footer />
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <VersesModal open={versesOpen} onClose={() => setVersesOpen(false)} />
    </div>
    </LocaleProvider>
  );
}
