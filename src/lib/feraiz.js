// Hesap motoru v4 — anayasa.md (v2.7) ile uyumlu
// Girdi: sayısal alanlar number; bayraklar boolean; opsiyonel temsili hat listeleri
// - deceasedChildren: Array<{sex:'male'|'female', grandsons:number, granddaughters:number}>
// - deceasedFullSiblings / deceasedHalfPatSiblings: Array<{sex:'male'|'female', sons:number, daughters:number}>
// - deceasedMaternalSiblings: Array<{sons:number, daughters:number}>
//
// Dönüş: { netForHeirs, rows, sumAllocated, remainder, warnings, steps }
// MADDE 9 invariantı: sumAllocated + remainder === netForHeirs (para asla sessizce kaybolmaz)

const fmtTL = (n) =>
  Number(n).toLocaleString("tr-TR", { maximumFractionDigits: 2 });

// Yaşayan alıcısı olmayan temsil satırları (hat) hesaba hiç girmemelidir:
// pay ağırlığına girer ama dağıtılamazsa para ortada kalır ve senaryo tespiti
// (alt soy / kardeş varlığı) yanlış döner. Bu yüzden girişte elenir.
function normalizeInputs(raw) {
  const warnings = [];

  const filterHats = (list, weightOf, label) => {
    if (!Array.isArray(list)) return [];
    const kept = [];
    for (const item of list) {
      if (weightOf(item) > 0) kept.push(item);
      else warnings.push(`${label} satırı yok sayıldı: yaşayan mirasçısı (temsilcisi) yok.`);
    }
    return kept;
  };

  return {
    warnings,
    f: {
      gross: toN(raw.gross),
      funeral: toN(raw.funeral),
      debts: toN(raw.debts),
      decedentSex: raw.decedentSex === "female" ? "female" : "male",
      husbandExists: !!raw.husbandExists,
      wivesCount: toN(raw.wivesCount),
      sons: toN(raw.sons),
      daughters: toN(raw.daughters),
      motherExists: !!raw.motherExists,
      fatherExists: !!raw.fatherExists,
      maternalSiblings: toN(raw.maternalSiblings),
      fullBrothers: toN(raw.fullBrothers),
      fullSisters: toN(raw.fullSisters),
      halfPatBrothers: toN(raw.halfPatBrothers),
      halfPatSisters: toN(raw.halfPatSisters),
      deceasedChildren: filterHats(
        raw.deceasedChildren,
        (c) => 2 * toN(c.grandsons) + toN(c.granddaughters),
        "Vefat eden çocuk"
      ),
      deceasedFullSiblings: filterHats(
        raw.deceasedFullSiblings,
        (s) => 2 * toN(s.sons) + toN(s.daughters),
        "Vefat eden öz kardeş"
      ),
      deceasedHalfPatSiblings: filterHats(
        raw.deceasedHalfPatSiblings,
        (s) => 2 * toN(s.sons) + toN(s.daughters),
        "Vefat eden baba-bir kardeş"
      ),
      deceasedMaternalSiblings: filterHats(
        raw.deceasedMaternalSiblings,
        (s) => 2 * toN(s.sons) + toN(s.daughters),
        "Vefat eden anne-bir kardeş"
      ),
    },
  };
}

// Bir hattın (vefat etmiş mirasçının) payını çocukları arasında 2:1 böler
function distributeHat(rows, share, sons, daughters, maleLabel, femaleLabel, basis) {
  const w = 2 * sons + daughters;
  if (w <= 0 || share <= 0) return;
  const u = share / w;
  for (let i = 1; i <= sons; i++)
    rows.push({ heir: `${maleLabel} #${i}`, fraction: `2/${w}`, amount: 2 * u, basis });
  for (let i = 1; i <= daughters; i++)
    rows.push({ heir: `${femaleLabel} #${i}`, fraction: `1/${w}`, amount: 1 * u, basis });
}

export function computeDistribution(raw) {
  const { f, warnings } = normalizeInputs(raw);
  const rows = [];
  const steps = [];

  // 0) Net tespit: Toplam - (defin + borç)  (MADDE 2)
  const netForHeirs = Math.max(0, f.gross - f.funeral - f.debts);
  steps.push(
    `Net tereke: ${fmtTL(f.gross)} − defin ${fmtTL(f.funeral)} − borç ${fmtTL(f.debts)} = ${fmtTL(netForHeirs)} ₺ (Madde 2)`
  );
  if (f.gross > 0 && netForHeirs === 0) {
    warnings.push("Defin giderleri ve borçlar terekeyi tüketiyor; dağıtılacak miras kalmadı (Madde 2).");
  }

  const sons = f.sons;
  const daughters = f.daughters;
  const mother = f.motherExists;
  const father = f.fatherExists;

  // Alt soy: yaşayan çocuk veya (yaşayan torunu olan) vefat etmiş çocuk hattı (MADDE 3a)
  const hasDescendants = sons + daughters > 0 || f.deceasedChildren.length > 0;

  const matAlive = f.maternalSiblings;
  const fullB = f.fullBrothers, fullS = f.fullSisters;
  const hpb = f.halfPatBrothers, hps = f.halfPatSisters;
  const siblingsExist =
    matAlive + fullB + fullS + hpb + hps > 0 ||
    f.deceasedMaternalSiblings.length > 0 ||
    f.deceasedFullSiblings.length > 0 ||
    f.deceasedHalfPatSiblings.length > 0;

  // 1) Eş payı — Net'ten önce ayrılır (MADDE 4)
  let spouseTotal = 0;
  const hasSpouse = f.decedentSex === "male" ? f.wivesCount > 0 : f.husbandExists;
  if (hasSpouse && netForHeirs > 0) {
    if (f.decedentSex === "male") {
      const fracLabel = hasDescendants ? "1/8" : "1/4";
      spouseTotal = netForHeirs * (hasDescendants ? 1 / 8 : 1 / 4);
      const each = spouseTotal / f.wivesCount;
      for (let i = 1; i <= f.wivesCount; i++) {
        rows.push({ heir: `Eş #${i} (kadın)`, fraction: fracLabel, amount: each, basis: "Eş payı (önce)" });
      }
      steps.push(
        `Eş payı önce ayrıldı: ${fracLabel} = ${fmtTL(spouseTotal)} ₺${f.wivesCount > 1 ? ` (${f.wivesCount} hanım arasında eşit)` : ""} (Madde 4)`
      );
    } else {
      const fracLabel = hasDescendants ? "1/4" : "1/2";
      spouseTotal = netForHeirs * (hasDescendants ? 1 / 4 : 1 / 2);
      rows.push({ heir: "Eş (erkek)", fraction: fracLabel, amount: spouseTotal, basis: "Eş payı (önce)" });
      steps.push(`Eş (koca) payı önce ayrıldı: ${fracLabel} = ${fmtTL(spouseTotal)} ₺ (Madde 4)`);
    }
  }

  let remainder = netForHeirs - spouseTotal;

  // 2) Anne/Baba payları
  if (remainder > 0 && hasDescendants) {
    // Alt soy varken anne ve baba 1/6'şar alır (MADDE 6b)
    let parentTotal = 0;
    if (mother) {
      const s = remainder * (1 / 6);
      rows.push({ heir: "Anne", fraction: "1/6 (alt soy var)", amount: s, basis: "Anne payı" });
      steps.push(`Anne payı: kalanın 1/6'sı = ${fmtTL(s)} ₺ (Madde 6b)`);
      parentTotal += s;
    }
    if (father) {
      const s = remainder * (1 / 6);
      rows.push({ heir: "Baba", fraction: "1/6 (alt soy var)", amount: s, basis: "Baba payı" });
      steps.push(`Baba payı: kalanın 1/6'sı = ${fmtTL(s)} ₺ (Madde 6b)`);
      parentTotal += s;
    }
    remainder -= parentTotal;
  } else if (remainder > 0 && !hasDescendants) {
    if (mother && father) {
      // Anne 1/3, kalan babaya (MADDE 7b)
      const motherShare = remainder * (1 / 3);
      rows.push({ heir: "Anne", fraction: "1/3 (alt soy yok)", amount: motherShare, basis: "Anne payı" });
      const fatherShare = remainder - motherShare;
      rows.push({ heir: "Baba", fraction: "(kalan)", amount: fatherShare, basis: "Baba payı (kalan)" });
      steps.push(
        `Alt soy yok: Anne kalanın 1/3'ü (${fmtTL(motherShare)} ₺), kalan tamamı Baba'ya (${fmtTL(fatherShare)} ₺) (Madde 7b)`
      );
      remainder = 0;
    } else if (mother && !father) {
      // Baba yok: kardeş varsa anne 1/6, yoksa kalanın tamamı (MADDE 7b.i + 7c reddiye)
      if (siblingsExist) {
        const motherShare = remainder * (1 / 6);
        rows.push({ heir: "Anne", fraction: "1/6 (kardeş var)", amount: motherShare, basis: "Anne payı" });
        steps.push(`Anne payı: kardeş var, kalanın 1/6'sı = ${fmtTL(motherShare)} ₺ (Madde 7b.i)`);
        remainder -= motherShare;
      } else {
        rows.push({ heir: "Anne", fraction: "(kalan)", amount: remainder, basis: "Anne payı (kalan)" });
        steps.push(`Kalanın tamamı Anne'ye: ${fmtTL(remainder)} ₺ (Madde 7c reddiye)`);
        remainder = 0;
      }
      // Anne var, baba yok: paternel taraf kardeşleri (baba-bir + öz) devreye girer;
      // öz kardeş payları anneye aktarılır (Madde 7b.iii — onaylı kural).
      if (remainder > 0) {
        const weightFull =
          2 * fullB + fullS + f.deceasedFullSiblings.reduce((a, s) => a + (s.sex === "male" ? 2 : 1), 0);
        const weightHalf =
          2 * hpb + hps + f.deceasedHalfPatSiblings.reduce((a, s) => a + (s.sex === "male" ? 2 : 1), 0);
        const totalW = weightFull + weightHalf;
        if (totalW > 0) {
          const unit = remainder / totalW;
          for (let i = 1; i <= hpb; i++)
            rows.push({ heir: `Baba-bir erkek kardeş #${i}`, fraction: `2/${totalW}`, amount: 2 * unit, basis: "Baba yok — 2:1" });
          for (let i = 1; i <= hps; i++)
            rows.push({ heir: `Baba-bir kız kardeş #${i}`, fraction: `1/${totalW}`, amount: 1 * unit, basis: "Baba yok — 2:1" });
          for (const ds of f.deceasedHalfPatSiblings) {
            distributeHat(rows, (ds.sex === "male" ? 2 : 1) * unit, toN(ds.sons), toN(ds.daughters),
              "Yeğen (erkek) — baba-bir (temsil)", "Yeğen (kız) — baba-bir (temsil)", "Temsil — baba-bir");
          }
          const motherFromFull = weightFull * unit;
          if (motherFromFull > 0) {
            rows.push({ heir: "Anne", fraction: "(öz kardeş payı)", amount: motherFromFull, basis: "Öz kardeş payı anneye aktarıldı" });
            steps.push(`Öz kardeş payları Anne'ye aktarıldı: ${fmtTL(motherFromFull)} ₺ (baba yok)`);
          }
          if (weightHalf > 0) steps.push(`Baba-bir kardeşler kalanı 2:1 ile paylaştı (Madde 5)`);
          remainder = 0;
        } else {
          // Yalnız anne-bir kardeş var: anne hayattayken anne-bir kardeşler mirasçı olmaz
          // (Madde 8A şartı: anne hayatta değil) → kalan anneye (reddiye, para ortada kalmaz)
          rows.push({ heir: "Anne", fraction: "(kalan)", amount: remainder, basis: "Reddiye — kalan anneye" });
          steps.push(`Kalan Anne'ye verildi (anne-bir kardeşler anne hayattayken mirasçı olmaz): ${fmtTL(remainder)} ₺`);
          remainder = 0;
        }
      }
    } else if (!mother && father) {
      // Anne yok: anne-bir kardeşler pay alır; öz kardeş payı babaya gider
      const matHats = matAlive + f.deceasedMaternalSiblings.length;
      if (matHats > 0 && remainder > 0) {
        const matShare = matHats === 1 ? remainder * (1 / 6) : remainder * (1 / 3);
        const eachHat = matShare / matHats;
        for (let i = 1; i <= matAlive; i++)
          rows.push({ heir: `Anne-bir kardeş #${i}`, fraction: matHats === 1 ? "1/6" : "(toplam 1/3, eşit)", amount: eachHat, basis: "Anne yok — anne-bir" });
        for (const dm of f.deceasedMaternalSiblings) {
          distributeHat(rows, eachHat, toN(dm.sons), toN(dm.daughters),
            "Yeğen (erkek) — anne-bir hattı (temsil)", "Yeğen (kız) — anne-bir hattı (temsil)", "Temsil — anne-bir");
        }
        steps.push(`Anne-bir kardeş payı: ${matHats === 1 ? "1/6" : "toplam 1/3, eşit"} = ${fmtTL(matShare)} ₺ (Madde 8A)`);
        remainder -= matShare;
      }
      if (remainder > 0) {
        rows.push({ heir: "Baba", fraction: "(kalan — öz kardeş payı dahil)", amount: remainder, basis: "Anne yok — öz kardeş payı babaya" });
        steps.push(`Kalanın tamamı Baba'ya (öz kardeş payı dahil): ${fmtTL(remainder)} ₺ (Madde 7b.ii)`);
        remainder = 0;
      }
    }
  }

  // 3) Alt soya dağıtım — çocuklar + temsil (MADDE 5, 5.1, 6c)
  if (remainder > 0 && hasDescendants) {
    const childWeight =
      2 * sons + daughters + f.deceasedChildren.reduce((a, c) => a + (c.sex === "male" ? 2 : 1), 0);
    const unit = remainder / childWeight;

    for (let i = 1; i <= sons; i++)
      rows.push({ heir: `Oğul #${i}`, fraction: `2/${childWeight}`, amount: 2 * unit, basis: "Alt soy 2:1" });
    for (let i = 1; i <= daughters; i++)
      rows.push({ heir: `Kız #${i}`, fraction: `1/${childWeight}`, amount: 1 * unit, basis: "Alt soy 2:1" });

    for (const dc of f.deceasedChildren) {
      const parentLabel = dc.sex === "male" ? "oğul" : "kız";
      distributeHat(rows, (dc.sex === "male" ? 2 : 1) * unit, toN(dc.grandsons), toN(dc.granddaughters),
        `Torun (erkek) — temsil (ebeveyn ${parentLabel})`, `Torun (kız) — temsil (ebeveyn ${parentLabel})`, "Temsil 2:1 (torunlar)");
    }
    steps.push(
      `Kalan alt soya 2:1 dağıtıldı (toplam ${childWeight} hisse, hisse değeri ${fmtTL(unit)} ₺) (Madde 5/6c${f.deceasedChildren.length ? ", temsil: Madde 5.1" : ""})`
    );
    remainder = 0;
  }

  // 4) Kelâle: alt soy yok ve ebeveyn yok (MADDE 8, 8A, 8B, 8C)
  if (remainder > 0 && !hasDescendants && !mother && !father) {
    const patFullW =
      2 * fullB + fullS + f.deceasedFullSiblings.reduce((a, s) => a + (s.sex === "male" ? 2 : 1), 0);
    const patHalfW =
      2 * hpb + hps + f.deceasedHalfPatSiblings.reduce((a, s) => a + (s.sex === "male" ? 2 : 1), 0);
    const patAllW = patFullW + patHalfW;

    // Anne-bir kardeşler: tek ise 1/6, çoksa 1/3 eşit; öz/baba-bir kardeş yoksa
    // kalan da akrabalık sebebiyle kendilerine verilir (Madde 8 notu — radd)
    const matHats = matAlive + f.deceasedMaternalSiblings.length;
    if (matHats > 0) {
      const baseShare = matHats === 1 ? remainder * (1 / 6) : remainder * (1 / 3);
      const isRadd = patAllW === 0;
      const matShare = isRadd ? remainder : baseShare;
      const eachHat = matShare / matHats;
      const fracLabel = matHats === 1 ? "1/6" : "(toplam 1/3, eşit)";
      const label = isRadd ? `${fracLabel} + radd (kalan)` : fracLabel;
      for (let i = 1; i <= matAlive; i++)
        rows.push({ heir: `Anne-bir kardeş #${i}`, fraction: label, amount: eachHat, basis: "Kelâle — anne-bir" });
      for (const dm of f.deceasedMaternalSiblings) {
        distributeHat(rows, eachHat, toN(dm.sons), toN(dm.daughters),
          "Yeğen (erkek) — anne-bir hattı (temsil)", "Yeğen (kız) — anne-bir hattı (temsil)", "Temsil — anne-bir");
      }
      steps.push(
        `Anne-bir kardeş payı: ${fracLabel} = ${fmtTL(baseShare)} ₺${isRadd ? `; başka kardeş yok, kalan da kendilerine verildi (radd) → toplam ${fmtTL(matShare)} ₺` : ""} (Madde 8A)`
      );
      remainder -= matShare;
    }

    // Öz + baba-bir kardeşler tek havuzda 2:1 + temsil (MADDE 8C — mevcut yorum)
    if (remainder > 0 && patAllW > 0) {
      const unit = remainder / patAllW;
      // Havuz yalnız kız kardeşlerden oluşuyorsa Nisâ 4/176 + reddiye şeffaf etiketi
      const onlySisters = fullB + hpb === 0 &&
        f.deceasedFullSiblings.every((s) => s.sex === "female") &&
        f.deceasedHalfPatSiblings.every((s) => s.sex === "female");
      const sisterLabel = patAllW === 1 ? "1/2 + reddiye (Nisâ 4/176)" : "2/3 eşit + reddiye (Nisâ 4/176)";

      for (let i = 1; i <= fullB; i++)
        rows.push({ heir: `Öz erkek kardeş #${i}`, fraction: `2/${patAllW}`, amount: 2 * unit, basis: "Kelâle — 2:1" });
      for (let i = 1; i <= fullS; i++)
        rows.push({ heir: `Öz kız kardeş #${i}`, fraction: onlySisters ? sisterLabel : `1/${patAllW}`, amount: 1 * unit, basis: "Kelâle — 2:1" });
      for (let i = 1; i <= hpb; i++)
        rows.push({ heir: `Baba-bir erkek kardeş #${i}`, fraction: `2/${patAllW}`, amount: 2 * unit, basis: "Kelâle — 2:1" });
      for (let i = 1; i <= hps; i++)
        rows.push({ heir: `Baba-bir kız kardeş #${i}`, fraction: onlySisters ? sisterLabel : `1/${patAllW}`, amount: 1 * unit, basis: "Kelâle — 2:1" });

      for (const ds of f.deceasedFullSiblings) {
        distributeHat(rows, (ds.sex === "male" ? 2 : 1) * unit, toN(ds.sons), toN(ds.daughters),
          "Yeğen (erkek) — öz (temsil)", "Yeğen (kız) — öz (temsil)", "Temsil — öz");
      }
      for (const ds of f.deceasedHalfPatSiblings) {
        distributeHat(rows, (ds.sex === "male" ? 2 : 1) * unit, toN(ds.sons), toN(ds.daughters),
          "Yeğen (erkek) — baba-bir (temsil)", "Yeğen (kız) — baba-bir (temsil)", "Temsil — baba-bir");
      }
      steps.push(
        `Kalan öz ve baba-bir kardeşlere ${onlySisters ? "Nisâ 4/176'ya göre (reddiye dahil)" : "2:1 ile"} dağıtıldı (toplam ${patAllW} hisse) (Madde 8/5)`
      );
      remainder = 0;
    }
  }

  // 5) Nihai kontrol (MADDE 9): dağıtılamayan kalan görünür yapılır
  const sumAllocated = rows.reduce((a, r) => a + (r.amount || 0), 0);
  if (remainder > 1e-9) {
    rows.push({
      heir: "Dağıtılamayan tutar",
      fraction: "—",
      amount: remainder,
      basis: "Uyarı — girilen mirasçılarla dağıtılamadı (Madde 9)",
      warning: true,
    });
    warnings.push(
      `Dağıtılamayan tutar: ${fmtTL(remainder)} ₺. Girilen mirasçı bilgileriyle bu tutar paylaştırılamadı; girdileri kontrol edin.`
    );
  } else {
    remainder = 0;
    if (netForHeirs > 0 && rows.length > 0) {
      steps.push(`Kontrol: dağıtılan toplam ${fmtTL(sumAllocated)} ₺ = net tereke ✓ (Madde 9)`);
    }
  }

  return { netForHeirs, rows, sumAllocated, remainder, warnings, steps };
}

// Sunum katmanı: tutarları kuruşa yuvarlar; yuvarlama farkını en büyük kesir
// yöntemiyle (largest remainder) dağıtarak toplamın net'e kuruşu kuruşuna
// eşit olmasını garanti eder. Motor içi hesap kesin (float) kalır.
export function roundRowsToKurus(rows, netForHeirs) {
  const targetKurus = Math.round(netForHeirs * 100);
  const items = rows.map((r) => {
    const exact = (r.amount || 0) * 100;
    const floor = Math.floor(exact + 1e-7);
    return { row: r, floor, frac: exact - floor };
  });
  let diff = targetKurus - items.reduce((a, x) => a + x.floor, 0);
  const order = [...items].sort((a, b) => b.frac - a.frac);
  for (let i = 0; diff > 0 && i < order.length; i = (i + 1) % order.length) {
    order[i].floor += 1;
    diff -= 1;
  }
  // diff negatifse (teorik uç durum) en küçük kesirli satırlardan geri al
  for (let i = order.length - 1; diff < 0 && i >= 0; i = (i - 1 + order.length) % order.length) {
    order[i].floor -= 1;
    diff += 1;
  }
  return items.map((x) => ({ ...x.row, amount: x.floor / 100 }));
}

function toN(x) {
  const n = Number(x || 0);
  return Number.isFinite(n) && n > 0 ? n : 0;
}
