// Hesap motoru v3 — anayasa.md ve kullanıcı netleştirmeleriyle uyumlu
// Girdi: sayısal alanlar number; bayraklar boolean; opsiyonel temsili hat listeleri
// Optional:
// - deceasedChildren: Array<{sex:'male'|'female', grandsons:number, granddaughters:number}>
// - deceasedPaternalSiblings: Array<{sex:'male'|'female', sons:number, daughters:number}>

export function computeDistribution(f) {
  const rows = [];

  // 0) Net tespit: Toplam - (defin + borç) → vasiyet serbest (Net'ten büyük olamaz)
  const gross = toN(f.gross);
  const funeral = toN(f.funeral);
  const debts = toN(f.debts);
  const bequest = toN(f.bequest);

  const netBeforeWill = Math.max(0, gross - funeral - debts);
  const will = Math.max(0, Math.min(bequest, netBeforeWill));
  const netForHeirs = Math.max(0, netBeforeWill - will);

  // Helper flags and counts
  const sons = toN(f.sons);
  const daughters = toN(f.daughters);
  const mother = !!f.motherExists;
  const father = !!f.fatherExists;

  const hasAltDescAggregated =
    (sons + daughters) > 0 || (Array.isArray(f.deceasedChildren) && f.deceasedChildren.length > 0);

  // 1) Eş payı — Net'ten önce ayrılır (MADDE 4)
  let spouseTotal = 0;
  const hasSpouse = f.decedentSex === 'male' ? (toN(f.wivesCount) > 0) : !!f.husbandExists;
  if (hasSpouse) {
    if (f.decedentSex === 'male') {
      const frac = hasAltDescAggregated ? 1/8 : 1/4;
      spouseTotal = netForHeirs * frac;
      const wives = toN(f.wivesCount);
      const each = wives > 0 ? spouseTotal / wives : 0;
      for (let i = 1; i <= (wives || 0); i++) {
        rows.push({ heir: `Eş #${i} (kadın)`, fraction: hasAltDescAggregated ? '1/8' : '1/4', amount: each, basis: 'Eş payı (önce)' });
      }
    } else {
      const frac = hasAltDescAggregated ? 1/4 : 1/2;
      spouseTotal = netForHeirs * frac;
      if (f.husbandExists) rows.push({ heir: 'Eş (erkek)', fraction: hasAltDescAggregated ? '1/4' : '1/2', amount: spouseTotal, basis: 'Eş payı (önce)' });
    }
  }

  let remainder = netForHeirs - spouseTotal;

  // 2) Anne/Baba payları (kullanıcı kuralı) ve kardeş varlığı tespiti
  let motherShare = 0, fatherShare = 0;
  const matAlive = toN(f.maternalSiblings);
  const fullB = toN(f.fullBrothers), fullS = toN(f.fullSisters);
  const hpb = toN(f.halfPatBrothers), hps = toN(f.halfPatSisters);
  const deceasedMaternal = Array.isArray(f.deceasedMaternalSiblings) ? f.deceasedMaternalSiblings : [];
  const deceasedFull = Array.isArray(f.deceasedFullSiblings) ? f.deceasedFullSiblings : [];
  const deceasedHalfPat = Array.isArray(f.deceasedHalfPatSiblings) ? f.deceasedHalfPatSiblings : [];
  const siblingsExist = (matAlive + fullB + fullS + hpb + hps) > 0 || deceasedMaternal.length>0 || deceasedFull.length>0 || deceasedHalfPat.length>0;
  if (hasAltDescAggregated) {
    if (mother) { motherShare = remainder * (1/6); rows.push({ heir: 'Anne', fraction: '1/6 (alt soy var)', amount: motherShare, basis: 'Anne payı' }); }
    if (father) { fatherShare = remainder * (1/6); rows.push({ heir: 'Baba', fraction: '1/6 (alt soy var)', amount: fatherShare, basis: 'Baba payı' }); }
    remainder -= (motherShare + fatherShare);
  } else {
    // Alt soy yok
    if (mother && father) {
      motherShare = remainder * (1/3);
      rows.push({ heir: 'Anne', fraction: '1/3 (alt soy yok)', amount: motherShare, basis: 'Anne payı' });
      remainder -= motherShare;
      fatherShare = remainder;
      if (fatherShare > 0) rows.push({ heir: 'Baba', fraction: '(kalan)', amount: fatherShare, basis: 'Baba payı (kalan)' });
      remainder = 0;
    } else if (mother && !father) {
      // Baba yok, alt soy yok
      // Kardeş varsa anne 1/6; yoksa kalan
      if (siblingsExist) {
        motherShare = remainder * (1/6);
        rows.push({ heir: 'Anne', fraction: '1/6 (kardeş var)', amount: motherShare, basis: 'Anne payı' });
        remainder -= motherShare;
      } else {
        motherShare = remainder;
        rows.push({ heir: 'Anne', fraction: '(kalan)', amount: motherShare, basis: 'Anne payı (kalan)' });
        remainder = 0;
      }
      // Anne var, baba yok: paternel taraf kardeşleri (baba-bir + öz) devreye girer;
      // öz kardeş payları anneye aktarılır.
      if (remainder > 0) {
        const weightFull = 2*fullB + 1*fullS + deceasedFull.reduce((a,s)=> a + (s.sex==='male'?2:1), 0);
        const weightHalf = 2*hpb + 1*hps + deceasedHalfPat.reduce((a,s)=> a + (s.sex==='male'?2:1), 0);
        const totalW = weightFull + weightHalf;
        if (totalW > 0) {
          const unit = remainder / totalW;
          let motherFromFull = 0;
          // Yaşayan baba-bir
          for (let i=1;i<=hpb;i++) rows.push({ heir: `Baba-bir erkek kardeş #${i}`, fraction: `2/${totalW}`, amount: 2*unit, basis: 'Baba yok — 2:1' });
          for (let i=1;i<=hps;i++) rows.push({ heir: `Baba-bir kız kardeş #${i}`, fraction: `1/${totalW}`, amount: 1*unit, basis: 'Baba yok — 2:1' });
          // Vefat eden baba-bir temsili
          for (let idx=0; idx<deceasedHalfPat.length; idx++) {
            const ds = deceasedHalfPat[idx];
            const base = (ds.sex==='male'?2:1) * unit;
            const sons = toN(ds.sons), daughters = toN(ds.daughters);
            const w = 2*sons + 1*daughters;
            if (w>0 && base>0){
              const u = base / w;
              for (let i=1;i<=sons;i++) rows.push({ heir: `Yeğen (erkek) #${i} — baba-bir (temsil)`, fraction: `2/${w}`, amount: 2*u, basis: 'Temsil — baba-bir' });
              for (let i=1;i<=daughters;i++) rows.push({ heir: `Yeğen (kız) #${i} — baba-bir (temsil)`, fraction: `1/${w}`, amount: 1*u, basis: 'Temsil — baba-bir' });
            }
          }
          // Öz kardeş payları: anneye aktar
          motherFromFull += weightFull * unit;
          if (motherFromFull > 0) rows.push({ heir: 'Anne', fraction: `(öz kardeş payı)`, amount: motherFromFull, basis: 'Öz kardeş payı anneye aktarıldı' });
          remainder = 0;
        }
      }
    } else if (!mother && father) {
      // Anne yok: anne-bir + öz (anne-baba-bir) kardeşler devreye girer;
      // ancak baba hayattaysa öz kardeş payı babaya gider.
      // 1) Anne-bir kardeşler (eşit + temsil)
      const matHats = matAlive + deceasedMaternal.length;
      if (matHats > 0 && remainder > 0) {
        let matShare = matHats === 1 ? remainder * (1/6) : remainder * (1/3);
        const eachHat = matHats > 0 ? matShare / matHats : 0;
        // yaşayan anne-bir
        for (let i=1;i<=matAlive;i++) rows.push({ heir: `Anne-bir kardeş #${i}`, fraction: matHats===1?'1/6':'(toplam 1/3, eşit)', amount: eachHat, basis: 'Anne yok — anne-bir' });
        // vefat eden anne-bir temsili
        for (let idx=0; idx<deceasedMaternal.length; idx++) {
          const dm = deceasedMaternal[idx];
          const sons = toN(dm.sons);
          const daughters = toN(dm.daughters);
          const w = 2*sons + 1*daughters;
          if (w>0 && eachHat>0) {
            const u = eachHat / w;
            for (let i=1;i<=sons;i++) rows.push({ heir: `Yeğen (erkek) #${i} — anne-bir hattı (temsil)`, fraction: `2/${w}`, amount: 2*u, basis: 'Temsil — anne-bir' });
            for (let i=1;i<=daughters;i++) rows.push({ heir: `Yeğen (kız) #${i} — anne-bir hattı (temsil)`, fraction: `1/${w}`, amount: 1*u, basis: 'Temsil — anne-bir' });
          }
        }
        remainder -= matShare;
      }
      // 2) Öz kardeşlerin payı (anne yok diye devreye girebilir) → baba hayatta olduğu için babaya gider
      if (remainder > 0) {
        fatherShare = remainder;
        rows.push({ heir: 'Baba', fraction: '(kalan — öz kardeş payı dahil)', amount: fatherShare, basis: 'Anne yok — öz kardeş payı babaya' });
        remainder = 0;
      }
    }
  }

  // 3) Alt soya dağıtım (varsa) — çocuklar + temsil (opsiyonel hats)
  if (remainder > 0 && hasAltDescAggregated) {
    const deceasedChildren = Array.isArray(f.deceasedChildren) ? f.deceasedChildren : [];
    const hasHats = deceasedChildren.length > 0;

    if ((sons + daughters) > 0 || hasHats) {
      // Çocuk seviyesi paylar — erkek 2, kız 1, vefat etmiş çocuk bir hat (sex: male=2, female=1)
      let childWeight = 2*sons + 1*daughters + deceasedChildren.reduce((a,c)=> a + (c.sex==='male'?2:1), 0);
      const unit = childWeight > 0 ? remainder / childWeight : 0;

      // Yaşayan çocuklar
      for (let i=1;i<=sons;i++) rows.push({ heir: `Oğul #${i}`, fraction: `2/${childWeight}`, amount: 2*unit, basis: 'Alt soy 2:1' });
      for (let i=1;i<=daughters;i++) rows.push({ heir: `Kız #${i}`, fraction: `1/${childWeight}`, amount: 1*unit, basis: 'Alt soy 2:1' });

      // Vefat etmiş çocukların payını torunlarına 2:1 ile bölüştür
      for (let idx=0; idx<deceasedChildren.length; idx++) {
        const dc = deceasedChildren[idx];
        const childShare = (dc.sex==='male'?2:1) * unit;
        const gs = toN(dc.grandsons);
        const gd = toN(dc.granddaughters);
        const w = 2*gs + 1*gd;
        if (w > 0 && childShare > 0) {
          const u = childShare / w;
          for (let i=1;i<=gs;i++) rows.push({ heir: `Torun (erkek) #${i} — temsil (ebeveyn ${dc.sex==='male'?'oğul':'kız'})`, fraction: `2/${w}`, amount: 2*u, basis: 'Temsil 2:1 (torunlar)' });
          for (let i=1;i<=gd;i++) rows.push({ heir: `Torun (kız) #${i} — temsil (ebeveyn ${dc.sex==='male'?'oğul':'kız'})`, fraction: `1/${w}`, amount: 1*u, basis: 'Temsil 2:1 (torunlar)' });
        }
      }
      remainder = 0;
    }
  }

  // 4) Kelâle/sibling blokları: alt soy yok ve ebeveyn yoksa
  if (remainder > 0 && !hasAltDescAggregated && !mother && !father) {
    // Anne-bir kardeşler (anne hayatta değilse) — eş payı sonrası kalan üzerinden
    const matHats = matAlive + deceasedMaternal.length;
    if (matHats > 0) {
      let matShare = matHats === 1 ? remainder * (1/6) : remainder * (1/3);
      const eachHat = matHats > 0 ? matShare / matHats : 0;
      // Yaşayan anne-bir kardeşler: eşit
      for (let i=1;i<=matAlive;i++) rows.push({ heir: `Anne-bir kardeş #${i}`, fraction: matHats===1?'1/6':'(toplam 1/3, eşit)', amount: eachHat, basis: 'Kelâle — anne-bir' });
      // Vefat etmiş anne-bir kardeş temsili: kendi payını çocuklarına 2:1
      for (let idx=0; idx<deceasedMaternal.length; idx++) {
        const dm = deceasedMaternal[idx];
        const sons = toN(dm.sons);
        const daughters = toN(dm.daughters);
        const w = 2*sons + 1*daughters;
        if (w>0 && eachHat>0){
          const u = eachHat / w;
          for (let i=1;i<=sons;i++) rows.push({ heir: `Yeğen (erkek) #${i} — anne-bir hattı (temsil)`, fraction: `2/${w}`, amount: 2*u, basis: 'Temsil — anne-bir' });
          for (let i=1;i<=daughters;i++) rows.push({ heir: `Yeğen (kız) #${i} — anne-bir hattı (temsil)`, fraction: `1/${w}`, amount: 1*u, basis: 'Temsil — anne-bir' });
        }
      }
      remainder -= matShare;
    }

    // Öz + Baba-bir kardeşlerin tamamı (birlikte) — 2:1 + temsil
    const patFullW = 2*fullB + 1*fullS + deceasedFull.reduce((a,s)=> a + (s.sex==='male'?2:1), 0);
    const patHalfW = 2*hpb + 1*hps + deceasedHalfPat.reduce((a,s)=> a + (s.sex==='male'?2:1), 0);
    const patAllW = patFullW + patHalfW;
    if (remainder > 0 && patAllW > 0) {
      const unit = remainder / patAllW;
      // Yaşayan full
      for (let i=1;i<=fullB;i++) rows.push({ heir: `Öz erkek kardeş #${i}`, fraction: `2/${patAllW}`, amount: 2*unit, basis: 'Kelâle — 2:1' });
      for (let i=1;i<=fullS;i++) rows.push({ heir: `Öz kız kardeş #${i}`, fraction: `1/${patAllW}`, amount: 1*unit, basis: 'Kelâle — 2:1' });
      // Yaşayan baba-bir
      for (let i=1;i<=hpb;i++) rows.push({ heir: `Baba-bir erkek kardeş #${i}`, fraction: `2/${patAllW}`, amount: 2*unit, basis: 'Kelâle — 2:1' });
      for (let i=1;i<=hps;i++) rows.push({ heir: `Baba-bir kız kardeş #${i}`, fraction: `1/${patAllW}`, amount: 1*unit, basis: 'Kelâle — 2:1' });
      // Vefat eden full temsili
      for (let idx=0; idx<deceasedFull.length; idx++) {
        const ds = deceasedFull[idx];
        const base = (ds.sex==='male'?2:1) * unit;
        const sons = toN(ds.sons), daughters = toN(ds.daughters);
        const w = 2*sons + 1*daughters;
        if (w>0 && base>0){
          const u = base / w;
          for (let i=1;i<=sons;i++) rows.push({ heir: `Yeğen (erkek) #${i} — öz (temsil)`, fraction: `2/${w}`, amount: 2*u, basis: 'Temsil — öz' });
          for (let i=1;i<=daughters;i++) rows.push({ heir: `Yeğen (kız) #${i} — öz (temsil)`, fraction: `1/${w}`, amount: 1*u, basis: 'Temsil — öz' });
        }
      }
      // Vefat eden baba-bir temsili
      for (let idx=0; idx<deceasedHalfPat.length; idx++) {
        const ds = deceasedHalfPat[idx];
        const base = (ds.sex==='male'?2:1) * unit;
        const sons = toN(ds.sons), daughters = toN(ds.daughters);
        const w = 2*sons + 1*daughters;
        if (w>0 && base>0){
          const u = base / w;
          for (let i=1;i<=sons;i++) rows.push({ heir: `Yeğen (erkek) #${i} — baba-bir (temsil)`, fraction: `2/${w}`, amount: 2*u, basis: 'Temsil — baba-bir' });
          for (let i=1;i<=daughters;i++) rows.push({ heir: `Yeğen (kız) #${i} — baba-bir (temsil)`, fraction: `1/${w}`, amount: 1*u, basis: 'Temsil — baba-bir' });
        }
      }
      remainder = 0;
    }
  }

  // 5) Toplu yeğen dağıtımı kaldırıldı — temsil satırları (deceased* arrays) kullanılıyor

  const sumAllocated = rows.reduce((a, r) => a + (r.amount || 0), 0);
  return { netBeforeWill, will, netForHeirs, rows, sumAllocated, remainder };
}

function toN(x){ return Number(x||0); }
