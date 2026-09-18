import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_SALES_RULES,
  amountToFreeShipping,
  shippingFor,
  toKurus,
  toSalesRules,
  transferDiscountFor,
} from "@/lib/order-quote";
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

// --- Mağaza ayarları (ARC: get_arvoculture_storefront_settings) ---


test("ayarlar okunamazsa bugünkü sabitlere düşülür", () => {
  assert.deepEqual(toSalesRules(undefined), DEFAULT_SALES_RULES);
  assert.equal(DEFAULT_SALES_RULES.shippingFee, SHIPPING_FEE);
  assert.equal(DEFAULT_SALES_RULES.freeShippingOver, FREE_SHIPPING_OVER);
  assert.equal(DEFAULT_SALES_RULES.transferEnabled, true);
});

test("ARC'tan gelen kuruş değerleri TL'ye çevrilir", () => {
  const kurallar = toSalesRules({
    shipping_fee: 14900,
    free_shipping_threshold: 250000,
    bank_transfer_enabled: true,
    bank_transfer_discount_percent: "2.5", // numeric metin olarak gelebilir
  });
  assert.deepEqual(kurallar, { shippingFee: 149, freeShippingOver: 2500, transferEnabled: true, transferDiscountPercent: 2.5 });
});

test("havaleyi yalnızca açık bir false kapatır (ARC ile aynı)", () => {
  const satir = { shipping_fee: 12000, free_shipping_threshold: 200000, bank_transfer_discount_percent: 3 };
  assert.equal(toSalesRules({ ...satir, bank_transfer_enabled: false }).transferEnabled, false);
  assert.equal(toSalesRules({ ...satir, bank_transfer_enabled: null }).transferEnabled, true);
});

test("bozuk değerler varsayılana düşer", () => {
  const kurallar = toSalesRules({
    shipping_fee: null,
    free_shipping_threshold: "abc",
    bank_transfer_enabled: true,
    bank_transfer_discount_percent: 150,
  });
  assert.equal(kurallar.shippingFee, DEFAULT_SALES_RULES.shippingFee);
  assert.equal(kurallar.freeShippingOver, DEFAULT_SALES_RULES.freeShippingOver);
  assert.equal(kurallar.transferDiscountPercent, DEFAULT_SALES_RULES.transferDiscountPercent);
});

test("paneldeki tarife hesaba yansır", () => {
  // Mağaza sahibi eşiği 2.500 TL'ye, kargoyu 149 TL'ye çekti.
  const kurallar = { ...DEFAULT_SALES_RULES, shippingFee: 149, freeShippingOver: 2500 };
  assert.equal(shippingFor(2200, false, kurallar), 149, "eski eşiğin üstü ama yeni eşiğin altı");
  assert.equal(shippingFor(2500, false, kurallar), 0);
  assert.equal(amountToFreeShipping(2200, false, kurallar), 300);
  assert.equal(shippingFor(100, true, kurallar), 0, "kupon yine sıfırlar");
});

test("ücretsiz kargo eşiği 0 ise her sipariş kargosuz", () => {
  const kurallar = { ...DEFAULT_SALES_RULES, freeShippingOver: 0 };
  assert.equal(shippingFor(0.01, false, kurallar), 0);
});
