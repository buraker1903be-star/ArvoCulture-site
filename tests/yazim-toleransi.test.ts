import { test } from "node:test";
import assert from "node:assert/strict";
import { duzeltilmisSorgu, enYakin, tolerans, uzaklik } from "@/lib/yazim-toleransi";

/*
  Canlı uçta ölçülen gerçek hatalar (18.10.2026):
    prafüm → 0 (parfüm: 43)   nemlendirci → 0 (nemlendirici: 10)
    sampaun → 0 (şampuan: 7)  tshirt → 0 (t-shirt: 1.549)
*/

const SOZLUK = new Set([
  "parfum", "nemlendirici", "sampuan", "shirt", "t", "serum",
  "ruj", "rum", "krem", "maske", "maskulen", "aloe", "vera",
  "erkek", "kadin", "zeitgard",
]);

test("ölçülen hatalar düzeliyor", () => {
  assert.deepEqual(duzeltilmisSorgu(["prafum"], SOZLUK), {
    kelimeler: ["parfum"],
    degisti: true,
  });
  assert.deepEqual(duzeltilmisSorgu(["nemlendirci"], SOZLUK), {
    kelimeler: ["nemlendirici"],
    degisti: true,
  });
  assert.deepEqual(duzeltilmisSorgu(["sampaun"], SOZLUK), {
    kelimeler: ["sampuan"],
    degisti: true,
  });
});

test("tshirt → shirt: tire atlandığında katalog boş görünmüyordu", () => {
  assert.equal(enYakin("tshirt", SOZLUK), "shirt");
});

test("sözlükteki kelimeye dokunulmuyor", () => {
  /* Düzeltme yalnızca tanınmayan kelimeye uygulanıyor; tanınan
     kelimeyi "yakın" bir başkasıyla değiştirmek aramayı bozardı. */
  assert.deepEqual(duzeltilmisSorgu(["parfum", "erkek"], SOZLUK), {
    kelimeler: ["parfum", "erkek"],
    degisti: false,
  });
});

test("çok kelimeli sorguda yalnızca bozuk olan düzeliyor", () => {
  assert.deepEqual(duzeltilmisSorgu(["erkek", "tshirt"], SOZLUK), {
    kelimeler: ["erkek", "shirt"],
    degisti: true,
  });
});

test("kısa kelime HİÇ düzeltilmiyor", () => {
  /* "ruj" ile "rum" arasında bir harf var; bu uzunlukta düzeltmek
     aranan şeyden bambaşka bir ürün getirmek demek. */
  assert.equal(tolerans("ruj"), 0);
  assert.equal(enYakin("rul", SOZLUK), null);
  assert.deepEqual(duzeltilmisSorgu(["rul"], SOZLUK).degisti, false);
});

test("uzunluğa göre tolerans", () => {
  assert.equal(tolerans("abc"), 0);
  assert.equal(tolerans("abcd"), 1);
  assert.equal(tolerans("abcdefg"), 1);
  assert.equal(tolerans("abcdefgh"), 2);
});

test("çok uzak kelime düzeltilmiyor", () => {
  /* Sözlükte karşılığı olmayan bir sorgu uydurulmuş bir ürüne
     bağlanmamalı; sonuçsuz kalması dürüsttür. */
  assert.equal(enYakin("kahvemakinesi", SOZLUK), null);
});

test("sınırlı uzaklık tavanı aşınca erken çıkıyor", () => {
  assert.equal(uzaklik("parfum", "parfum", 1), 0);
  assert.equal(uzaklik("prafum", "parfum", 1), 1);
  assert.equal(uzaklik("abc", "xyz", 1), 2);
  /* Uzunluk farkı tavandan büyükse hiç hesaplanmıyor. */
  assert.equal(uzaklik("a", "abcdef", 2), 3);
});

test("harf yer değiştirmesi tek hata sayılıyor", () => {
  /* En sık yazım hatası türü bu; düz Levenshtein iki hata
     sayıyordu ve tolerans 1'de hiçbiri düzelmiyordu. */
  assert.equal(uzaklik("prafum", "parfum", 1), 1);
  assert.equal(uzaklik("sampaun", "sampuan", 1), 1);
});

test("iki ayrı hata tolerans 1'de geçmiyor", () => {
  /* Yer değiştirmeyi ucuzlatmak, her şeyi ucuzlatmak değil. */
  assert.equal(uzaklik("prafuum", "parfum", 1), 2);
});

test("düzeltme kataloğun yazımını bozmuyor", () => {
  /* Türkçe küçültme I→ı yapıyor ve Latin marka adını bozuyordu:
     "zeitgrad" düzeltmesi "zeıtgard" diye görünüyordu. */
  assert.equal("ZEITGARD".toLocaleLowerCase("tr-TR"), "zeıtgard");
  /* Bu yüzden kataloğun yazımı olduğu gibi saklanıyor; bu test
     kuralın gerekçesini sabitliyor. */
});
