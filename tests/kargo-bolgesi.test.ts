/*
  YURTDIŞI KARGOSU — ArvoARC'ın sipariş fonksiyonunun aynası.

  Buradaki rakamlar ArvoARC'taki tests/db/yurtdisi-kargo.test.mjs ile
  AYNI: kur 40, kâr payı %5, genel bölge 25 $, Almanya 15 $. İki taraf
  aynı sepette aynı kargoyu bulmazsa müşteri ödemede başka tutar görür;
  bu depoda o sapma bir kez yaşandı (17 Eylül 2026).
*/
import test from "node:test";
import assert from "node:assert/strict";
import { bolgeBul, toBolgeler, enDusukKargoSenti } from "@/lib/kargo-bolgesi";
import { dolarKarsiligi, malBedeli, yurtIci, DEFAULT_SALES_RULES } from "@/lib/order-quote";

const DUNYA = { label: "Dünya", countries: [], fee_cents: 2500, free_over_cents: 0, sira: 9 };
const AVRUPA = { label: "Avrupa", countries: ["DE", "FR"], fee_cents: 1500, free_over_cents: 0, sira: 0 };

const KURALLAR = {
  ...DEFAULT_SALES_RULES,
  internationalEnabled: true,
  usdRate: 40,
  usdMarginPercent: 5,
};

test("ülkeye özel bölge, genel bölgeyi yutmuyor", () => {
  assert.equal(bolgeBul([DUNYA, AVRUPA], "DE")?.label, "Avrupa");
  assert.equal(bolgeBul([DUNYA, AVRUPA], "US")?.label, "Dünya");
  /* Küçük harf ve boşluk da aynı ülke. */
  assert.equal(bolgeBul([DUNYA, AVRUPA], " de ")?.label, "Avrupa");
});

test("bölge bulunamazsa null — sıfır değil", () => {
  /* Sıfır "bedava kargo" demek olurdu: tarifesiz bir ülkeye o
     siparişin bütün maliyetini üstlenmek. */
  assert.equal(bolgeBul([AVRUPA], "US"), null);
});






test('"Türkiye" yazımlarının hepsi yurt içi', () => {
  /* ArvoARC'ın sipariş fonksiyonu da aynı listeyi normalleştiriyor;
     biri "Türkiye"yi yurtdışı sayarsa müşteri sepette yurt içi
     kargosu görüp siparişte yurtdışı tarifesiyle karşılaşırdı. */
  for (const yazim of ["TR", "tr", " TR ", "Türkiye", "turkey", "TÜRKİYE"]) {
    assert.equal(yurtIci(yazim), true, yazim);
  }
  for (const yazim of ["DE", "US", "Germany"]) {
    assert.equal(yurtIci(yazim), false, yazim);
  }
  /* Ülke bilinmiyorsa yurt içi: adres alanı boş gelen eski akışlarda
     bütün sepetleri yurtdışı saymak, çalışan satışı durdurmak olurdu. */
  assert.equal(yurtIci(null), true);
  assert.equal(yurtIci(""), true);
});

test("satırlardaki metin sayılar bölgeye çevriliyor", () => {
  /* PostgREST bigint'i metin olarak döndürebiliyor. */
  const bolgeler = toBolgeler([
    { label: "Dünya", countries: null, fee_cents: "2500", free_over_cents: "0", sira: "9" },
  ]);
  assert.deepEqual(bolgeler, [
    { label: "Dünya", countries: [], fee_cents: 2500, free_over_cents: 0, sira: 9 },
  ]);
});

/*
  KÂR PAYI TAHSİL EDİLİYOR — ArvoARC'ın aynası (20261022190527).

  Kâr payı yalnızca gösterime uygulanıyordu: ürün kartında 1.000 TL'lik
  ürün 27,71 $ yazıyor, karttan 1.000 TL (20,53 $) çekiliyordu. Kâr
  payı hiçbir şey kazandırmıyor, üstelik ekranla tahsilat %35
  ayrışıyordu — bu depoda "en pahalı kusur" diye yazılı olan şey.

  Ölçüt tek cümle: gösterilen dolar = tahsil edilen TL ÷ kur.
*/
test("mal bedeli yurtdışında kâr paylı, yurt içinde değil", () => {
  assert.equal(malBedeli(1000, "US", KURALLAR), 1050);
  assert.equal(malBedeli(1000, "TR", KURALLAR), 1000);
  /* "Türkiye" yazımı da yurt içi. */
  assert.equal(malBedeli(1000, "Türkiye", KURALLAR), 1000);
  /* Kâr payı sıfırsa fark yok. */
  assert.equal(malBedeli(1000, "US", { ...KURALLAR, usdMarginPercent: 0 }), 1000);
});

test("dolar karşılığı çevrimde kâr payı UYGULAMIYOR", () => {
  /*
    Gelen TL tutar kâr payını zaten içeriyor; `dolara` ile çevirmek
    onu iki kez uygulardı (ödeme özetindeki "≈ $X" satırı bu yüzden
    ayrı bir işlev kullanıyor).
  */
  assert.equal(dolarKarsiligi(1050, KURALLAR), 26.25);
  assert.equal(dolarKarsiligi(1000, { ...KURALLAR, usdRate: null }), null);
});



test('"Shipping from" EN DÜŞÜK taban ücreti yazıyor, kâr payı binmiyor', () => {
  /*
    CANLIDA YANLIŞ YAZIYORDU (22.10.2026): İngilizce ana sayfa "öteki
    her yer" bölgesini okuyup üstüne kâr payı da biniyordu —
    45 $ × 1,35 = 60,75 $ ve sayfada "Shipping from $60.75" görünüyordu.
    Ödemede alınan 45 $. İki kez yanlıştı: kâr payı MAL BEDELİNİN
    içinde, ve "from" alt sınır demek olduğu için en pahalı bölge
    yazılamaz.
  */
  const bolgeler = toBolgeler([AVRUPA, DUNYA]);
  assert.equal(enDusukKargoSenti(bolgeler), 1500);

  /* Kâr payı EKLENMİYOR: gösterilen ile tahsil edilen ayrılmamalı. */
  const kargoyaKarPayi = Math.ceil(1500 * (1 + KURALLAR.usdMarginPercent / 100));
  assert.notEqual(enDusukKargoSenti(bolgeler), kargoyaKarPayi);
});

test("tarife yoksa rakam yazılmıyor", () => {
  /* Uydurma bir ücret, ödemede başka tutar görmek demek. */
  assert.equal(enDusukKargoSenti([]), null);
  assert.equal(
    enDusukKargoSenti(toBolgeler([{ ...DUNYA, fee_cents: 0 }])),
    null,
  );
});
