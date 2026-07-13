import React, { useMemo, useState } from "react";
import NumberInput from "./components/NumberInput.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import AboutModal from "./components/AboutModal.jsx";
import ResultTable from "./components/ResultTable.jsx";
import VersesModal from "./components/VersesModal.jsx";
import GoogleAd from "./components/GoogleAd.jsx";
import { computeDistribution } from "./lib/feraiz.js";

const toN = (digits) => Number(digits || "0");

export default function App() {
  // --- Tereke ---
  const [gross, setGross] = useState("");
  const [funeral, setFuneral] = useState("");
  const [debts, setDebts] = useState("");
  const [bequest, setBequest] = useState("");

  // --- Eş & cinsiyet ---
  const [decedentSex, setDecedentSex] = useState("male"); // male|female
  const [husbandExists, setHusbandExists] = useState(false);
  const [wivesCount, setWivesCount] = useState("");

  // --- Çocuklar (yaşayan) ---
  const [sons, setSons] = useState("");
  const [daughters, setDaughters] = useState("");

  // --- Torunlar (temsil, dinamik): ölü çocuk satırlarında giriliyor

  // --- Ebeveyn ---
  const [motherExists, setMotherExists] = useState(false);
  const [fatherExists, setFatherExists] = useState(false);

  // --- Kardeşler (yaşayan) ---
  const [maternalSiblings, setMaternalSiblings] = useState(""); // anne-bir (toplam)
  const [fullBrothers, setFullBrothers] = useState("");         // öz erkek
  const [fullSisters, setFullSisters] = useState("");           // öz kız
  const [halfPatBrothers, setHalfPatBrothers] = useState("");   // baba-bir erkek
  const [halfPatSisters, setHalfPatSisters] = useState("");     // baba-bir kız

  // --- Yeğenler (temsil, dinamik): ölü kardeş satırlarında giriliyor

  // --- Temsili hatlar ---
  const [deceasedChildren, setDeceasedChildren] = useState([]); // {sex:'male'|'female', grandsons:'', granddaughters:''}
  const [deceasedFullSiblings, setDeceasedFullSiblings] = useState([]); // {sex:'male'|'female', sons:'', daughters:''}
  const [deceasedHalfPatSiblings, setDeceasedHalfPatSiblings] = useState([]); // {sex:'male'|'female', sons:'', daughters:''}
  const [deceasedMaternalSiblings, setDeceasedMaternalSiblings] = useState([]); // {sons:'', daughters:''}

  // --- Modallar ---
  const [aboutOpen, setAboutOpen] = useState(false);
  const [versesOpen, setVersesOpen] = useState(false);

  // --- Hesap ---
  const inputs = {
    gross: toN(gross),
    funeral: toN(funeral),
    debts: toN(debts),
    bequest: toN(bequest),
    decedentSex,
    husbandExists,
    wivesCount: toN(wivesCount),
    sons: toN(sons),
    daughters: toN(daughters),
    motherExists,
    fatherExists,
    maternalSiblings: toN(maternalSiblings),
    fullBrothers: toN(fullBrothers),
    fullSisters: toN(fullSisters),
    halfPatBrothers: toN(halfPatBrothers),
    halfPatSisters: toN(halfPatSisters),
    // Toplu torun/yeğen kaldırıldı; temsil satırları kullanılıyor
    deceasedChildren: deceasedChildren.map(it => ({ sex: it.sex, grandsons: toN(it.grandsons), granddaughters: toN(it.granddaughters) })),
    deceasedFullSiblings: deceasedFullSiblings.map(it => ({ sex: it.sex, sons: toN(it.sons), daughters: toN(it.daughters) })),
    deceasedHalfPatSiblings: deceasedHalfPatSiblings.map(it => ({ sex: it.sex, sons: toN(it.sons), daughters: toN(it.daughters) })),
    deceasedMaternalSiblings: deceasedMaternalSiblings.map(it => ({ sons: toN(it.sons), daughters: toN(it.daughters) })),
  };

  const result = useMemo(() => computeDistribution(inputs), [JSON.stringify(inputs)]);

  const clearForm = () => {
    setGross(""); setFuneral(""); setDebts(""); setBequest("");
    setHusbandExists(false); setWivesCount("");
    setSons(""); setDaughters("");
    setMotherExists(false); setFatherExists(false);
    setMaternalSiblings("");
    setFullBrothers(""); setFullSisters("");
    setHalfPatBrothers(""); setHalfPatSisters("");
    // Toplu torun/yeğen alanları kaldırıldı
    setDeceasedChildren([]);
    setDeceasedFullSiblings([]);
    setDeceasedHalfPatSiblings([]);
    setDeceasedMaternalSiblings([]);
  };

  return (
    <div className="min-h-[100vh] min-h-[100dvh] bg-light text-ink">
      <Header onOpenAbout={() => setAboutOpen(true)} />

      {/* Side rail ads (desktop) — içerik oluşmadan gösterme (policy) */}
      {result.rows.length > 0 && (
        <>
          <div className="no-print hidden xl:block fixed left-4 top-28 space-y-4 z-0">
            <GoogleAd slot="1234567890" style={{ width: 160, height: 600 }} />
          </div>
          <div className="no-print hidden xl:block fixed right-4 top-28 space-y-4 z-0">
            <GoogleAd slot="1234567891" style={{ width: 160, height: 600 }} />
          </div>
        </>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-12 grid md:grid-cols-2 gap-6">
        {/* Girdiler */}
        <section className="bg-paper rounded-2xl p-5 shadow-soft border border-subtle">
          <h2 className="text-lg font-semibold mb-4 text-primary">Girdiler</h2>

          {/* Tereke */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-primary/80">Brüt miras (tereke)</label>
              <NumberInput valueDigits={gross} onChangeDigits={setGross} />
            </div>
            <div>
              <label className="text-sm text-primary/80">Defin giderleri</label>
              <NumberInput valueDigits={funeral} onChangeDigits={setFuneral} />
            </div>
            <div>
              <label className="text-sm text-primary/80">Borç / Mehir</label>
              <NumberInput valueDigits={debts} onChangeDigits={setDebts} />
            </div>
            <div>
              <label className="text-sm text-primary/80">Vasiyet (opsiyonel)</label>
              <NumberInput valueDigits={bequest} onChangeDigits={setBequest} />
            </div>
          </div>

          {/* Eş ve Cinsiyet */}
          <div className="mt-6">
            <h3 className="font-semibold text-primary mb-2">Eş ve Cinsiyet</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <div className="flex items-center gap-3">
                <span className="text-sm text-primary/80">Muris cinsiyeti</span>
                <label className="text-sm inline-flex items-center gap-1">
                  <input type="radio" name="sex" checked={decedentSex==='male'} onChange={()=>setDecedentSex('male')} /> Erkek
                </label>
                <label className="text-sm inline-flex items-center gap-1">
                  <input type="radio" name="sex" checked={decedentSex==='female'} onChange={()=>setDecedentSex('female')} /> Kadın
                </label>
              </div>

              {decedentSex==='male' ? (
                <div>
                  <label className="text-sm text-primary/80">Eş sayısı</label>
                  <NumberInput valueDigits={wivesCount} onChangeDigits={setWivesCount} placeholder="0" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input id="husbandExists" type="checkbox" className="accent-secondary" checked={husbandExists} onChange={(e)=>setHusbandExists(e.target.checked)} />
                  <label htmlFor="husbandExists" className="text-sm text-primary/80">Eşi (koca) var</label>
                </div>
              )}
            </div>
          </div>

          {/* Çocuklar */}
          <div className="mt-6">
            <h3 className="font-semibold text-primary mb-2">Çocuklar (yaşayan)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-primary/80">Oğul sayısı</label>
                <NumberInput valueDigits={sons} onChangeDigits={setSons} placeholder="0" />
              </div>
              <div>
                <label className="text-sm text-primary/80">Kız sayısı</label>
                <NumberInput valueDigits={daughters} onChangeDigits={setDaughters} placeholder="0" />
              </div>
            </div>
            {/* Vefat eden çocuklar ve torun girişi */}
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-primary">Vefat eden çocuklar (temsil için torun bilgisi)</h4>
                <button
                  type="button"
                  className="px-2 py-1 rounded-lg bg-secondary text-white text-sm"
                  onClick={() => setDeceasedChildren([...deceasedChildren, { sex: 'male', grandsons: '', granddaughters: '' }])}
                >Satır ekle</button>
              </div>
              {deceasedChildren.length === 0 && (
                <p className="text-sm text-primary/70">Vefat eden çocuk yoksa boş bırakın.</p>
              )}
              <div className="grid gap-3">
                {deceasedChildren.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
                    <div>
                      <label className="text-sm text-primary/80">Cinsiyet</label>
                      <select
                        value={row.sex}
                        onChange={(e)=>{
                          const v = e.target.value; const arr=[...deceasedChildren]; arr[idx]={...arr[idx], sex:v}; setDeceasedChildren(arr);
                        }}
                        className="mt-1 w-full rounded-xl p-2 border border-subtle"
                      >
                        <option value="male">Oğul</option>
                        <option value="female">Kız</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-primary/80">Torun (erkek)</label>
                      <NumberInput
                        valueDigits={row.grandsons}
                        onChangeDigits={(v)=>{ const arr=[...deceasedChildren]; arr[idx]={...arr[idx], grandsons:v}; setDeceasedChildren(arr); }}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-primary/80">Torun (kız)</label>
                      <NumberInput
                        valueDigits={row.granddaughters}
                        onChangeDigits={(v)=>{ const arr=[...deceasedChildren]; arr[idx]={...arr[idx], granddaughters:v}; setDeceasedChildren(arr); }}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button type="button" className="px-2 py-2 rounded-lg bg-red-500 text-white text-sm"
                        onClick={()=>{ const arr=[...deceasedChildren]; arr.splice(idx,1); setDeceasedChildren(arr); }}
                      >Sil</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Torunlar (toplu) kaldırıldı — temsil satırları kullanılacak */}

          {/* Ebeveyn */}
          <div className="mt-6">
            <h3 className="font-semibold text-primary mb-2">Ebeveyn</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <input id="motherExists" type="checkbox" className="accent-secondary" checked={motherExists} onChange={(e)=>setMotherExists(e.target.checked)} />
                <label htmlFor="motherExists" className="text-sm text-primary/80">Anne hayatta</label>
              </div>
              <div className="flex items-center gap-2">
                <input id="fatherExists" type="checkbox" className="accent-secondary" checked={fatherExists} onChange={(e)=>setFatherExists(e.target.checked)} />
                <label htmlFor="fatherExists" className="text-sm text-primary/80">Baba hayatta</label>
              </div>
            </div>
          </div>

          {/* Kardeşler (yaşayan) */}
          <div className="mt-6">
            <h3 className="font-semibold text-primary mb-2">Kardeşler (yaşayan)</h3>
          {/* Mobile stacked fields */}
          <div className="sm:hidden grid gap-3 mt-2">
            <div>
              <label className="text-sm text-primary/80">Ana-bir (toplam)</label>
              <NumberInput valueDigits={maternalSiblings} onChangeDigits={setMaternalSiblings} placeholder="0" />
            </div>
            <div>
              <label className="text-sm text-primary/80">Öz erkek</label>
              <NumberInput valueDigits={fullBrothers} onChangeDigits={setFullBrothers} placeholder="0" />
            </div>
            <div>
              <label className="text-sm text-primary/80">Öz kız</label>
              <NumberInput valueDigits={fullSisters} onChangeDigits={setFullSisters} placeholder="0" />
            </div>
            <div>
              <label className="text-sm text-primary/80">Baba-bir erkek</label>
              <NumberInput valueDigits={halfPatBrothers} onChangeDigits={setHalfPatBrothers} placeholder="0" />
            </div>
            <div>
              <label className="text-sm text-primary/80">Baba-bir kız</label>
              <NumberInput valueDigits={halfPatSisters} onChangeDigits={setHalfPatSisters} placeholder="0" />
            </div>
          </div>

          {/* Desktop/tablet: scrollable table */}
          <div className="mt-2 overflow-x-auto touch-pan-x hidden sm:block">
            <table className="min-w-max text-sm">
                <thead className="text-primary/80">
                  <tr>
                    <th className="text-left p-1 whitespace-nowrap" title="Ana-bir kardeş (toplam)">Ana-bir</th>
                    <th className="text-left p-1 whitespace-nowrap" title="Öz erkek kardeş">Öz erkek</th>
                    <th className="text-left p-1 whitespace-nowrap" title="Öz kız kardeş">Öz kız</th>
                    <th className="text-left p-1 whitespace-nowrap" title="Baba-bir erkek kardeş">Baba-bir erkek</th>
                    <th className="text-left p-1 whitespace-nowrap" title="Baba-bir kız kardeş">Baba-bir kız</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="align-top">
                    <td className="p-1"><NumberInput valueDigits={maternalSiblings} onChangeDigits={setMaternalSiblings} placeholder="0" /></td>
                    <td className="p-1"><NumberInput valueDigits={fullBrothers} onChangeDigits={setFullBrothers} placeholder="0" /></td>
                    <td className="p-1"><NumberInput valueDigits={fullSisters} onChangeDigits={setFullSisters} placeholder="0" /></td>
                    <td className="p-1"><NumberInput valueDigits={halfPatBrothers} onChangeDigits={setHalfPatBrothers} placeholder="0" /></td>
                    <td className="p-1"><NumberInput valueDigits={halfPatSisters} onChangeDigits={setHalfPatSisters} placeholder="0" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Vefat eden öz kardeşler */}
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-primary">Vefat eden öz kardeşler</h4>
                <button
                  type="button"
                  className="px-2 py-1 rounded-lg bg-secondary text-white text-sm"
                  onClick={() => setDeceasedFullSiblings([...deceasedFullSiblings, { sex:'male', sons:'', daughters:'' }])}
                >Satır ekle</button>
              </div>
              {deceasedFullSiblings.length === 0 && (
                <p className="text-sm text-primary/70">Vefat eden öz kardeş yoksa boş bırakın.</p>
              )}
              <div className="grid gap-3">
                {deceasedFullSiblings.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
                    <div>
                      <label className="text-sm text-primary/80">Cinsiyet</label>
                      <select
                        value={row.sex}
                        onChange={(e)=>{ const arr=[...deceasedFullSiblings]; arr[idx]={...arr[idx], sex:e.target.value}; setDeceasedFullSiblings(arr); }}
                        className="mt-1 w-full rounded-xl p-2 border border-subtle"
                      >
                        <option value="male">Öz erkek</option>
                        <option value="female">Öz kız</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-primary/80">Çocuk (erkek)</label>
                      <NumberInput valueDigits={row.sons} onChangeDigits={(v)=>{ const arr=[...deceasedFullSiblings]; arr[idx]={...arr[idx], sons:v}; setDeceasedFullSiblings(arr); }} placeholder="0" />
                    </div>
                    <div>
                      <label className="text-sm text-primary/80">Çocuk (kız)</label>
                      <NumberInput valueDigits={row.daughters} onChangeDigits={(v)=>{ const arr=[...deceasedFullSiblings]; arr[idx]={...arr[idx], daughters:v}; setDeceasedFullSiblings(arr); }} placeholder="0" />
                    </div>
                    <div className="flex justify-end">
                      <button type="button" className="px-2 py-2 rounded-lg bg-red-500 text-white text-sm" onClick={()=>{ const arr=[...deceasedFullSiblings]; arr.splice(idx,1); setDeceasedFullSiblings(arr); }}>Sil</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vefat eden baba-bir kardeşler */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-primary">Vefat eden baba-bir kardeşler</h4>
                <button
                  type="button"
                  className="px-2 py-1 rounded-lg bg-secondary text-white text-sm"
                  onClick={() => setDeceasedHalfPatSiblings([...deceasedHalfPatSiblings, { sex:'male', sons:'', daughters:'' }])}
                >Satır ekle</button>
              </div>
              {deceasedHalfPatSiblings.length === 0 && (
                <p className="text-sm text-primary/70">Vefat eden baba-bir kardeş yoksa boş bırakın.</p>
              )}
              <div className="grid gap-3">
                {deceasedHalfPatSiblings.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
                    <div>
                      <label className="text-sm text-primary/80">Cinsiyet</label>
                      <select
                        value={row.sex}
                        onChange={(e)=>{ const arr=[...deceasedHalfPatSiblings]; arr[idx]={...arr[idx], sex:e.target.value}; setDeceasedHalfPatSiblings(arr); }}
                        className="mt-1 w-full rounded-xl p-2 border border-subtle"
                      >
                        <option value="male">Baba-bir erkek</option>
                        <option value="female">Baba-bir kız</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-primary/80">Çocuk (erkek)</label>
                      <NumberInput valueDigits={row.sons} onChangeDigits={(v)=>{ const arr=[...deceasedHalfPatSiblings]; arr[idx]={...arr[idx], sons:v}; setDeceasedHalfPatSiblings(arr); }} placeholder="0" />
                    </div>
                    <div>
                      <label className="text-sm text-primary/80">Çocuk (kız)</label>
                      <NumberInput valueDigits={row.daughters} onChangeDigits={(v)=>{ const arr=[...deceasedHalfPatSiblings]; arr[idx]={...arr[idx], daughters:v}; setDeceasedHalfPatSiblings(arr); }} placeholder="0" />
                    </div>
                    <div className="flex justify-end">
                      <button type="button" className="px-2 py-2 rounded-lg bg-red-500 text-white text-sm" onClick={()=>{ const arr=[...deceasedHalfPatSiblings]; arr.splice(idx,1); setDeceasedHalfPatSiblings(arr); }}>Sil</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vefat eden anne-bir kardeşler */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-primary">Vefat eden anne-bir kardeşler</h4>
                <button
                  type="button"
                  className="px-2 py-1 rounded-lg bg-secondary text-white text-sm"
                  onClick={() => setDeceasedMaternalSiblings([...deceasedMaternalSiblings, { sons:'', daughters:'' }])}
                >Satır ekle</button>
              </div>
              {deceasedMaternalSiblings.length === 0 && (
                <p className="text-sm text-primary/70">Vefat eden anne-bir kardeş yoksa boş bırakın.</p>
              )}
              <div className="grid gap-3">
                {deceasedMaternalSiblings.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-2 items-end">
                    <div>
                      <label className="text-sm text-primary/80">Çocuk (erkek)</label>
                      <NumberInput valueDigits={row.sons} onChangeDigits={(v)=>{ const arr=[...deceasedMaternalSiblings]; arr[idx]={...arr[idx], sons:v}; setDeceasedMaternalSiblings(arr); }} placeholder="0" />
                    </div>
                    <div>
                      <label className="text-sm text-primary/80">Çocuk (kız)</label>
                      <NumberInput valueDigits={row.daughters} onChangeDigits={(v)=>{ const arr=[...deceasedMaternalSiblings]; arr[idx]={...arr[idx], daughters:v}; setDeceasedMaternalSiblings(arr); }} placeholder="0" />
                    </div>
                    <div className="flex justify-end">
                      <button type="button" className="px-2 py-2 rounded-lg bg-red-500 text-white text-sm" onClick={()=>{ const arr=[...deceasedMaternalSiblings]; arr.splice(idx,1); setDeceasedMaternalSiblings(arr); }}>Sil</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Yeğenler (toplu) kaldırıldı — temsil satırları kullanılacak */}

          {/* Aksiyonlar */}
          <div className="flex items-center justify-center gap-3 pt-6">
            <button onClick={()=>window.print()} className="px-4 py-2 rounded-xl bg-accent text-ink hover:opacity-90 shadow-sm">
              Yazdır / PDF
            </button>
            <button onClick={clearForm} className="px-4 py-2 rounded-xl bg-secondary text-white hover:opacity-90 shadow-sm" title="Tüm alanları sıfırla">
              Temizle
            </button>
          </div>
        </section>

        <ResultTable result={result} onOpenVerses={() => setVersesOpen(true)} />
      </main>

      <Footer />
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <VersesModal open={versesOpen} onClose={() => setVersesOpen(false)} />
    </div>
  );
}
