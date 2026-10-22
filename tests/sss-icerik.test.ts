/*
  İNGİLİZCE SSS'TE KARGO YANITI.

  CANLIDA YANLIŞ YAZIYORDU (23.10.2026): yanıt yurt içi cümlesiydi —
  "Kargo ücreti 120 TL'dir. 2.000 TL ve üzeri siparişlerde kargo
  ücretsizdir." Hem Türkçe hem de YURT İÇİ tarifesi; yurtdışı
  müşterisine 2.000 TL (≈41 $) üzeri ücretsiz kargo vaat ediyordu ve
  gerçek eşik bölgeye göre 250–500 $.

  Ölçüt: yanlış vaat, vaat etmemekten kötüdür.
*/
import test from "node:test";
import assert from "node:assert/strict";
import { kargoYaniti, sssVarsayilanlari, KARGO_YERI } from "@/lib/sss-icerik";

const YURT_ICI = "Kargo ücreti 120 TL’dir. 2.000 TL ve üzeri siparişlerde kargo ücretsizdir.";
const KALIPLAR = {
  tarifeli: "International shipping starts at {taban}; calculated at checkout.",
  tarifesiz: "Shipping is calculated at checkout.",
};

test("Türkçede yurt içi cümlesi aynen geçiyor", () => {
  const yanit = kargoYaniti({
    dil: "tr",
    yurtIciCumle: YURT_ICI,
    tabanSent: 2200,
    kaliplar: KALIPLAR,
  });
  assert.equal(yanit, YURT_ICI);
});

test("İNGİLİZCEDE YURT İÇİ TARİFESİ GEÇMİYOR", () => {
  const yanit = kargoYaniti({
    dil: "en",
    yurtIciCumle: YURT_ICI,
    tabanSent: 2200,
    kaliplar: KALIPLAR,
  });
  /* Yurt içi cümlesinin hiçbir parçası sızmamalı: ne dili ne
     rakamları doğru. */
  assert.ok(!yanit.includes("TL"));
  assert.ok(!yanit.includes("2.000"));
  assert.equal(yanit, "International shipping starts at $22.00; calculated at checkout.");
});

test("tarife okunamazsa rakam UYDURULMUYOR", () => {
  /* Bölge listesi boş gelebilir (ArvoARC okunamadı). Uydurma bir
     ücret, ödemede başka tutar görmek demek. */
  const yanit = kargoYaniti({
    dil: "en",
    yurtIciCumle: YURT_ICI,
    tabanSent: null,
    kaliplar: KALIPLAR,
  });
  assert.equal(yanit, KALIPLAR.tarifesiz);
  assert.ok(!/\d/.test(yanit));
});

test("İngilizce listede gümrük, para birimi ve iade kargosu SORULUYOR", () => {
  /*
    Üçü de Türkçe listede YOK ve olmamalı — yurt içinde böyle bir
    soru yok. Yurtdışında ise üçü de faturayı ya da beklentiyi
    değiştiriyor; sorulmazsa müşteri kapıda öğreniyor.
  */
  const sorular = sssVarsayilanlari("en")
    .flatMap((g) => g.items.map(([soru]) => soru.toLowerCase()))
    .join(" | ");
  for (const konu of ["customs", "currency", "return shipping"]) {
    assert.ok(sorular.includes(konu), `İngilizce listede eksik: ${konu}`);
  }
});

test("her iki dilde de kargo yer tutucusu TAM BİR KEZ geçiyor", () => {
  /* Yer tutucu doldurulmazsa müşteri "__kargo__" görür; ikinci kez
     geçerse tarife cümlesi iki yerde çıkar. */
  for (const dil of ["tr", "en"] as const) {
    const sayi = sssVarsayilanlari(dil)
      .flatMap((g) => g.items.map(([, cevap]) => cevap))
      .filter((c) => c === KARGO_YERI).length;
    assert.equal(sayi, 1, dil);
  }
});
