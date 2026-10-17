import { test } from "node:test";
import assert from "node:assert/strict";
import { bloklar, metinVar, paragraflar, sssBloklari } from "@/lib/magaza-sayfasi";

/*
  Panelden gelen metin DÜZ METİN; biçim buradan çıkıyor. Kurallar
  ArvoARC'taki ikiziyle (src/lib/magaza-sayfasi.ts) aynı olmak
  zorunda: panelin önizlemesi ile müşterinin gördüğü sayfa
  ayrışmamalı.
*/

test("tek satır sonu paragraf açmıyor", () => {
  /* Panelde dar bir alana yazan kiracı cümlesini elle bölebilir;
     her satırı paragraf saymak metni kesik gösterirdi. */
  assert.deepEqual(paragraflar("bir cümlenin\nelle bölünmüş hâli"), [
    "bir cümlenin elle bölünmüş hâli",
  ]);
});

test("boş satır paragraf açıyor", () => {
  assert.deepEqual(paragraflar("birinci\n\nikinci"), ["birinci", "ikinci"]);
});

test("baştaki ve sondaki boşluklar paragraf üretmiyor", () => {
  assert.deepEqual(paragraflar("\n\n  tek  \n\n   \n\n"), ["tek"]);
});

test("windows satır sonları da bölüyor", () => {
  /* Panele Word'den yapıştıran kiracının metni \r\n taşıyor. */
  assert.deepEqual(paragraflar("birinci\r\n\r\nikinci"), ["birinci", "ikinci"]);
});

test("SSS blokları ilk satırı soru sayıyor", () => {
  assert.deepEqual(sssBloklari("Kargo kaç gün?\nİki iş günü.\n\nİade?\n14 gün."), [
    { soru: "Kargo kaç gün?", cevap: "İki iş günü." },
    { soru: "İade?", cevap: "14 gün." },
  ]);
});

test("cevabı olmayan blok atılıyor", () => {
  /* Yanıtsız bir soru göstermek, o soruyu hiç göstermemekten kötü. */
  assert.deepEqual(sssBloklari("Yalnız bir soru?\n\nKargo?\nİki gün."), [
    { soru: "Kargo?", cevap: "İki gün." },
  ]);
});

test("cevabın birden çok satırı tek metne iniyor", () => {
  assert.deepEqual(sssBloklari("Soru?\nilk satır\nikinci satır"), [
    { soru: "Soru?", cevap: "ilk satır ikinci satır" },
  ]);
});

test("boş gövde boş liste veriyor", () => {
  assert.deepEqual(paragraflar(""), []);
  assert.deepEqual(sssBloklari("   \n\n  "), []);
  assert.deepEqual(bloklar(""), []);
});

test("metinVar: başlığı ya da gövdesi olan satır sayılıyor", () => {
  assert.equal(metinVar(null), false);
  assert.equal(metinVar(undefined), false);
  assert.equal(metinVar({ baslik: "  ", govde: "\n" }), false);
  assert.equal(metinVar({ baslik: "Hakkımızda", govde: "" }), true);
  assert.equal(metinVar({ baslik: "", govde: "metin" }), true);
});
