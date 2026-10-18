import assert from "node:assert/strict";
import test from "node:test";
import {
  telefonBicimle,
  telefonGecerli,
  telefonRakamlari,
} from "@/lib/telefon";

/*
  Aynı numaranın dört ayrı dizge olarak kaydedilmesi gerçek bir
  kusurdu; bu testler biçimin tek olmasını sabitliyor.
*/
test("ülke kodu ve ayraçlar atılır", () => {
  for (const yazim of [
    "0532 123 45 67",
    "+90 532 123 4567",
    "0090 532 123 45 67",
    "532-123-45-67",
    "05321234567",
  ]) {
    assert.equal(telefonRakamlari(yazim), "05321234567", yazim);
  }
});

test("biçim tek: 05XX XXX XX XX", () => {
  assert.equal(telefonBicimle("+905321234567"), "0532 123 45 67");
  assert.equal(telefonBicimle("5321234567"), "0532 123 45 67");
});

test("yarım yazılan numara yazarken kırpılmıyor", () => {
  /* Müşteri yazarken alan her tuşta biçimleniyor; eksik numara
     geçerli sayılmasa da yazdığı rakamlar durmalı. */
  assert.equal(telefonBicimle("0532123"), "0532 123");
  assert.equal(telefonGecerli("0532123"), false);
});

test("boş telefon geçerli: alan zorunlu değil", () => {
  assert.equal(telefonGecerli(""), true);
  assert.equal(telefonGecerli("   "), true);
});

test("sabit hat ve eksik haneli numara reddedilir", () => {
  assert.equal(telefonGecerli("0212 123 45 67"), false);
  assert.equal(telefonGecerli("0532 123 45 6"), false);
  assert.equal(telefonGecerli("0532 123 45 678"), false);
});
