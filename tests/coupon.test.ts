import assert from "node:assert/strict";
import test from "node:test";
import { evaluateCoupon, kuponaTabiToplam } from "@/lib/coupon";
import type { StorefrontDiscount } from "@/lib/discounts";

// Tutarlar ArvoARC'ta kuruş: value (sabit indirimde) ve minimum_subtotal kuruş,
// yüzde indirimde value yüzde. Sepet ara toplamı TL.
const indirim = (over: Partial<StorefrontDiscount>): StorefrontDiscount => ({
  id: "d1",
  name: "Kampanya",
  code: "YAZ10",
  discount_type: "percentage",
  value: 10,
  minimum_subtotal: 0,
  combinable: false,
  badge: "",
  ...over,
});

test("yüzde indirim", () => {
  const sonuc = evaluateCoupon([indirim({})], "YAZ10", 1500, 1500);
  assert.deepEqual(sonuc, { ok: true, amount: 150, freeShipping: false, label: "%10 indirim" });
});

test("kod büyük/küçük harf ve boşluk duyarsız", () => {
  assert.equal(evaluateCoupon([indirim({})], "  yaz10 ", 100, 100).ok, true);
});

test("yüzde indirim ArvoARC gibi kuruşta yuvarlanır", () => {
  // 33,33 TL'nin %10'u = 333,3 kuruş → 333 kuruş = 3,33 TL
  const sonuc = evaluateCoupon([indirim({})], "YAZ10", 33.33, 33.33);
  assert.equal(sonuc.ok && sonuc.amount, 3.33);
});

test("sabit indirim kuruştan TL'ye çevrilir ve ara toplamı aşamaz", () => {
  const sabit = indirim({ code: "100TL", discount_type: "fixed_amount", value: 10000 });
  assert.equal((evaluateCoupon([sabit], "100TL", 1500, 1500) as { amount: number }).amount, 100);
  assert.equal((evaluateCoupon([sabit], "100TL", 60, 60) as { amount: number }).amount, 60);
});

test("alt limit kuruş cinsinden karşılaştırılır", () => {
  const limitli = indirim({ minimum_subtotal: 50000 }); // 500 TL
  assert.equal(evaluateCoupon([limitli], "YAZ10", 499.99, 499.99).ok, false);
  assert.equal(evaluateCoupon([limitli], "YAZ10", 500, 500).ok, true);
  assert.equal(evaluateCoupon([limitli], "YAZ10", 2500, 2500).ok, true, "2.500 TL'lik sepet reddedilmemeli");
});

test("reddedilen kodun mesajı limiti TL gösterir", () => {
  const sonuc = evaluateCoupon([indirim({ minimum_subtotal: 50000 })], "YAZ10", 100, 100);
  assert.equal(sonuc.ok, false);
  assert.match(!sonuc.ok ? sonuc.reason : "", /500,00/);
});

test("ücretsiz kargo kuponu tutar düşmez, kargo bayrağını açar", () => {
  const kargo = indirim({ code: "KARGO", discount_type: "free_shipping", value: 0 });
  assert.deepEqual(evaluateCoupon([kargo], "KARGO", 300, 300), {
    ok: true, amount: 0, freeShipping: true, label: "Kargo ücretsiz",
  });
});

test("geçersiz ve boş kod", () => {
  assert.equal(evaluateCoupon([indirim({})], "YOK", 100, 100).ok, false);
  assert.equal(evaluateCoupon([indirim({})], "   ", 100, 100).ok, false);
  assert.equal(evaluateCoupon([indirim({ code: null })], "YAZ10", 100, 100).ok, false);
});


/*
 * "İNDİRİMDEKİ ÜRÜNLERDE GEÇERLİ DEĞİLDİR".
 *
 * Kural panelde VARDI (indirim kaydındaki `combinable`, "Diğer
 * indirimlerle birleştirilebilir" kutusu) ama hiçbir yerde
 * uygulanmıyordu: ArvoARC'ın sipariş fonksiyonu kuponu her zaman
 * ara toplamın tamamına uyguluyordu. Panel bir şey vaat edip başka
 * şey yapıyordu ve bu sessizdi.
 */
test("birleşmeyen kupon yalnızca indirimsiz satırlara uygulanıyor", () => {
  // Sepet 1.500 TL; 500'ü indirimli ürün. %10 → 100 TL, 150 değil.
  const sonuc = evaluateCoupon([indirim({})], "YAZ10", 1500, 1000);
  assert.deepEqual(sonuc, {
    ok: true,
    amount: 100,
    freeShipping: false,
    /* Satır kendisi söylüyor: müşteri sepetteyken kampanya bandı
       ekranda değil ve gördüğü tek şey beklediğinden küçük bir
       indirim olurdu. */
    label: "%10 indirim (indirimliler hariç)",
  });
});

test("birleşebilir kupon sepetin tamamına uygulanıyor", () => {
  const sonuc = evaluateCoupon(
    [indirim({ combinable: true })],
    "YAZ10",
    1500,
    1000,
  );
  assert.equal(sonuc.ok && sonuc.amount, 150);
});

test("sepetin tamamı indirimliyse sebep söyleniyor", () => {
  /* "0 TL indirim" yazan bir kutu kodun ÇALIŞTIĞINI düşündürür;
     müşteri toplam değişmeyince kodu tekrar tekrar dener. */
  const sonuc = evaluateCoupon([indirim({})], "YAZ10", 1500, 0);
  assert.deepEqual(sonuc, {
    ok: false,
    reason: "Bu kod indirimdeki ürünlerde geçerli değil.",
  });
});

test("sabit indirim de tabanı aşamıyor", () => {
  // 300 TL'lik kod, kupona tabi tutar 200 TL → en fazla 200.
  const sonuc = evaluateCoupon(
    [indirim({ discount_type: "fixed_amount", value: 30000 })],
    "YAZ10",
    1500,
    200,
  );
  assert.equal(sonuc.ok && sonuc.amount, 200);
});

test("ücretsiz kargo kuponu indirimli sepette de çalışıyor", () => {
  /* Kargo bir ÜRÜN indirimi değil; "indirimdeki üründe geçerli
     değil" kuralı ona uygulanırsa müşteri hak ettiği ücretsiz
     kargoyu kaybeder. */
  const sonuc = evaluateCoupon(
    [indirim({ discount_type: "free_shipping" })],
    "YAZ10",
    1500,
    0,
  );
  assert.equal(sonuc.ok && sonuc.freeShipping, true);
});

test("kupona tabi toplam indirimli satırları atıyor", () => {
  const toplam = kuponaTabiToplam([
    { price: 100, quantity: 2 },
    { price: 80, oldPrice: 120, quantity: 1 },
    /* Eski sepetlerde alan yok: indirimsiz sayılıyor, çünkü
       bilinmeyeni "indirimli" saymak hak edilen indirimi
       vermemek olurdu. */
    { price: 50, quantity: 3 },
    /* oldPrice fiyattan düşükse indirim yok (veri hatası). */
    { price: 90, oldPrice: 70, quantity: 1 },
  ]);
  assert.equal(toplam, 200 + 150 + 90);
});
