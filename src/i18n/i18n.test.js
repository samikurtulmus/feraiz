import { describe, it, expect } from "vitest";
import { locales } from "./index.js";
import tr from "./locales/tr.js";
import { computeDistribution } from "../lib/feraiz.js";

// Kapsamlı bir senaryo: eş + ebeveyn + çocuk + tüm temsil hatları + uyarı + not
const FULL_INPUT = {
  gross: 1_008_000,
  funeral: 1_000,
  debts: 2_000,
  decedentSex: "male",
  wivesCount: 2,
  sons: 1,
  daughters: 1,
  motherExists: true,
  fatherExists: true,
  deceasedChildren: [
    { sex: "male", grandsons: 1, granddaughters: 1 },
    { sex: "female", grandsons: 0, granddaughters: 0 }, // uyarı üretir
  ],
  deceasedFullSiblings: [],
  deceasedHalfPatSiblings: [],
  deceasedMaternalSiblings: [],
};

// Kelâle + amme senaryosu (kardeş metinleri ve not için)
const KELALE_INPUT = {
  gross: 1_008_000,
  decedentSex: "female",
  husbandExists: true,
  maternalSiblings: 1,
  fullBrothers: 1,
  fullSisters: 1,
  halfPatBrothers: 1,
  deceasedFullSiblings: [{ sex: "male", sons: 1, daughters: 1 }],
  deceasedMaternalSiblings: [{ sons: 1, daughters: 0 }],
};

const SPOUSE_ONLY = { gross: 1_008_000, decedentSex: "female", husbandExists: true };

function collectStrings(result) {
  return [
    ...result.rows.map((r) => `${r.heir} ${r.fraction} ${r.basis}`),
    ...result.warnings,
    ...result.notes,
    ...result.steps,
  ].join("\n");
}

describe("i18n — tüm dillerde motor sözlükleri eksiksiz", () => {
  for (const [code, locale] of Object.entries(locales)) {
    it(`${code}: hesap metinlerinde undefined/eksik anahtar yok, invariant korunur`, () => {
      for (const input of [FULL_INPUT, KELALE_INPUT, SPOUSE_ONLY]) {
        const r = computeDistribution(input, locale.engine);
        expect(r.sumAllocated + r.remainder).toBeCloseTo(r.netForHeirs, 4);
        const text = collectStrings(r);
        expect(text).not.toMatch(/undefined|\[object|NaN/);
        expect(text.length).toBeGreaterThan(50);
      }
    });

    it(`${code}: UI sözlüğü Türkçe ile aynı anahtarlara sahip`, () => {
      const trKeys = Object.keys(tr.ui).sort();
      const keys = Object.keys(locale.ui).sort();
      expect(keys).toEqual(trKeys);
      for (const k of trKeys) expect(locale.ui[k], `ui.${k}`).toBeTruthy();
    });
  }

  it("tutar biçimleri dile göre değişir ama sayı bozulmaz", () => {
    for (const locale of Object.values(locales)) {
      const s = locale.engine.money(1234567.5);
      expect(s.replace(/[^\d]/g, "")).toContain("1234567");
    }
  });
});
