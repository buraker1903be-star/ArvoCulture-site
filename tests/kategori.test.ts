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
import {
  asciiSlug,
  kategoriAdresi,
  kategoriSayilariyla,
  urunSayisiYazisi,
} from "../src/lib/categories";

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

test("kategori adı kendi sayfasına çözülüyor", () => {
  /*
    Ürün sayfasındaki kırıntı "Kozmetik" yazıp /koleksiyon/tumu'ya
    gidiyordu: adıyla hedefi uyuşmayan bir basamak.
  */
  assert.equal(kategoriAdresi("Kozmetik"), "/koleksiyon/kozmetik");
  assert.equal(kategoriAdresi("Giyim"), "/koleksiyon/giyim");
  assert.equal(kategoriAdresi("Kişisel Bakım"), "/koleksiyon/bakim");
  assert.equal(kategoriAdresi("Parfüm"), "/koleksiyon/parfum");
});

test("tanınmayan kategori tüm katalogla karşılanıyor", () => {
  /* inferCategory ileride yeni bir kova eklerse kırık bağlantı
     değil, geniş bir liste çıkmalı. */
  assert.equal(kategoriAdresi("Oyuncak"), "/koleksiyon/tumu");
  assert.equal(kategoriAdresi(""), "/koleksiyon/tumu");
});

test("büyük küçük harf ve boşluk kategoriyi bozmuyor", () => {
  /* Türkçe küçük harf kuralı: "KOZMETİK" → "kozmetik". */
  assert.equal(kategoriAdresi("  KOZMETİK "), "/koleksiyon/kozmetik");
});

/*
 * KARTLARDAKİ ÜRÜN SAYISI.
 *
 * Sayı ArvoARC'tan geliyor ve eşleşme koleksiyon slug'ı üzerinden
 * kuruluyor. Eşleşmeyen ya da sıfır olan kategori SAYISIZ çizilmeli:
 * "0 ürün" yazan bir kart müşteriyi boş bir sayfaya çağırır.
 */
test("kategori sayıları slug üzerinden bağlanıyor", () => {
  const kartlar = kategoriSayilariyla(
    [
      { label: "Giyim", href: "/koleksiyon/giyim" },
      { label: "Parfüm", href: "/koleksiyon/parfum" },
    ],
    [
      { slug: "giyim", product_count: 3225 },
      { slug: "parfum", product_count: 43 },
      { slug: "baska", product_count: 9 },
    ],
  );
  assert.equal(kartlar[0].urunSayisi, 3225);
  assert.equal(kartlar[1].urunSayisi, 43);
});

test("eşleşmeyen ve sıfır sayılı kategori sayısız kalıyor", () => {
  const kartlar = kategoriSayilariyla(
    [
      { label: "Kozmetik", href: "/koleksiyon/kozmetik" },
      { label: "Bakım", href: "/koleksiyon/bakim" },
    ],
    [{ slug: "kozmetik", product_count: 0 }],
  );
  assert.equal(kartlar[0].urunSayisi, undefined);
  assert.equal(kartlar[1].urunSayisi, undefined);
});

test("sayı Türkçe binlik ayırıcıyla yazılıyor", () => {
  assert.equal(urunSayisiYazisi(3225), "3.225 ürün");
  assert.equal(urunSayisiYazisi(43), "43 ürün");
});
