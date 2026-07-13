import { describe, it, expect } from "vitest";
import { encodeState, decodeState, defaultState } from "./urlState.js";

describe("urlState — paylaşım linki codec'i", () => {
  it("boş durum: yalnız sürüm paramı üretir ve geri okununca varsayılan döner", () => {
    const qs = encodeState(defaultState());
    expect(qs).toBe("v=1");
    expect(decodeState(qs)).toEqual(defaultState());
  });

  it("round-trip: dolu form aynen geri okunur", () => {
    const state = {
      ...defaultState(),
      gross: "1000000",
      funeral: "5000",
      debts: "20000",
      decedentSex: "male",
      wivesCount: "2",
      sons: "1",
      daughters: "2",
      motherExists: true,
      fatherExists: false,
      maternalSiblings: "1",
      fullBrothers: "2",
      deceasedChildren: [
        { sex: "male", grandsons: "2", granddaughters: "1" },
        { sex: "female", grandsons: "0", granddaughters: "3" },
      ],
      deceasedFullSiblings: [{ sex: "female", sons: "1", daughters: "0" }],
      deceasedMaternalSiblings: [{ sons: "1", daughters: "1" }],
    };
    expect(decodeState(encodeState(state))).toEqual(state);
  });

  it("kadın muris + koca round-trip", () => {
    const state = { ...defaultState(), decedentSex: "female", husbandExists: true, gross: "500000", sons: "1" };
    expect(decodeState(encodeState(state))).toEqual(state);
  });

  it("sürüm uyuşmazlığı: bilinmeyen v yok sayılır, varsayılan döner", () => {
    expect(decodeState("v=99&g=123&s=5")).toEqual(defaultState());
  });

  it("bozuk/eksik param zarar vermez", () => {
    expect(decodeState("v=1&dc=zzz&g=abc12x3")).toEqual({ ...defaultState(), gross: "123" });
    expect(decodeState("")).toEqual(defaultState());
    expect(decodeState(null)).toEqual(defaultState());
  });
});
