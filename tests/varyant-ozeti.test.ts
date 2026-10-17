import assert from "node:assert/strict";
import test from "node:test";
import { varyantOzeti, type VaryantSatiri } from "@/lib/varyant-ozeti";

/*
  Kart, kategorisi "Giyim" olmayan her ürünü SKU'suz sepete
  atıyordu; altı tonlu ruj da öyle ve ArvoARC siparişi stokta olan
  herhangi bir tona bağlıyordu. Ölçüt artık varyant sayısı.
*/
const v = (over: Partial<VaryantSatiri>): VaryantSatiri => ({
  sku: "SKU", title: "", color: null, size: null, price: 100, ...over,
});

test("tek varyantlı ürün karttan eklenebiliyor ve SKU'su yazılıyor", () => {
  const ozet = varyantOzeti([v({ sku: "LR-1", price: 1899.9 })]);
  assert.equal(ozet.adet, 1);
  assert.equal(ozet.tek?.sku, "LR-1");
  /* Fiyat varyantın kendi fiyatı: kartta yazan tutar kataloğun
     EN DÜŞÜK fiyatı ve farklı olabilir. */
  assert.equal(ozet.tek?.price, 1899.9);
});

test("tek varyantta yer tutucu başlık etikete dönmüyor", () => {
  /* "Default Title" ürünün özelliği değil, tedarikçi verisinin
     varsayılanı; sepette "DEFAULT TİTLE" okunuyordu. */
  const ozet = varyantOzeti([v({ title: "Default Title" })]);
  assert.equal(ozet.tek?.label, undefined);
});

test("tek varyantta gerçek ton adı etikete giriyor", () => {
  const ozet = varyantOzeti([v({ color: "Pure Red" })]);
  assert.equal(ozet.tek?.label, "Pure Red");
});

test("birden çok tonlu ruj karttan eklenemiyor", () => {
  const ozet = varyantOzeti([
    v({ sku: "29020-1", color: "Rosy Nude" }),
    v({ sku: "29020-2", color: "Pure Red" }),
  ]);
  assert.equal(ozet.adet, 2);
  assert.equal(ozet.tek, null, "çok varyantlı üründe SKU seçilmemeli");
});

test("varyant listesi boşsa da kart kendiliğinden eklemiyor", () => {
  /* Boş liste okuma arızası demek (lib/variants.ts); slug'la
     sipariş geçmesin. */
  const ozet = varyantOzeti([]);
  assert.equal(ozet.adet, 0);
  assert.equal(ozet.tek, null);
});
