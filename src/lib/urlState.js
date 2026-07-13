// Form durumunu URL query paramlarına çevirir ve geri okur.
// Aynı serileştirme localStorage senaryo kayıtlarında da kullanılır (tek codec).
// Sürümlü (v=1): ileride alan eklenirse yalnız yeni anahtar eklenir; şema
// değişirse v artırılır ve eski sürüm yok sayılır (bozuk sonuç göstermek yerine
// boş form açılır).

export const URL_STATE_VERSION = "1";

export function defaultState() {
  return {
    gross: "",
    funeral: "",
    debts: "",
    decedentSex: "male",
    husbandExists: false,
    wivesCount: "",
    sons: "",
    daughters: "",
    motherExists: false,
    fatherExists: false,
    maternalSiblings: "",
    fullBrothers: "",
    fullSisters: "",
    halfPatBrothers: "",
    halfPatSisters: "",
    deceasedChildren: [],
    deceasedFullSiblings: [],
    deceasedHalfPatSiblings: [],
    deceasedMaternalSiblings: [],
  };
}

const digits = (s) => String(s || "").replace(/[^\d]/g, "");

// Cinsiyetli hat: "m.2.1" → {sex, a, b}; anne-bir hattı cinsiyetsiz: "2.1"
const encodeSexedHats = (list, aKey, bKey) =>
  (list || [])
    .map((it) => `${it.sex === "female" ? "f" : "m"}.${digits(it[aKey]) || 0}.${digits(it[bKey]) || 0}`)
    .join(";");

const decodeSexedHats = (str, aKey, bKey) =>
  !str
    ? []
    : str
        .split(";")
        .map((t) => {
          const [sex, a, b] = t.split(".");
          if (sex !== "m" && sex !== "f") return null;
          return { sex: sex === "f" ? "female" : "male", [aKey]: digits(a), [bKey]: digits(b) };
        })
        .filter(Boolean);

export function encodeState(state) {
  const p = new URLSearchParams();
  p.set("v", URL_STATE_VERSION);

  const setIf = (key, val) => {
    const d = digits(val);
    if (d && d !== "0") p.set(key, d);
  };

  if (state.decedentSex === "female") p.set("sx", "f");
  setIf("g", state.gross);
  setIf("fu", state.funeral);
  setIf("db", state.debts);
  if (state.decedentSex === "female" && state.husbandExists) p.set("h", "1");
  if (state.decedentSex !== "female") setIf("w", state.wivesCount);
  setIf("s", state.sons);
  setIf("d", state.daughters);
  if (state.motherExists) p.set("mo", "1");
  if (state.fatherExists) p.set("fa", "1");
  setIf("ms", state.maternalSiblings);
  setIf("fb", state.fullBrothers);
  setIf("fs", state.fullSisters);
  setIf("pb", state.halfPatBrothers);
  setIf("ps", state.halfPatSisters);

  const dc = encodeSexedHats(state.deceasedChildren, "grandsons", "granddaughters");
  if (dc) p.set("dc", dc);
  const df = encodeSexedHats(state.deceasedFullSiblings, "sons", "daughters");
  if (df) p.set("df", df);
  const dp = encodeSexedHats(state.deceasedHalfPatSiblings, "sons", "daughters");
  if (dp) p.set("dp", dp);
  const dm = (state.deceasedMaternalSiblings || [])
    .map((it) => `${digits(it.sons) || 0}.${digits(it.daughters) || 0}`)
    .join(";");
  if (dm) p.set("dm", dm);

  return p.toString();
}

export function decodeState(search) {
  const state = defaultState();
  let p;
  try {
    p = new URLSearchParams(search || "");
  } catch {
    return state;
  }
  if (p.get("v") !== URL_STATE_VERSION) return state;

  if (p.get("sx") === "f") state.decedentSex = "female";
  state.gross = digits(p.get("g"));
  state.funeral = digits(p.get("fu"));
  state.debts = digits(p.get("db"));
  state.husbandExists = state.decedentSex === "female" && p.get("h") === "1";
  state.wivesCount = state.decedentSex === "male" ? digits(p.get("w")) : "";
  state.sons = digits(p.get("s"));
  state.daughters = digits(p.get("d"));
  state.motherExists = p.get("mo") === "1";
  state.fatherExists = p.get("fa") === "1";
  state.maternalSiblings = digits(p.get("ms"));
  state.fullBrothers = digits(p.get("fb"));
  state.fullSisters = digits(p.get("fs"));
  state.halfPatBrothers = digits(p.get("pb"));
  state.halfPatSisters = digits(p.get("ps"));
  state.deceasedChildren = decodeSexedHats(p.get("dc"), "grandsons", "granddaughters");
  state.deceasedFullSiblings = decodeSexedHats(p.get("df"), "sons", "daughters");
  state.deceasedHalfPatSiblings = decodeSexedHats(p.get("dp"), "sons", "daughters");
  state.deceasedMaternalSiblings = !p.get("dm")
    ? []
    : p
        .get("dm")
        .split(";")
        .map((t) => {
          const [a, b] = t.split(".");
          return { sons: digits(a), daughters: digits(b) };
        });

  return state;
}
