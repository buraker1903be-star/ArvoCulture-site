import assert from "node:assert/strict";
import test from "node:test";
import { evaluateCoupon } from "@/lib/coupon";
import type { StorefrontDiscount } from "@/lib/discounts";

// Tutarlar ARC'ta kuruş: value (sabit indirimde) ve minimum_subtotal kuruş,
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
  const sonuc = evaluateCoupon([indirim({})], "YAZ10", 1500);
  assert.deepEqual(sonuc, { ok: true, amount: 150, freeShipping: false, label: "%10 indirim" });
});

test("kod büyük/küçük harf ve boşluk duyarsız", () => {
  assert.equal(evaluateCoupon([indirim({})], "  yaz10 ", 100).ok, true);
});

test("yüzde indirim ARC gibi kuruşta yuvarlanır", () => {
  // 33,33 TL'nin %10'u = 333,3 kuruş → 333 kuruş = 3,33 TL
  const sonuc = evaluateCoupon([indirim({})], "YAZ10", 33.33);
  assert.equal(sonuc.ok && sonuc.amount, 3.33);
});

test("sabit indirim kuruştan TL'ye çevrilir ve ara toplamı aşamaz", () => {
  const sabit = indirim({ code: "100TL", discount_type: "fixed_amount", value: 10000 });
  assert.equal((evaluateCoupon([sabit], "100TL", 1500) as { amount: number }).amount, 100);
  assert.equal((evaluateCoupon([sabit], "100TL", 60) as { amount: number }).amount, 60);
});

test("alt limit kuruş cinsinden karşılaştırılır", () => {
  const limitli = indirim({ minimum_subtotal: 50000 }); // 500 TL
  assert.equal(evaluateCoupon([limitli], "YAZ10", 499.99).ok, false);
  assert.equal(evaluateCoupon([limitli], "YAZ10", 500).ok, true);
  assert.equal(evaluateCoupon([limitli], "YAZ10", 2500).ok, true, "2.500 TL'lik sepet reddedilmemeli");
});

test("reddedilen kodun mesajı limiti TL gösterir", () => {
  const sonuc = evaluateCoupon([indirim({ minimum_subtotal: 50000 })], "YAZ10", 100);
  assert.equal(sonuc.ok, false);
  assert.match(!sonuc.ok ? sonuc.reason : "", /500,00/);
});

test("ücretsiz kargo kuponu tutar düşmez, kargo bayrağını açar", () => {
  const kargo = indirim({ code: "KARGO", discount_type: "free_shipping", value: 0 });
  assert.deepEqual(evaluateCoupon([kargo], "KARGO", 300), {
    ok: true, amount: 0, freeShipping: true, label: "Kargo ücretsiz",
  });
});

test("geçersiz ve boş kod", () => {
  assert.equal(evaluateCoupon([indirim({})], "YOK", 100).ok, false);
  assert.equal(evaluateCoupon([indirim({})], "   ", 100).ok, false);
  assert.equal(evaluateCoupon([indirim({ code: null })], "YAZ10", 100).ok, false);
});
