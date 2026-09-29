/*
 * ARAMA EŞLEŞMESİ.
 *
 * 30.09.2026'da canlı uçta ölçüldüğünde çoğul ve ekli yazımlar hiç
 * sonuç vermiyordu: "dudak kalemi" 1 sonuç, "dudak kalemleri" 0;
 * "ruj" 1, "rujlar" 0; "şampuan" 7, "şampuanlar" 0. Eşleşme yalnızca
 * tek yöne bakıyordu (dizindeki kelime sorguyla başlıyor mu) ve
 * müşteri çoğul yazdığı için kataloğu boş sanıyordu.
 *
 * Testlerin yarısı EKLEMENİN BEDELİNİ ölçüyor: ek soyma yanlış
 * eşleşme üretmemeli. "şort" hâlâ tişört getirmemeli.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  aramaSonuclari,
  govdeler,
  normalize,
  searchProducts,
  toWords,
} from "@/lib/search";
import type { SearchItem } from "@/lib/search-index";

const urun = (name: string, extra: Partial<SearchItem> = {}): SearchItem => ({
  slug: normalize(name).replace(/\s+/g, "-"),
  name,
  brand: "LR HEALTH & BEAUTY",
  category: "",
  price: 100,
  ...extra,
});

const KATALOG: SearchItem[] = [
  urun("LR ZEITGARD Signature Yumuşak Dudak Kalemi"),
  urun("LR Colours Işıltılı Ruj"),
  urun("LR ALOE VIA Aloe Vera Şampuan"),
  urun("LR ALOE VIA Aloe Vera El Kremi"),
  urun("LR ALOE VIA Anti-Aging Güneş Koruyucu SPF 50"),
  urun("LR Tişört Beyaz"),
  urun("LR Deniz Şortu"),
  urun("LR Cilt Bakım Seti", { category: "Cilt Bakımı" }),
];

const adlar = (q: string) => searchProducts(KATALOG, q).map((i) => i.name);

test("çoğul yazım tekil ürünü buluyor", () => {
  assert.deepEqual(adlar("dudak kalemleri"), adlar("dudak kalemi"));
  assert.equal(adlar("rujlar").length, 1);
  assert.equal(adlar("şampuanlar").length, 1);
});

test("iyelik ve hâl ekleri sonucu düşürmüyor", () => {
  /* Katalogda "Aloe Vera" geçen iki ürün var; üçüncüsünde yalnızca
     "ALOE" geçiyor ve iki kelimenin ikisi de aranıyor. */
  assert.equal(adlar("aloe verası").length, 2);
  assert.equal(adlar("cilt bakımı").length, 1);
  assert.equal(adlar("el kremleri").length, 1);
});

test("şort hâlâ tişört getirmiyor", () => {
  /* Ek soyma bu eski hatayı geri getirmemeli: normalleştirilmiş
     "tisort" metni "sort" dizisini içeriyor. */
  assert.deepEqual(adlar("şort"), ["LR Deniz Şortu"]);
  assert.deepEqual(adlar("şortu"), ["LR Deniz Şortu"]);
});

test("kısa gövdeye inen ek soyulmuyor", () => {
  /* "eli" → "el" iki harf; soyulsaydı "el" hemen her ürüne uyardı. */
  assert.deepEqual(govdeler("eli"), ["eli"]);
  assert.deepEqual(govdeler("kalemleri"), ["kalemleri", "kalem"]);
  assert.deepEqual(govdeler("ruj"), ["ruj"]);
});

test("yazarken arama bozulmuyor", () => {
  /* Harf harf yazarken her adımda sonuç gelmeli; ek soyma bunu
     kesintiye uğratmamalı. */
  for (const parca of ["z", "ze", "zei", "zeit", "zeitg"]) {
    assert.equal(adlar(parca).length, 1, parca);
  }
});

test("çok kelimeli sorguda her kelime aranıyor", () => {
  /* "güneş" ve "koruyucu" ikisi de geçmeli; tek kelime yetmemeli. */
  assert.equal(adlar("güneş koruyucu").length, 1);
  assert.equal(adlar("güneş şampuan").length, 0);
});

test("normalleştirme Türkçe karakterleri karşılıyor", () => {
  assert.equal(normalize("ŞAMPUAN"), "sampuan");
  assert.deepEqual(toWords("Aloe Vera - Şampuan"), ["aloe", "vera", "sampuan"]);
});

test("tam eşleşme yoksa yakın sonuçlar dönüyor", () => {
  /*
    Canlıda "kadın parfümü" 0 sonuç veriyordu: katalogda "kadın"
    kelimesi geçmiyor diye 43 parfümün hepsi eleniyordu. Müşteriye boş
    sayfa göstermek, elimizde olanı göstermemekten daha kötü.
  */
  const { sonuclar, yaklasik } = aramaSonuclari(KATALOG, "kadın ruj");
  assert.equal(yaklasik, true);
  assert.equal(sonuclar[0]?.name, "LR Colours Işıltılı Ruj");
});

test("tam eşleşme varsa yakın sonuca düşülmüyor", () => {
  const { sonuclar, yaklasik } = aramaSonuclari(KATALOG, "dudak kalemleri");
  assert.equal(yaklasik, false);
  assert.equal(sonuclar.length, 1);
});

test("tek kelimelik sorguda yakın sonuç yok", () => {
  /* "yakın" ancak birden çok kelimede anlamlı: tek kelime ya tutar
     ya tutmaz, tutmayanı zorlamak alakasız liste üretir. */
  const { sonuclar, yaklasik } = aramaSonuclari(KATALOG, "bisiklet");
  assert.deepEqual(sonuclar, []);
  assert.equal(yaklasik, false);
});

test("yakın sonuçta çok kelimesi tutan önce geliyor", () => {
  /*
    "kadın aloe şampuan": hiçbir ürün üçünü birden karşılamıyor, yani
    yakın sonuca düşülüyor. İki kelimesi tutan ürün, yalnızca "aloe"
    geçenlerin üstünde durmalı — yoksa yakın sonuç listesi rastgele
    bir Aloe listesine dönerdi.
  */
  const { sonuclar, yaklasik } = aramaSonuclari(KATALOG, "kadın aloe şampuan");
  assert.equal(yaklasik, true);
  assert.equal(sonuclar[0]?.name, "LR ALOE VIA Aloe Vera Şampuan");
  assert.ok(sonuclar.length > 1, "yalnızca aloe geçenler de listede");
});
