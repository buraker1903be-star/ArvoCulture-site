/*
 * ÜRÜN KATEGORİSİ ÇIKARIMI.
 *
 * Kategori ürün adından ve türünden çıkarılıyor; sıra önemli, çünkü
 * bir ad birden çok kalıba uyabiliyor.
 *
 * 30.09.2026: takviye edici gıda satışı durduruldu ve "Takviyeler"
 * kovası kaldırıldı. Öncesinde iki ayrı sorun vardı: "LR ZEITGARD
 * Vitamin C Serum" adındaki "vitamin" yüzünden bir cilt bakım ürünü
 * takviye sayılıyordu; kova kaldırılınca da aynı ürün bu kez
 * "Kişisel Bakım"a düşecekti. Bu testler ikisini birden tutuyor.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { inferCategory } from "../src/lib/product-types";

const kategori = (name: string, product_type = "") =>
  inferCategory({ name, product_type });

test("takviye kovası yok: hiçbir ad 'Takviyeler' döndürmez", () => {
  const eskiTakviyeAdlari = [
    "LR LIFETAKT Omega",
    "LR LIFETAKT Vita Daily Vitamin Drink",
    "Magnezyum Kapsül",
    "Kolajen Drinking Gel",
    "Omega 3 Takviyesi",
  ];
  for (const ad of eskiTakviyeAdlari) {
    assert.notEqual(kategori(ad), "Takviyeler", ad);
  }
});

test("vitamin geçen cilt bakım ürünü kozmetiktir", () => {
  assert.equal(kategori("LR ZEITGARD Vitamin C Serum"), "Kozmetik");
  assert.equal(kategori("Aydınlatıcı C Vitamini Serumu"), "Kozmetik");
});

test("giyim, öteki kalıplardan önce gelir", () => {
  assert.equal(kategori("Omega Baskılı Oversize Tişört"), "Giyim");
});

test("parfüm ve makyaj kendi kovalarında", () => {
  assert.equal(kategori("Eau de Parfum 50 ml"), "Parfüm");
  assert.equal(kategori("Mat Bitişli Ruj"), "Kozmetik");
});

test("eşleşmeyen ürün kişisel bakıma düşer", () => {
  assert.equal(kategori("Saç Fırçası"), "Kişisel Bakım");
});

test("ürün türü de ada ekleniyor", () => {
  assert.equal(kategori("Ace Vintage Beyaz", "Tişört"), "Giyim");
});
