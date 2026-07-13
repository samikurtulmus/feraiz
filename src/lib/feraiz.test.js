import { describe, it, expect } from "vitest";
import { computeDistribution, roundRowsToKurus } from "./feraiz.js";

const NET = 1_008_000; // 48, 36, 18, 12, 9, 5 ... bölenleriyle tam bölünür

// Varsayılan boş girdi; testler yalnız ilgili alanları geçersiz kılar
function calc(overrides = {}) {
  return computeDistribution({
    gross: NET,
    funeral: 0,
    debts: 0,
    decedentSex: "male",
    husbandExists: false,
    wivesCount: 0,
    sons: 0,
    daughters: 0,
    motherExists: false,
    fatherExists: false,
    maternalSiblings: 0,
    fullBrothers: 0,
    fullSisters: 0,
    halfPatBrothers: 0,
    halfPatSisters: 0,
    deceasedChildren: [],
    deceasedFullSiblings: [],
    deceasedHalfPatSiblings: [],
    deceasedMaternalSiblings: [],
    ...overrides,
  });
}

// Bir mirasçı adını içeren satırların toplam tutarı
function amountOf(result, name) {
  return result.rows
    .filter((r) => !r.warning && r.heir.includes(name))
    .reduce((a, r) => a + r.amount, 0);
}

// MADDE 9 invariantı: para asla ortada kalmaz —
// dağıtılan + raporlanan kalan = mirasçılara taban
function checkInvariant(result) {
  expect(result.sumAllocated + result.remainder).toBeCloseTo(result.netForHeirs, 4);
}

describe("MADDE 2 — Terekenin tespiti", () => {
  it("sıfır tereke: tüm değerler 0", () => {
    const r = calc({ gross: 0, sons: 1 });
    expect(r.netForHeirs).toBe(0);
    expect(r.sumAllocated).toBe(0);
    checkInvariant(r);
  });

  it("borç > tereke: net 0, pay yok, uyarı var", () => {
    const r = calc({ gross: 100_000, debts: 150_000, sons: 1 });
    expect(r.netForHeirs).toBe(0);
    expect(r.rows.filter((x) => !x.warning)).toHaveLength(0);
    expect(r.warnings.length).toBeGreaterThan(0);
    checkInvariant(r);
  });

  it("defin + borç düşülür: net = brüt - (defin + borç)", () => {
    const r = calc({ gross: 100_000, funeral: 5_000, debts: 10_000, sons: 1 });
    expect(r.netForHeirs).toBe(85_000);
    expect(amountOf(r, "Oğul")).toBeCloseTo(85_000, 4);
    checkInvariant(r);
  });
});

describe("MADDE 4 — Eşin önceliği", () => {
  it("koca + 2 oğul: koca 1/4, oğullar 3/8'er", () => {
    const r = calc({ decedentSex: "female", husbandExists: true, sons: 2 });
    expect(amountOf(r, "Eş (erkek)")).toBeCloseTo(NET / 4, 4);
    expect(amountOf(r, "Oğul #1")).toBeCloseTo((NET * 3) / 8, 4);
    expect(amountOf(r, "Oğul #2")).toBeCloseTo((NET * 3) / 8, 4);
    checkInvariant(r);
  });

  it("avliyye çözümü: eş(kadın)+anne+baba+1 kız → 1/8, 7/48, 7/48, 7/12; toplam = net", () => {
    const r = calc({ wivesCount: 1, motherExists: true, fatherExists: true, daughters: 1 });
    expect(amountOf(r, "Eş #1")).toBeCloseTo(NET / 8, 4);
    expect(amountOf(r, "Anne")).toBeCloseTo((NET * 7) / 48, 4);
    expect(amountOf(r, "Baba")).toBeCloseTo((NET * 7) / 48, 4);
    expect(amountOf(r, "Kız #1")).toBeCloseTo((NET * 7) / 12, 4);
    expect(r.sumAllocated).toBeCloseTo(NET, 4);
    checkInvariant(r);
  });

  it("2 hanım, alt soy yok: toplam 1/4 → 1/8'er; kalan amme malı (Devlet) olarak gösterilir", () => {
    const r = calc({ wivesCount: 2 });
    expect(amountOf(r, "Eş #1")).toBeCloseTo(NET / 8, 4);
    expect(amountOf(r, "Eş #2")).toBeCloseTo(NET / 8, 4);
    expect(r.remainder).toBeCloseTo((NET * 3) / 4, 4);
    expect(amountOf(r, "Devlet / ilgili otorite")).toBeCloseTo((NET * 3) / 4, 4);
    expect(r.notes.length).toBeGreaterThan(0);
    checkInvariant(r);
  });
});

describe("MADDE 6 — Alt soy mevcutken (Senaryo A)", () => {
  it("2 oğul + 1 kız: 2/5, 2/5, 1/5", () => {
    const r = calc({ sons: 2, daughters: 1 });
    expect(amountOf(r, "Oğul #1")).toBeCloseTo((NET * 2) / 5, 4);
    expect(amountOf(r, "Oğul #2")).toBeCloseTo((NET * 2) / 5, 4);
    expect(amountOf(r, "Kız #1")).toBeCloseTo(NET / 5, 4);
    checkInvariant(r);
  });

  it("v2.1: yalnız 2 kız, ebeveyn yok → tamamı kızlara eşit", () => {
    const r = calc({ daughters: 2 });
    expect(amountOf(r, "Kız #1")).toBeCloseTo(NET / 2, 4);
    expect(amountOf(r, "Kız #2")).toBeCloseTo(NET / 2, 4);
    expect(r.remainder).toBeCloseTo(0, 4);
    checkInvariant(r);
  });

  it("tam senaryo: eş+anne+baba+oğul+kız → 1/8; 7/48'er; kalan 2:1", () => {
    const r = calc({ wivesCount: 1, motherExists: true, fatherExists: true, sons: 1, daughters: 1 });
    expect(amountOf(r, "Eş #1")).toBeCloseTo(NET / 8, 4);
    expect(amountOf(r, "Anne")).toBeCloseTo((NET * 7) / 48, 4);
    expect(amountOf(r, "Baba")).toBeCloseTo((NET * 7) / 48, 4);
    expect(amountOf(r, "Oğul #1")).toBeCloseTo((NET * 7) / 18, 4);
    expect(amountOf(r, "Kız #1")).toBeCloseTo((NET * 7) / 36, 4);
    checkInvariant(r);
  });
});

describe("MADDE 5.1 — Temsil yoluyla mirasçılık", () => {
  it("1 oğul + vefat oğul (1E+1K torun): oğul 1/2; torunlar 1/3 ve 1/6", () => {
    const r = calc({ sons: 1, deceasedChildren: [{ sex: "male", grandsons: 1, granddaughters: 1 }] });
    expect(amountOf(r, "Oğul #1")).toBeCloseTo(NET / 2, 4);
    expect(amountOf(r, "Torun (erkek)")).toBeCloseTo(NET / 3, 4);
    expect(amountOf(r, "Torun (kız)")).toBeCloseTo(NET / 6, 4);
    checkInvariant(r);
  });

  it("BUG düzeltmesi: vefat oğul hattında torun yoksa hat yok sayılır, oğul tamamını alır", () => {
    const r = calc({ sons: 1, deceasedChildren: [{ sex: "male", grandsons: 0, granddaughters: 0 }] });
    expect(amountOf(r, "Oğul #1")).toBeCloseTo(NET, 4);
    expect(r.warnings.length).toBeGreaterThan(0);
    checkInvariant(r);
  });

  it("BUG düzeltmesi: yalnız vefat çocuk (0 torun) varsa alt soy YOK sayılır → eş 1/4, Madde 7", () => {
    const r = calc({
      wivesCount: 1,
      motherExists: true,
      fatherExists: true,
      deceasedChildren: [{ sex: "male", grandsons: 0, granddaughters: 0 }],
    });
    // Alt soy yok senaryosu: eş 1/4, anne kalanın 1/3'ü, baba kalan
    expect(amountOf(r, "Eş #1")).toBeCloseTo(NET / 4, 4);
    expect(amountOf(r, "Anne")).toBeCloseTo(NET / 4, 4);
    expect(amountOf(r, "Baba")).toBeCloseTo(NET / 2, 4);
    expect(r.sumAllocated).toBeCloseTo(NET, 4);
    checkInvariant(r);
  });
});

describe("MADDE 7 — Çocuksuz, ebeveyn hayatta (Senaryo B)", () => {
  it("koca + anne + baba: 1/2, 1/6, 1/3", () => {
    const r = calc({ decedentSex: "female", husbandExists: true, motherExists: true, fatherExists: true });
    expect(amountOf(r, "Eş (erkek)")).toBeCloseTo(NET / 2, 4);
    expect(amountOf(r, "Anne")).toBeCloseTo(NET / 6, 4);
    expect(amountOf(r, "Baba")).toBeCloseTo(NET / 3, 4);
    checkInvariant(r);
  });

  it("yalnız anne + baba: 1/3, 2/3", () => {
    const r = calc({ motherExists: true, fatherExists: true });
    expect(amountOf(r, "Anne")).toBeCloseTo(NET / 3, 4);
    expect(amountOf(r, "Baba")).toBeCloseTo((NET * 2) / 3, 4);
    checkInvariant(r);
  });

  it("reddiye (M7c): eş(kadın) + yalnız anne → eş 1/4, anne 3/4, kalan 0", () => {
    const r = calc({ wivesCount: 1, motherExists: true });
    expect(amountOf(r, "Eş #1")).toBeCloseTo(NET / 4, 4);
    expect(amountOf(r, "Anne")).toBeCloseTo((NET * 3) / 4, 4);
    expect(r.remainder).toBeCloseTo(0, 4);
    checkInvariant(r);
  });

  it("onaylı kural (M7b.iii): eş + anne + 2 öz erkek kardeş, baba yok → öz kardeş payı anneye", () => {
    const r = calc({ wivesCount: 1, motherExists: true, fullBrothers: 2 });
    expect(amountOf(r, "Eş #1")).toBeCloseTo(NET / 4, 4);
    // Anne: 1/6 × 3/4 (kardeş var) + öz kardeş paylarının aktarımı = kalan tamamı
    expect(amountOf(r, "Anne")).toBeCloseTo((NET * 3) / 4, 4);
    expect(amountOf(r, "Öz erkek kardeş")).toBeCloseTo(0, 4);
    expect(r.remainder).toBeCloseTo(0, 4);
    checkInvariant(r);
  });
});

describe("MADDE 8A — Anne-bir kardeş kelâlesi", () => {
  it("radd: koca + 1 anne-bir kardeş → koca 1/2, anne-bir 1/6 + kalan (toplam 1/2)", () => {
    const r = calc({ decedentSex: "female", husbandExists: true, maternalSiblings: 1 });
    expect(amountOf(r, "Eş (erkek)")).toBeCloseTo(NET / 2, 4);
    expect(amountOf(r, "Anne-bir kardeş")).toBeCloseTo(NET / 2, 4);
    expect(r.remainder).toBeCloseTo(0, 4);
    checkInvariant(r);
  });

  it("yalnız 3 anne-bir kardeş: 1/3 eşit + radd → 1/3'er", () => {
    const r = calc({ maternalSiblings: 3 });
    expect(amountOf(r, "Anne-bir kardeş #1")).toBeCloseTo(NET / 3, 4);
    expect(amountOf(r, "Anne-bir kardeş #2")).toBeCloseTo(NET / 3, 4);
    expect(amountOf(r, "Anne-bir kardeş #3")).toBeCloseTo(NET / 3, 4);
    expect(r.remainder).toBeCloseTo(0, 4);
    checkInvariant(r);
  });
});

describe("MADDE 8B — Baba-bir kardeş kelâlesi (Nisâ 4/176)", () => {
  it("koca + 1 baba-bir kız kardeş: koca 1/2, kız kardeş kalan tamamı (reddiye)", () => {
    const r = calc({ decedentSex: "female", husbandExists: true, halfPatSisters: 1 });
    expect(amountOf(r, "Eş (erkek)")).toBeCloseTo(NET / 2, 4);
    expect(amountOf(r, "Baba-bir kız kardeş")).toBeCloseTo(NET / 2, 4);
    checkInvariant(r);
  });

  it("yalnız 2 baba-bir kız kardeş: 2/3 eşit + radd → 1/2'şer", () => {
    const r = calc({ halfPatSisters: 2 });
    expect(amountOf(r, "Baba-bir kız kardeş #1")).toBeCloseTo(NET / 2, 4);
    expect(amountOf(r, "Baba-bir kız kardeş #2")).toBeCloseTo(NET / 2, 4);
    checkInvariant(r);
  });
});

describe("MADDE 8C — Tam kelâle", () => {
  it("öz E + öz K + baba-bir E tek havuzda 2:1 → 2/5, 1/5, 2/5 (M8C netleştirmesi — hacb yok, onaylandı)", () => {
    const r = calc({ fullBrothers: 1, fullSisters: 1, halfPatBrothers: 1 });
    expect(amountOf(r, "Öz erkek kardeş")).toBeCloseTo((NET * 2) / 5, 4);
    expect(amountOf(r, "Öz kız kardeş")).toBeCloseTo(NET / 5, 4);
    expect(amountOf(r, "Baba-bir erkek kardeş")).toBeCloseTo((NET * 2) / 5, 4);
    checkInvariant(r);
  });

  it("temsil: öz E + vefat öz E (1 oğul + 1 kız): hat 1/2, içinde 2:1", () => {
    const r = calc({ fullBrothers: 1, deceasedFullSiblings: [{ sex: "male", sons: 1, daughters: 1 }] });
    expect(amountOf(r, "Öz erkek kardeş")).toBeCloseTo(NET / 2, 4);
    expect(amountOf(r, "Yeğen (erkek)")).toBeCloseTo(NET / 3, 4);
    expect(amountOf(r, "Yeğen (kız)")).toBeCloseTo(NET / 6, 4);
    checkInvariant(r);
  });

  it("BUG düzeltmesi: vefat öz kardeş (0 çocuk) yok sayılır, yaşayan tamamını alır", () => {
    const r = calc({ fullBrothers: 1, deceasedFullSiblings: [{ sex: "male", sons: 0, daughters: 0 }] });
    expect(amountOf(r, "Öz erkek kardeş")).toBeCloseTo(NET, 4);
    expect(r.warnings.length).toBeGreaterThan(0);
    checkInvariant(r);
  });
});

describe("MADDE 9 — Nihai kontrol ve amme malı (9.1)", () => {
  it("yalnız koca hayatta: koca 1/2, kalan 1/2 amme malı (Devlet / ilgili otorite)", () => {
    const r = calc({ decedentSex: "female", husbandExists: true });
    expect(amountOf(r, "Eş (erkek)")).toBeCloseTo(NET / 2, 4);
    expect(amountOf(r, "Devlet / ilgili otorite")).toBeCloseTo(NET / 2, 4);
    const ammeRow = r.rows.find((x) => x.info);
    expect(ammeRow.basis).toContain("Amme malı");
    expect(r.notes.some((n) => n.includes("amme malı"))).toBe(true);
    checkInvariant(r);
  });

  it("hiç mirasçı yok, net > 0: tamamı amme malı olarak görünür", () => {
    const r = calc({});
    expect(r.remainder).toBeCloseTo(NET, 4);
    const ammeRow = r.rows.find((x) => x.info);
    expect(ammeRow).toBeTruthy();
    expect(ammeRow.amount).toBeCloseTo(NET, 4);
    checkInvariant(r);
  });
});

describe("Yuvarlama — kuruş hassasiyeti (largest-remainder)", () => {
  it("100 TL, 3 eşit pay: kuruş toplamı tam 100.00", () => {
    const rows = [
      { heir: "A", amount: 100 / 3 },
      { heir: "B", amount: 100 / 3 },
      { heir: "C", amount: 100 / 3 },
    ];
    const rounded = roundRowsToKurus(rows, 100);
    const total = rounded.reduce((a, r) => a + r.amount, 0);
    expect(Math.round(total * 100)).toBe(10000);
    for (const r of rounded) expect(Math.round(r.amount * 100) / 100).toBe(r.amount);
  });

  it("gerçek senaryo: avliyye dağılımı kuruşu kuruşuna toplanır", () => {
    const r = calc({ gross: 1000, wivesCount: 1, motherExists: true, fatherExists: true, daughters: 1 });
    const rounded = roundRowsToKurus(r.rows.filter((x) => !x.warning), r.netForHeirs);
    const total = rounded.reduce((a, x) => a + x.amount, 0);
    expect(Math.round(total * 100)).toBe(Math.round(r.netForHeirs * 100));
  });
});
