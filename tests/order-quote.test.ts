import assert from "node:assert/strict";
import test from "node:test";
import { amountToFreeShipping, shippingFor, toKurus, transferDiscountFor } from "@/lib/order-quote";
import { FREE_SHIPPING_OVER, SHIPPING_FEE } from "@/lib/shipping";

// Bu testler ARC'ın sipariş hesabını (supabase/migrations/20260917150000_
// free_shipping_coupon.sql ve src/app/api/storefront/odeme/route.ts) aynalar.
// Vitrin bir tutar, ARC başka bir tutar gösterirse müşteri yanıltılır.

test("eşiğin altında kargo alınır, eşikte ve üstünde alınmaz", () => {
  assert.equal(shippingFor(FREE_SHIPPING_OVER - 0.01), SHIPPING_FEE);
  assert.equal(shippingFor(FREE_SHIPPING_OVER), 0);
  assert.equal(shippingFor(FREE_SHIPPING_OVER + 500), 0);
  assert.equal(shippingFor(0), SHIPPING_FEE);
});

test("kupon kullanmak ücretsiz kargoyu kaybettirmez", () => {
  // Gerileme (ARC d05a033): eşik indirim SONRASI tutarla karşılaştırılıyordu.
  // 2.000 TL'lik sepette %10 kupon giren müşteri 120 TL kargo ödüyordu.
  // Eşik indirim ÖNCESİ ara toplamla karşılaştırılır; çağıran taraf
  // shippingFor'a indirim öncesi toplamı verir.
  const araToplam = 2000;
  const kupon = 200; // %10
  assert.equal(shippingFor(araToplam), 0);
  assert.notEqual(shippingFor(araToplam - kupon), 0, "indirim sonrası tutarla bakılsaydı kargo çıkardı");
});

test("ücretsiz kargo kuponu kargoyu sıfırlar", () => {
  // Gerileme (ARC d05a033): kupon "Kod uygulandı" diyor, kargo yine alınıyordu.
  assert.equal(shippingFor(100, true), 0);
  assert.equal(amountToFreeShipping(100, true), 0);
});

test("ücretsiz kargoya kalan tutar", () => {
  assert.equal(amountToFreeShipping(1500), FREE_SHIPPING_OVER - 1500);
  assert.equal(amountToFreeShipping(FREE_SHIPPING_OVER), 0);
  assert.equal(amountToFreeShipping(FREE_SHIPPING_OVER + 1), 0);
});

test("kayan nokta sınırda sonucu değiştirmez", () => {
  // 0.1 + 0.2 türü toplamlar: 1999.99 + 0.01 tam eşik.
  const toplam = 1999.99 + 0.01;
  assert.equal(shippingFor(toplam), 0);
  assert.equal(amountToFreeShipping(1999.99), 0.01);
});

test("havale indirimi kargoya uygulanmaz", () => {
  // Gerileme (ARC f74cb99): taban order.total idi, 120 TL kargonun da %3'ü
  // müşteriye hediye ediliyordu. Taban yalnızca mal bedeli.
  const mal = 1000;
  assert.equal(transferDiscountFor(mal, 3), 30);
  assert.notEqual(transferDiscountFor(mal + SHIPPING_FEE, 3), transferDiscountFor(mal, 3));
});

test("havale indirimi kuruşta yuvarlanır, tam liraya değil", () => {
  // Ödeme formu önceden Math.round(TL * 3 / 100) ile tam liraya yuvarlıyordu:
  // 1.617,90 TL → 49 TL. ARC kuruşta yuvarlar: 48,54 TL.
  assert.equal(transferDiscountFor(1617.9, 3), 48.54);
  assert.equal(transferDiscountFor(99.99, 3), 3);
  assert.equal(transferDiscountFor(0, 3), 0);
});

test("ARC'ın havale formülü ile birebir", () => {
  // ARC: discount = Math.round((goodsAfterCoupon * percent) / 100), kuruş.
  for (const mal of [1, 33.33, 150, 1617.9, 2000, 12345.67]) {
    for (const yuzde of [0, 3, 5, 7.5]) {
      const arc = Math.round((toKurus(mal) * yuzde) / 100) / 100;
      assert.equal(transferDiscountFor(mal, yuzde), arc, `${mal} TL %${yuzde}`);
    }
  }
});

test("TL → kuruş dönüşümü tamsayı verir", () => {
  assert.equal(toKurus(1617.9), 161790);
  assert.equal(toKurus(0.1 + 0.2), 30);
  assert.equal(toKurus(19.99), 1999);
});
