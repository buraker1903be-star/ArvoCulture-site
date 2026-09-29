import assert from "node:assert/strict";
import test from "node:test";
import { bedenSecenekleri, renkSecenekleri, varyantBul } from "@/lib/variant-select";
import { renkAdi } from "@/lib/product-types";
import type { Variant } from "@/lib/variants";

/*
  Vitrin tekstil için yazılmıştı ve yalnızca bedeni biliyordu;
  kozmetikteki renk varyantları ürün sayfasında hiç görünmüyordu.
  Yanlış varyant seçmek yanlış ürün göndermek demek, o yüzden
  "en yakınını seç" davranışı bilerek yok.
*/
const v = (over: Partial<Variant>): Variant => ({
  sku: "SKU", title: "", color: null, size: null,
  price: 100, compare_at_price: null, stock: 5, available: true, ...over,
});

const kozmetik = [
  v({ sku: "29020-1", color: "Rosy Nude" }),
  v({ sku: "29020-2", color: "Pure Red" }),
  v({ sku: "29020-3", color: "Berry" }),
];
const tekstil = [
  v({ sku: "T-S", size: "S" }),
  v({ sku: "T-M", size: "M" }),
];
const ikisi = [
  v({ sku: "K-SIYAH-S", color: "Siyah", size: "S" }),
  v({ sku: "K-SIYAH-M", color: "Siyah", size: "M" }),
  v({ sku: "K-BEYAZ-S", color: "Beyaz", size: "S" }),
];

test("renkler sırayla ve yinelenmeden çıkıyor", () => {
  assert.deepEqual(renkSecenekleri(kozmetik), ["Rosy Nude", "Pure Red", "Berry"]);
  assert.deepEqual(renkSecenekleri(ikisi), ["Siyah", "Beyaz"]);
  assert.deepEqual(renkSecenekleri(tekstil), []);
});

test("beden listesi seçilen renge göre daralıyor", () => {
  assert.deepEqual(bedenSecenekleri(ikisi, "Siyah").map((x) => x.size), ["S", "M"]);
  assert.deepEqual(bedenSecenekleri(ikisi, "Beyaz").map((x) => x.size), ["S"]);
  /* Renk yoksa bütün bedenler: tekstilde renk zaten yok. */
  assert.deepEqual(bedenSecenekleri(tekstil, null).map((x) => x.size), ["S", "M"]);
});

test("kozmetikte renk seçimi tek varyanta iniyor", () => {
  assert.equal(varyantBul(kozmetik, "Pure Red", null)?.sku, "29020-2");
  /* Renk seçilmediyse seçim tamamlanmamıştır. */
  assert.equal(varyantBul(kozmetik, null, null), null);
});

test("renk ve beden birlikte gerekiyorsa ikisi de aranıyor", () => {
  assert.equal(varyantBul(ikisi, "Siyah", "M")?.sku, "K-SIYAH-M");
  /* Yalnızca renk seçilmiş: iki beden kalıyor, kendiliğinden seçilmiyor. */
  assert.equal(varyantBul(ikisi, "Siyah", null), null);
  /* Olmayan bileşim: "en yakını" seçilmiyor. */
  assert.equal(varyantBul(ikisi, "Beyaz", "M"), null);
});

test("tek varyantlı üründe seçim istenmiyor", () => {
  const tek = [v({ sku: "TEK" })];
  assert.equal(varyantBul(tek, null, null)?.sku, "TEK");
});

test("slug görünümlü ton adı okunabilir yazılıyor", () => {
  /* Tedarikçi verisinde aynı üründe iki yazım dolaşıyor: dudak
     kaleminde "rosy-nude", mat rujda "pure-red" (30.09.2026). */
  assert.equal(renkAdi("rosy-nude"), "Rosy Nude");
  assert.equal(renkAdi("pure-red"), "Pure Red");
});

test("elle yazılmış ton adına dokunulmuyor", () => {
  /* Gerçek adı biçimlendirmeye kalkmak kazandırdığından çok bozardı. */
  assert.equal(renkAdi("Berry Rose"), "Berry Rose");
  assert.equal(renkAdi("Siyah/Beyaz Çizgili"), "Siyah/Beyaz Çizgili");
  assert.equal(renkAdi("Deep Brown"), "Deep Brown");
  /* Büyük harf içeren tireli ad zaten elle yazılmış sayılıyor. */
  assert.equal(renkAdi("Rose-Gold"), "Rose-Gold");
});
