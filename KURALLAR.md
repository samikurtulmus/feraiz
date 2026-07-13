# Feraiz.com Hesaplama Kuralları

**Sürüm:** 3.0 · **Son güncelleme:** 14 Temmuz 2026
**Kaynak:** Kur'an-ı Kerim (Nisâ 4/11, 4/12, 4/176 ve ilgili ayetler), Süleymaniye Vakfı meali ve açıklamaları

Bu belge, feraiz.com hesaplama motorunun uyduğu kuralların tam ve bağlayıcı metnidir.
Motor bu belgeden ayrışamaz: her madde otomatik testlerle doğrulanır ve hesap
davranışını değiştiren her kod değişikliği, önce bu belgenin güncellenmesini gerektirir.

Temel ilke, Nisâ Suresi'nde belirtilen sınırlara uymak ve mirası hak sahipleri arasında
**para asla ortada kalmayacak** şekilde adilce taksim etmektir (Madde 9).

---

## Madde 1 — Amaç ve Bağlayıcılık

Bu belge, hesaplama motorunun dayandığı ilkeleri ve işleyiş sırasını belirler. Motor,
buradaki maddelere, sıralamaya ve ilkelere tam olarak bağlıdır. Belgenin aslı Türkçedir;
çeviriler bilgilendirme amaçlıdır.

## Madde 2 — Terekenin Tespiti

Taksime başlamadan önce sırasıyla:

a) Ölenin bıraktığı tüm mal varlığı (**brüt tereke**) tespit edilir.
b) Defin giderleri düşülür.
c) Bilinen borçlar düşülür; vefat eden erkekse eşine ödenmemiş **mehir borcu** da borçtandır.
d) **Net miras = Brüt tereke − (defin giderleri + borçlar)**

Net miras sıfır veya negatifse taksim yapılmaz; kullanıcı bilgilendirilir.

## Madde 3 — Mirasçılık Hiyerarşisi (Senaryo Belirleme)

Mirasçılar tespit edilirken aşağıdaki sıra izlenir; üstteki şart sağlanıyorsa alttaki
senaryolar uygulanmaz:

a) **Alt soy (fürû) varsa** — hayatta çocuk veya (yaşayan torunu olan) vefat etmiş çocuk hattı → Madde 6
b) **Alt soy yok, anne ve/veya baba hayattaysa** → Madde 7
c) **Kelâle** (alt soy ve üst soy yok) → Madde 8

**Temsil satırı geçerlilik kuralı:** Vefat etmiş bir mirasçı hattı, ancak **yaşayan
temsilcisi (çocuğu) varsa** hesaba girer. Yaşayan temsilcisi olmayan hat; pay ağırlığına,
alt soy tespitine ve kardeş varlığı tespitine dahil edilmez (aksi hâlde para ortada kalır
ve senaryo yanlış belirlenir). Bu tür satırlar kullanıcıya uyarıyla bildirilir.

## Madde 4 — Eşin Önceliği (Avliyye'nin Çözümü)

Eş, kan bağıyla değil akit bağıyla mirasçıdır (Nisâ 4/33); bu yüzden payı diğer
mirasçılardan **önce**, doğrudan net miras üzerinden ayrılır. Diğer tüm paylar, eş payı
düşüldükten sonra kalan üzerinden hesaplanır. Bu kural, pay toplamının 1'i aşması
(avliyye) sorununu kendiliğinden çözer.

| Eş | Alt soy varsa | Alt soy yoksa |
|---|---|---|
| Koca | 1/4 | 1/2 |
| Hanım(lar), toplam | 1/8 | 1/4 |

Birden fazla hanım varsa toplam pay aralarında eşit bölünür.

## Madde 5 — 2'ye 1 Kuralı

Alt soyda ve kelâledeki öz/baba-bir kardeşlerde paylaşım, erkeğe iki kadına bir hisse
esasıyla yapılır:

**Toplam hisse = (erkek sayısı × 2) + (kadın sayısı × 1)**

*Örnek: 2 oğul + 1 kız = 5 hisse; her oğul 2/5, kız 1/5 alır.*

### Madde 5.1 — Temsil Yoluyla Mirasçılık

Ölenin vefat etmiş çocuğunun yeri, o çocuğun kendi çocukları (torunlar) tarafından
doldurulur:

a) Hisse hesabında vefat etmiş çocuk da sayılır (oğul 2, kız 1 hisse).
b) Hayattaki çocuklar kendi paylarını doğrudan alır.
c) Vefat etmiş çocuğun payı, **yalnız kendi çocukları** arasında 2:1 kuralıyla bölünür.

Aynı ilke, kelâlede vefat etmiş kardeşlerin çocukları (yeğenler) için de uygulanır.

## Madde 6 — Alt Soy Varken Taksim

a) **Eş payı** Madde 4'e göre önce ayrılır (koca 1/4, hanımlar 1/8).
b) **Anne ve baba**, hayatta olan her biri için kalanın 1/6'sını alır. İkisi de hayatta
   değilse pay ayrılmaz; kalan tamamen alt soya gider.
c) **Kalanın tamamı** alt soy arasında Madde 5 (ve temsil için 5.1) kurallarıyla dağıtılır.
d) Alt soy varken başka hiçbir sınıfa (asabe vb.) pay ayrılmaz. Anne-baba yokluğunda
   kızlar kalanın tamamını alır (Nisâ 4/11 kapsamındaki yorum).

## Madde 7 — Alt Soy Yok, Ebeveyn Hayatta

a) **Eş payı** önce ayrılır (koca 1/2, hanımlar 1/4).
b) Ebeveyn payları, eş sonrası kalan üzerinden:

   **b.i — Anne ve baba birlikte hayattaysa:** anne kalanın 1/3'ünü, baba kalanın
   tamamını alır.

   **b.ii — Yalnız baba hayattaysa:** anne-bir kardeşler paylarını alır (tek kişi 1/6,
   birden fazla toplam 1/3, eşit; temsil dahil); kalanın tamamı — öz kardeş payları
   dahil — babaya verilir.

   **b.iii — Yalnız anne hayattaysa:** kardeş varsa anne kalanın 1/6'sını, yoksa
   tamamını alır. Kardeş paylarında:
   - Baba-bir kardeşler paylarını Madde 5 (2:1) kuralıyla alır (temsil dahil).
   - **Öz kardeşlerin payları anneye aktarılır.**
   - Yalnız anne-bir kardeş varsa: anne hayattayken anne-bir kardeşler mirasçı olmaz
     (Madde 8'in şartı sağlanmaz); kalan anneye verilir (reddiye).

c) **Reddiye:** paylar ayrıldıktan sonra hâlâ artan varsa anneye verilir; para ortada
   bırakılmaz.

## Madde 8 — Kelâle (Alt Soy ve Ebeveyn Yok)

a) **Eş payı** önce ayrılır (koca 1/2, hanımlar 1/4).

b) **Anne-bir kardeşler** — payları eş sonrası kalan üzerinden hesaplanır:
   - Tek kişi: 1/6 · Birden fazla: toplam 1/3, aralarında eşit.
   - Vefat etmiş anne-bir kardeşin payı, çocuklarına (yeğenlere) 2:1 ile geçer (Madde 5.1).
   - **Radd:** Öz veya baba-bir kardeş yoksa, kalan da akrabalık sebebiyle anne-bir
     kardeşlere verilir. *(Kaynak: Prof. Abdurrahman Yazıcı, 2025)*

c) **Öz ve baba-bir kardeşler** — kalanın tamamını **tek havuzda**, Madde 5'in 2:1
   kuralıyla paylaşır; temsil (Madde 5.1) uygulanır.
   - Öz kardeş, baba-bir kardeşi mirastan düşürmez (hacb uygulanmaz).
   - Havuz yalnız kız kardeşlerden oluşuyorsa paylar Nisâ 4/176 ile uyumludur:
     tek kız kardeş 1/2 + reddiye, iki ve daha fazlası 2/3 eşit + reddiye — sonuç,
     kalanın tamamının eşit paylaşımıdır.

## Madde 9 — Nihai Kontrol

Tüm hesaplar tamamlandığında **dağıtılan toplam, net mirasa eşit olmak zorundadır**;
kalan tutar sıfırdır. Motor bu değişmezi her hesapta doğrular ve sonuç tablosunda
mirasçı, pay oranı, dayanak ve tutar şeffaf biçimde gösterilir.

### Madde 9.1 — Mirasçısı Olmayan Kalan (Amme Malı)

Paylar ayrıldıktan sonra kalan için hiçbir mirasçı yoksa (örneğin yalnız eş hayattaysa
veya hiç mirasçı bulunmuyorsa), kalan **amme malı** olur; devlete / ilgili otoriteye
kalır. Sonuç tablosunda "Devlet / ilgili otorite" satırı ve açıklayıcı notla gösterilir;
hata olarak sunulmaz. *(Kaynak: Süleymaniye Vakfı, 2026)*

## Madde 10 — Kapsam

Bu çalışma şu mirasçı sınıflarını kapsar:

- **Eş** (koca / hanımlar)
- **Alt soy:** çocuklar ve temsil yoluyla torunlar
- **Üst soy:** anne ve baba
- **Kardeşler:** öz, baba-bir ve anne-bir kardeşler; temsil yoluyla yeğenler

Dede/nine, amca/hala/dayı/teyze ve diğer uzak akrabaların payları bu çalışmanın kapsamı
dışındadır ve hesaplayıcıda yer almaz. Vasiyet uygulaması da kapsam dışıdır; net miras
yalnız Madde 2'deki kalemler düşülerek bulunur.

---

## Uygulama İlkeleri

1. **Tutarlılık:** Tüm hesaplar bu belgeye göre yapılır; motor ve belge birlikte değişir.
2. **Kaynak uyumu:** Süleymaniye Vakfı meali ve açıklamaları esas alınır.
3. **Adalet:** Para asla ortada kalmaz; tam dağıtım yapılır (Madde 9).
4. **Şeffaflık:** Her hesap adımı, madde referanslarıyla kullanıcıya açıklanır.

## Sürüm Geçmişi

- **3.0 (14 Tem 2026):** Belge "Hesaplama Kuralları" adıyla ve sade yapıyla yeniden düzenlendi; içerik hükümleri değişmedi.
- **2.7 (13 Tem 2026):** Vasiyet kaldırıldı; temsil satırı geçerlilik kuralı; Madde 9.1 (amme malı); Madde 7b.iii, 8b (radd ve taban) ve 8c (tek havuz) netleştirmeleri onaylandı.
- **2.6 (16 Tem 2025):** Temsil yoluyla mirasçılık.
- **2.1 ve öncesi:** Alt soy kuralının netleştirilmesi (anne-baba yokluğunda kızlar kalan tamamını alır) ve temel maddeler.
