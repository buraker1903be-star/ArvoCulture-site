/*
  YURTDIŞI KARGOSU — ArvoARC'ın sipariş fonksiyonunun aynası.

  Buradaki rakamlar ArvoARC'taki tests/db/yurtdisi-kargo.test.mjs ile
  AYNI: kur 40, kâr payı %5, genel bölge 25 $, Almanya 15 $. İki taraf
  aynı sepette aynı kargoyu bulmazsa müşteri ödemede başka tutar görür;
  bu depoda o sapma bir kez yaşandı (17 Eylül 2026).
*/
import test from "node:test";
import assert from "node:assert/strict";
import { bolgeBul, kargoSenti, toBolgeler } from "@/lib/kargo-bolgesi";
import {
  dolarKarsiligi,
  malBedeli,
  yurtIci,
  yurtdisiKargo,
  DEFAULT_SALES_RULES,
} from "@/lib/order-quote";

const DUNYA = { label: "Dünya", countries: [], fee_cents: 2500, free_over_cents: 0, sira: 9 };
const AVRUPA = { label: "Avrupa", countries: ["DE", "FR"], fee_cents: 1500, free_over_cents: 0, sira: 0 };
const ESIKLI = { ...DUNYA, free_over_cents: 10_000 };

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
  assert.equal(kargoSenti([AVRUPA], "US", 0), null);
});

test("bölge eşiği sent cinsinden karşılaştırılıyor", () => {
  assert.equal(kargoSenti([ESIKLI], "US", 9_975), 2500);
  assert.equal(kargoSenti([ESIKLI], "US", 10_000), 0);
});

test("eşik GELEN TUTARIN dolar karşılığıyla karşılaştırılıyor", () => {
  /*
    SÖZLEŞME DEĞİŞTİ (22.10.2026): kâr payını artık ÇAĞIRAN uyguluyor
    (`malBedeli`) ve bu işlev çevrimde kâr payı kullanmıyor. Önceden
    ham tutar veriliyor ve kâr payı burada uygulanıyordu; ArvoARC kâr
    payını tahsil etmeye başlayınca (20261022190527) aynı çarpım iki
    yerde olurdu.

    Ham karşılıkla eşik: 3.800 TL ÷ 40 = 95 $ < 100 → kargo var.
    Kâr paylı tutarla aynı sepet: aşağıdaki "iki kez uygulamıyor"
    testinde ölçülüyor.
  */
  assert.deepEqual(yurtdisiKargo(3800, "US", [ESIKLI], KURALLAR), { tl: 1000, usdSent: 2500 });
  /* 4.000 TL ÷ 40 = 100 $: eşiğe tam oturuyor, kargo bedava. */
  assert.deepEqual(yurtdisiKargo(4000, "US", [ESIKLI], KURALLAR), { tl: 0, usdSent: 0 });
});

test("tarife kurla liraya çevriliyor", () => {
  /* 2.500 sent × 40 = 100.000 kuruş = 1.000 TL. */
  assert.deepEqual(yurtdisiKargo(500, "US", [DUNYA], KURALLAR), { tl: 1000, usdSent: 2500 });
  /* Almanya'nın kendi tarifesi: 1.500 sent × 40 = 600 TL. */
  assert.deepEqual(yurtdisiKargo(500, "DE", [DUNYA, AVRUPA], KURALLAR), { tl: 600, usdSent: 1500 });
});

test("TL eşiği yurtdışında geçmiyor", () => {
  /*
    Yurt içi eşiği 2.000 TL; aşağıdaki sepet onun çok üstünde ve yurt
    içinde kargo bedava olurdu. Yurtdışında uygulanırsa hemen her
    sipariş bedava kargo alırdı.
  */
  const sonuc = yurtdisiKargo(5000, "US", [DUNYA], KURALLAR);
  assert.deepEqual(sonuc, { tl: 1000, usdSent: 2500 });
});

test("mod kapalı, kur yok ya da bölge yok: sebebiyle dönüyor", () => {
  assert.deepEqual(yurtdisiKargo(500, "US", [DUNYA], DEFAULT_SALES_RULES), { engel: "mod" });
  assert.deepEqual(
    yurtdisiKargo(500, "US", [DUNYA], { ...KURALLAR, usdRate: null }),
    { engel: "kur" },
  );
  assert.deepEqual(yurtdisiKargo(500, "US", [AVRUPA], KURALLAR), { engel: "bolge" });
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

test("ArvoARC ile aynı rakam: 3.800 TL sepet, kur 40, kâr %5", () => {
  /*
    ArvoARC'ın veritabanı testiyle (tests/db/yurtdisi-kargo) AYNI
    sayılar: mal 399.000 kuruş, kargo 100.000, toplam 499.000 ve
    124,75 $. İki taraf ayrışırsa müşteri ödemede başka tutar görür.
  */
  const mal = malBedeli(3800, "US", KURALLAR);
  assert.equal(mal, 3990);
  const kargo = yurtdisiKargo(mal, "US", [DUNYA], KURALLAR);
  assert.deepEqual(kargo, { tl: 1000, usdSent: 2500 });
  assert.equal(dolarKarsiligi(mal + 1000, KURALLAR), 124.75);
});

test("bölge eşiği kâr payını iki kez uygulamıyor", () => {
  /*
    Eşik 100 $. Kâr paylı mal 3.990 TL → 99,75 $, eşiğin ALTINDA.
    Eski kod burada bir kez daha 1,05 ile çarpıyordu (104,74 $) ve
    eşiği müşterinin gördüğünden ÖNCE aşıyordu.
  */
  assert.deepEqual(yurtdisiKargo(malBedeli(3800, "US", KURALLAR), "US", [ESIKLI], KURALLAR), {
    tl: 1000,
    usdSent: 2500,
  });
  /* 3.840 × 1,05 = 4.032 TL → 100,80 $: eşiğin üstünde. */
  assert.deepEqual(yurtdisiKargo(malBedeli(3840, "US", KURALLAR), "US", [ESIKLI], KURALLAR), {
    tl: 0,
    usdSent: 0,
  });
});
