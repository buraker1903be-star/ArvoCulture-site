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
import { yurtIci, yurtdisiKargo, DEFAULT_SALES_RULES } from "@/lib/order-quote";

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

test("eşik MÜŞTERİNİN GÖRDÜĞÜ dolar tutarıyla karşılaştırılıyor", () => {
  /*
    İki sepet de ham karşılıkta eşiğin ALTINDA (95,00 ve 96,00 $) ama
    kâr payıyla biri üstüne çıkıyor:
      3.800 TL → 95,00 × 1,05 =  99,75 $  → kargo var
      3.840 TL → 96,00 × 1,05 = 100,80 $  → kargo yok
    ArvoARC'ta aynı iki rakam ölçülüyor.
  */
  assert.deepEqual(yurtdisiKargo(3800, "US", [ESIKLI], KURALLAR), { tl: 1000, usdSent: 2500 });
  assert.deepEqual(yurtdisiKargo(3840, "US", [ESIKLI], KURALLAR), { tl: 0, usdSent: 0 });
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
