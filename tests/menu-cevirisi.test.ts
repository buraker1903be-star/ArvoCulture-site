/*
  MENÜ ETİKETLERİ.

  CANLIDA GÖRÜLDÜ (23.10.2026): menü açıldığında yapraklar
  İngilizce, üstlerindeki iki katman Türkçeydi —

    Erkek                          ← ana başlık
      ÜST GİYİM                    ← sütun başlığı
        Men's T-Shirt              ← yaprak (title_en)

  Üç katman üç AYRI yerden geliyor ve yalnızca üçüncüsü çeviriliydi.
*/
import test from "node:test";
import assert from "node:assert/strict";
import {
  menuEtiketiCevir,
  menuBasligiBuyut,
  cinsiyetOnekiniAt,
} from "@/lib/menu-cevirisi";

const KOLEKSIYONLAR = [
  { title: "Erkek", title_en: "Men's" },
  { title: "Kadın", title_en: "Women's" },
  { title: "Aksesuar", title_en: "Accessories" },
  { title: "Kürk", title_en: null },
];

test("ÖNCE KOLEKSİYONA BAKIYOR, sonra sözlüğe", () => {
  /* "Erkek"in karşılığı zaten koleksiyon kaydında; aynı şeyi iki
     yerde tutmak, birinin değişip diğerinin kalması demek. */
  assert.equal(menuEtiketiCevir("Erkek", "en", KOLEKSIYONLAR), "Men's");
  assert.equal(menuEtiketiCevir("ÜST GİYİM", "en", KOLEKSIYONLAR), "Tops");
});

test("karşılığı olmayan etiket OLDUĞU GİBİ kalıyor", () => {
  /* Eksik bir çeviri, menüyü boş bırakmaktan iyidir; ikinci bir
     kiracının kendi grup adı Türkçe görünür ama menü çalışır. */
  assert.equal(menuEtiketiCevir("Bilinmeyen Grup", "en", KOLEKSIYONLAR), "Bilinmeyen Grup");
  /* title_en'i boş koleksiyon da sözlüğe düşüyor, null dönmüyor. */
  assert.equal(menuEtiketiCevir("Kürk", "en", KOLEKSIYONLAR), "Kürk");
});

test("Türkçede hiçbir şey değişmiyor", () => {
  assert.equal(menuEtiketiCevir("ÜST GİYİM", "tr", KOLEKSIYONLAR), "ÜST GİYİM");
  assert.equal(menuEtiketiCevir("Erkek", "tr", KOLEKSIYONLAR), "Erkek");
});

test("BÜYÜK HARF DİLE GÖRE", () => {
  /*
    Türkçe yerelde "i" → "İ" oluyor ve İngilizce başlık
    "INTERNATİONAL" diye yazılıyordu (18.10.2026'da canlıda
    görüldü). Sütun başlıkları CSS ile değil kodda büyütülüyor.
  */
  assert.equal(menuBasligiBuyut("Underwear", "en"), "UNDERWEAR");
  assert.doesNotMatch(menuBasligiBuyut("Clothing", "en"), /İ/);
  assert.equal(menuBasligiBuyut("İç Giyim", "tr"), "İÇ GİYİM");
});

test("CİNSİYET ÖNEKİ İNGİLİZCEDE DE ATILIYOR", () => {
  /*
    Sütun başlığı zaten cinsiyeti söylüyor. Türkçede önek atılıyordu
    ama İngilizce yaprak `title_en`'den geldiği için öneki de
    İngilizce: Türkçe desen onu bulamıyor ve menüde "Men's T-Shirt /
    Men's Sweatshirt / Men's Jumper" diye tekrar ediyordu.
  */
  assert.equal(cinsiyetOnekiniAt("Men's T-Shirt", "Erkek", "en"), "T-Shirt");
  assert.equal(cinsiyetOnekiniAt("Women's Blouse", "Kadın", "en"), "Blouse");
  assert.equal(cinsiyetOnekiniAt("Kids' Pajama Set", "Çocuk", "en"), "Pajama Set");
  assert.equal(cinsiyetOnekiniAt("Erkek Gömlek", "Erkek", "tr"), "Gömlek");
});

test("önek atılınca başlık BOŞ KALMIYOR", () => {
  /* "Men's" tek başına bir koleksiyon adı; atılırsa menüde boş bir
     bağlantı kalırdı. */
  assert.equal(cinsiyetOnekiniAt("Men's", "Erkek", "en"), "Men's");
});
