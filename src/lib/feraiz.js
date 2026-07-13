// Hesap motoru v5 — KURALLAR.md (v3.0) ile uyumlu, çok dilli
// Girdi: sayısal alanlar number; bayraklar boolean; opsiyonel temsili hat listeleri
// - deceasedChildren: Array<{sex:'male'|'female', grandsons:number, granddaughters:number}>
// - deceasedFullSiblings / deceasedHalfPatSiblings: Array<{sex:'male'|'female', sons:number, daughters:number}>
// - deceasedMaternalSiblings: Array<{sons:number, daughters:number}>
//
// İkinci parametre dil sözlüğüdür (locales[x].engine); varsayılan Türkçedir ve
// feraiz.test.js Türkçe metinlere karşı doğrular.
//
// Dönüş: { netForHeirs, rows, sumAllocated, remainder, warnings, notes, steps }
// MADDE 9 invariantı: sumAllocated + remainder === netForHeirs (para asla sessizce kaybolmaz)

import trLocale from "../i18n/locales/tr.js";

// Yaşayan alıcısı olmayan temsil satırları (hat) hesaba hiç girmemelidir:
// pay ağırlığına girer ama dağıtılamazsa para ortada kalır ve senaryo tespiti
// (alt soy / kardeş varlığı) yanlış döner. Bu yüzden girişte elenir.
function normalizeInputs(raw, L) {
  const warnings = [];

  const filterHats = (list, weightOf, label) => {
    if (!Array.isArray(list)) return [];
    const kept = [];
    for (const item of list) {
      if (weightOf(item) > 0) kept.push(item);
      else warnings.push(L.warnHatIgnored(label));
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
      deceasedChildren: filterHats(raw.deceasedChildren, (c) => 2 * toN(c.grandsons) + toN(c.granddaughters), L.hat.child),
      deceasedFullSiblings: filterHats(raw.deceasedFullSiblings, (s) => 2 * toN(s.sons) + toN(s.daughters), L.hat.full),
      deceasedHalfPatSiblings: filterHats(raw.deceasedHalfPatSiblings, (s) => 2 * toN(s.sons) + toN(s.daughters), L.hat.halfPat),
      deceasedMaternalSiblings: filterHats(raw.deceasedMaternalSiblings, (s) => 2 * toN(s.sons) + toN(s.daughters), L.hat.maternal),
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

export function computeDistribution(raw, L = trLocale.engine) {
  const { f, warnings } = normalizeInputs(raw, L);
  const rows = [];
  const steps = [];

  // 0) Net tespit: Toplam - (defin + borç)  (MADDE 2)
  const netForHeirs = Math.max(0, f.gross - f.funeral - f.debts);
  steps.push(L.steps.net(f.gross, f.funeral, f.debts, netForHeirs));
  if (f.gross > 0 && netForHeirs === 0) {
    warnings.push(L.warnConsumed);
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
        rows.push({ heir: L.heirs.wife(i), fraction: fracLabel, amount: each, basis: L.basis.spouseFirst });
      }
      steps.push(L.steps.spouseWives(fracLabel, spouseTotal, f.wivesCount));
    } else {
      const fracLabel = hasDescendants ? "1/4" : "1/2";
      spouseTotal = netForHeirs * (hasDescendants ? 1 / 4 : 1 / 2);
      rows.push({ heir: L.heirs.husband, fraction: fracLabel, amount: spouseTotal, basis: L.basis.spouseFirst });
      steps.push(L.steps.spouseHusband(fracLabel, spouseTotal));
    }
  }

  let remainder = netForHeirs - spouseTotal;

  // 2) Anne/Baba payları
  if (remainder > 0 && hasDescendants) {
    // Alt soy varken anne ve baba 1/6'şar alır (MADDE 6b)
    let parentTotal = 0;
    if (mother) {
      const s = remainder * (1 / 6);
      rows.push({ heir: L.heirs.mother, fraction: L.fr.sixthDesc, amount: s, basis: L.basis.mother });
      steps.push(L.steps.motherSixth(s));
      parentTotal += s;
    }
    if (father) {
      const s = remainder * (1 / 6);
      rows.push({ heir: L.heirs.father, fraction: L.fr.sixthDesc, amount: s, basis: L.basis.father });
      steps.push(L.steps.fatherSixth(s));
      parentTotal += s;
    }
    remainder -= parentTotal;
  } else if (remainder > 0 && !hasDescendants) {
    if (mother && father) {
      // Anne 1/3, kalan babaya (MADDE 7b)
      const motherShare = remainder * (1 / 3);
      rows.push({ heir: L.heirs.mother, fraction: L.fr.thirdNoDesc, amount: motherShare, basis: L.basis.mother });
      const fatherShare = remainder - motherShare;
      rows.push({ heir: L.heirs.father, fraction: L.fr.residue, amount: fatherShare, basis: L.basis.fatherResidue });
      steps.push(L.steps.motherThirdFatherRest(motherShare, fatherShare));
      remainder = 0;
    } else if (mother && !father) {
      // Baba yok: kardeş varsa anne 1/6, yoksa kalanın tamamı (MADDE 7b.i + 7c reddiye)
      if (siblingsExist) {
        const motherShare = remainder * (1 / 6);
        rows.push({ heir: L.heirs.mother, fraction: L.fr.sixthSiblings, amount: motherShare, basis: L.basis.mother });
        steps.push(L.steps.motherSixthSib(motherShare));
        remainder -= motherShare;
      } else {
        rows.push({ heir: L.heirs.mother, fraction: L.fr.residue, amount: remainder, basis: L.basis.motherResidue });
        steps.push(L.steps.allToMother(remainder));
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
            rows.push({ heir: L.heirs.halfBrother(i), fraction: `2/${totalW}`, amount: 2 * unit, basis: L.basis.noFather21 });
          for (let i = 1; i <= hps; i++)
            rows.push({ heir: L.heirs.halfSister(i), fraction: `1/${totalW}`, amount: 1 * unit, basis: L.basis.noFather21 });
          for (const ds of f.deceasedHalfPatSiblings) {
            distributeHat(rows, (ds.sex === "male" ? 2 : 1) * unit, toN(ds.sons), toN(ds.daughters),
              L.heirs.nephewM.halfPat, L.heirs.nephewF.halfPat, L.basis.reprHalfPat);
          }
          const motherFromFull = weightFull * unit;
          if (motherFromFull > 0) {
            rows.push({ heir: L.heirs.mother, fraction: L.fr.fullSibShare, amount: motherFromFull, basis: L.basis.fullToMother });
            steps.push(L.steps.fullToMother(motherFromFull));
          }
          if (weightHalf > 0) steps.push(L.steps.halfPat21);
          remainder = 0;
        } else {
          // Yalnız anne-bir kardeş var: anne hayattayken anne-bir kardeşler mirasçı olmaz
          // (Madde 8A şartı: anne hayatta değil) → kalan anneye (reddiye, para ortada kalmaz)
          rows.push({ heir: L.heirs.mother, fraction: L.fr.residue, amount: remainder, basis: L.basis.raddToMother });
          steps.push(L.steps.raddToMother(remainder));
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
          rows.push({ heir: L.heirs.matSibling(i), fraction: matHats === 1 ? L.fr.sixth : L.fr.thirdEqual, amount: eachHat, basis: L.basis.noMotherMat });
        for (const dm of f.deceasedMaternalSiblings) {
          distributeHat(rows, eachHat, toN(dm.sons), toN(dm.daughters),
            L.heirs.nephewM.maternal, L.heirs.nephewF.maternal, L.basis.reprMat);
        }
        steps.push(L.steps.matNoMother(matHats === 1 ? L.fr.sixth : L.fr.thirdEqualShort, matShare));
        remainder -= matShare;
      }
      if (remainder > 0) {
        rows.push({ heir: L.heirs.father, fraction: L.fr.residueInclFullSib, amount: remainder, basis: L.basis.noMotherToFather });
        steps.push(L.steps.residueFather(remainder));
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
      rows.push({ heir: L.heirs.son(i), fraction: `2/${childWeight}`, amount: 2 * unit, basis: L.basis.desc21 });
    for (let i = 1; i <= daughters; i++)
      rows.push({ heir: L.heirs.daughter(i), fraction: `1/${childWeight}`, amount: 1 * unit, basis: L.basis.desc21 });

    for (const dc of f.deceasedChildren) {
      distributeHat(rows, (dc.sex === "male" ? 2 : 1) * unit, toN(dc.grandsons), toN(dc.granddaughters),
        L.heirs.grandsonLabel(dc.sex), L.heirs.granddaughterLabel(dc.sex), L.basis.repr21);
    }
    steps.push(L.steps.desc21(childWeight, unit, f.deceasedChildren.length > 0));
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
      const fracLabel = matHats === 1 ? L.fr.sixth : L.fr.thirdEqual;
      const label = isRadd ? L.fr.plusRadd(fracLabel) : fracLabel;
      for (let i = 1; i <= matAlive; i++)
        rows.push({ heir: L.heirs.matSibling(i), fraction: label, amount: eachHat, basis: L.basis.kelaleMat });
      for (const dm of f.deceasedMaternalSiblings) {
        distributeHat(rows, eachHat, toN(dm.sons), toN(dm.daughters),
          L.heirs.nephewM.maternal, L.heirs.nephewF.maternal, L.basis.reprMat);
      }
      steps.push(L.steps.kelaleMat(matHats === 1 ? L.fr.sixth : L.fr.thirdEqualShort, baseShare, isRadd, matShare));
      remainder -= matShare;
    }

    // Öz + baba-bir kardeşler tek havuzda 2:1 + temsil (MADDE 8C — hacb uygulanmaz, onaylı)
    if (remainder > 0 && patAllW > 0) {
      const unit = remainder / patAllW;
      // Havuz yalnız kız kardeşlerden oluşuyorsa Nisâ 4/176 + reddiye şeffaf etiketi
      const onlySisters = fullB + hpb === 0 &&
        f.deceasedFullSiblings.every((s) => s.sex === "female") &&
        f.deceasedHalfPatSiblings.every((s) => s.sex === "female");
      const sisterLabel = patAllW === 1 ? L.fr.sisterHalf : L.fr.sisterTwoThirds;

      for (let i = 1; i <= fullB; i++)
        rows.push({ heir: L.heirs.fullBrother(i), fraction: `2/${patAllW}`, amount: 2 * unit, basis: L.basis.kelale21 });
      for (let i = 1; i <= fullS; i++)
        rows.push({ heir: L.heirs.fullSister(i), fraction: onlySisters ? sisterLabel : `1/${patAllW}`, amount: 1 * unit, basis: L.basis.kelale21 });
      for (let i = 1; i <= hpb; i++)
        rows.push({ heir: L.heirs.halfBrother(i), fraction: `2/${patAllW}`, amount: 2 * unit, basis: L.basis.kelale21 });
      for (let i = 1; i <= hps; i++)
        rows.push({ heir: L.heirs.halfSister(i), fraction: onlySisters ? sisterLabel : `1/${patAllW}`, amount: 1 * unit, basis: L.basis.kelale21 });

      for (const ds of f.deceasedFullSiblings) {
        distributeHat(rows, (ds.sex === "male" ? 2 : 1) * unit, toN(ds.sons), toN(ds.daughters),
          L.heirs.nephewM.full, L.heirs.nephewF.full, L.basis.reprFull);
      }
      for (const ds of f.deceasedHalfPatSiblings) {
        distributeHat(rows, (ds.sex === "male" ? 2 : 1) * unit, toN(ds.sons), toN(ds.daughters),
          L.heirs.nephewM.halfPat, L.heirs.nephewF.halfPat, L.basis.reprHalfPat);
      }
      steps.push(L.steps.kelalePool(patAllW, onlySisters));
      remainder = 0;
    }
  }

  // 5) Nihai kontrol (MADDE 9): mirasçısı olmayan kalan amme malı olur (Madde 9.1)
  // Kalan yalnız kan bağıyla mirasçı hiç yokken pozitif kalabilir
  // (ör. sadece eş hayatta, ya da hiç mirasçı girilmedi).
  const sumAllocated = rows.reduce((a, r) => a + (r.amount || 0), 0);
  const notes = [];
  if (remainder > 1e-9) {
    rows.push({
      heir: L.heirs.publicAuthority,
      fraction: L.fr.residue,
      amount: remainder,
      basis: L.basis.amme,
      info: true,
    });
    notes.push(L.notes.publicRemainder(remainder));
    steps.push(L.steps.publicRemainder(remainder));
  } else {
    remainder = 0;
    if (netForHeirs > 0 && rows.length > 0) {
      steps.push(L.steps.check(sumAllocated));
    }
  }

  return { netForHeirs, rows, sumAllocated, remainder, warnings, notes, steps };
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
