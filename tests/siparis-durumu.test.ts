import assert from "node:assert/strict";
import { test } from "node:test";
import { anahtarGecerli, indirimTutari } from "@/lib/siparis-durumu";

/*
  İLK GERÇEK SİPARİŞTE RAKAMLAR TUTMUYORDU: 470,90 + 120,00 = 590,90
  ama toplam 576,77. Aradaki 14,13 havale indirimiydi (mal bedelinin
  %3'ü, kargoya uygulanmıyor) ve sayfa onu hiç göstermiyordu.
*/
test("havale indirimi farktan bulunuyor", () => {
  const indirim = indirimTutari({ ara_toplam: 47090, kargo: 12000, vergi: 0, toplam: 57677 });
  assert.equal(indirim, 1413);
  /* Satırlar artık toplanıyor. */
  assert.equal(47090 + 12000 - 1413, 57677);
});

test("indirimsiz siparişte satır çıkmıyor", () => {
  assert.equal(indirimTutari({ ara_toplam: 47090, kargo: 12000, vergi: 0, toplam: 59090 }), 0);
});

test("vergi de hesaba giriyor", () => {
  assert.equal(indirimTutari({ ara_toplam: 10000, kargo: 0, vergi: 2000, toplam: 11000 }), 1000);
});

test("eksi fark indirim sayılmıyor", () => {
  /* Uydurma bir "indirim" yazmaktansa satırı hiç yazmamak doğru. */
  assert.equal(indirimTutari({ ara_toplam: 10000, kargo: 0, vergi: 0, toplam: 12000 }), 0);
});

test("anahtar biçimi sunucuda da denetleniyor", () => {
  assert.equal(anahtarGecerli("063396f0cc1b4a971e13315aac29c323"), true);
  assert.equal(anahtarGecerli("abc"), false);
  /* Büyük harf üretmiyoruz; kabul de etmiyoruz. */
  assert.equal(anahtarGecerli("063396F0CC1B4A971E13315AAC29C323"), false);
  assert.equal(anahtarGecerli(""), false);
});
