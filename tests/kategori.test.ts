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
import { asciiSlug } from "../src/lib/categories";

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

/*
 * ANA SAYFA KATEGORİ LİSTESİ.
 *
 * Kart, href'in son parçasıyla aynı adlı görseli basıyor
 * (public/kategori/<anahtar>.jpg). Dosya yoksa ana sayfada kırık
 * görsel çıkıyor ve hiçbir şey uyarmıyor — 30.09.2026'da Takviyeler
 * kaldırılırken görseli de silindi; tersi (kategori eklenip görselin
 * unutulması) aynı sessizlikle olurdu.
 */
import { existsSync } from "node:fs";
import { CATEGORIES, categoryKey } from "../src/lib/categories";

test("her kategorinin görseli var", () => {
  for (const item of CATEGORIES) {
    const anahtar = categoryKey(item.href);
    assert.ok(anahtar, `${item.label}: href'ten anahtar çıkmadı`);
    assert.ok(
      existsSync(new URL(`../public/kategori/${anahtar}.jpg`, import.meta.url)),
      `${item.label}: public/kategori/${anahtar}.jpg yok`,
    );
  }
});

test("kategori adresleri koleksiyon rotasında ve benzersiz", () => {
  const adresler = CATEGORIES.map((c) => c.href);
  assert.equal(new Set(adresler).size, adresler.length, "yinelenen kategori adresi");
  for (const item of CATEGORIES) {
    assert.match(item.href, /^\/koleksiyon\/[a-z0-9-]+$/, item.href);
    assert.ok(item.label.trim(), "kategori adı boş");
  }
});

test("kaldırılan takviye kategorisi listede yok", () => {
  assert.equal(
    CATEGORIES.some((c) => /takviye/i.test(c.href) || /takviye/i.test(c.label)),
    false,
  );
});

test("Türkçe ad ASCII slug'a indirgeniyor", () => {
  /*
    Menüdeki cinsiyet bağlantısı addan türetiliyordu ve yalnızca
    "Kadın" elle özel durum olarak yazılmıştı. "Çocuk" küçük harfe
    çevrilince "çocuk" kalıyor, ArvoARC'taki slug ise "cocuk":
    menüdeki Çocuk sekmesi 24 ürünlük koleksiyon yerine boş bir
    sayfaya gidiyordu (30.09.2026'da canlıda ölçüldü).
  */
  assert.equal(asciiSlug("Çocuk"), "cocuk");
  assert.equal(asciiSlug("Kadın"), "kadin");
  assert.equal(asciiSlug("Erkek"), "erkek");
  assert.equal(asciiSlug("Aksesuar"), "aksesuar");
  assert.equal(asciiSlug("İç Giyim"), "ic giyim");
  assert.equal(asciiSlug("Güneş Gözlüğü"), "gunes gozlugu");
});
