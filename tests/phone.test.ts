import assert from "node:assert/strict";
import test from "node:test";
import { formatPhone, isValidPhone, phoneDigits, formatInternationalPhone, isValidInternationalPhone } from "@/lib/phone";

test("farklı yazımlar tek şablona oturur", () => {
  for (const girdi of ["05324628098", "5324628098", "+905324628098", "90 532 462 80 98", "0 (532) 462-80-98"]) {
    assert.equal(formatPhone(girdi), "+90 (532) 462 80 98", girdi);
  }
});

test("yazarken kademeli biçimlenir", () => {
  assert.equal(formatPhone(""), "");
  assert.equal(formatPhone("5"), "+90 (5");
  assert.equal(formatPhone("532"), "+90 (532)");
  assert.equal(formatPhone("532462"), "+90 (532) 462");
});

test("10 haneden fazlası kırpılır", () => {
  assert.equal(phoneDigits("0532462809812345"), "5324628098");
});

test("yalnızca 5 ile başlayan 10 haneli cep numarası geçerli", () => {
  assert.equal(isValidPhone("+90 (532) 462 80 98"), true);
  assert.equal(isValidPhone("0212 555 44 33"), false, "sabit hat");
  assert.equal(isValidPhone("532 462"), false, "eksik");
});

/*
  YURTDIŞI NUMARASI.

  Türkiye biçimlendirmesi baştaki 90/0'ı atıp numarayı on haneye
  kesiyor: Almanya'dan "+49 171 1234567" yazan müşterinin numarası
  sessizce "+90 (171) 123 45" oluyor ve kargo firması o numaraya
  ulaşamıyordu.
*/
test("yurtdışı numarasında ülke kodu korunuyor", () => {
  assert.equal(formatInternationalPhone("+49 171 1234567"), "+491711234567");
  assert.equal(formatInternationalPhone("0049-171-1234567"), "+00491711234567");
  /* Yazmaya "+" ile başlayan müşteri boş alan görmesin. */
  assert.equal(formatInternationalPhone("+"), "+");
  assert.equal(formatInternationalPhone(""), "");
  /* E.164 en fazla 15 hane. */
  assert.equal(formatInternationalPhone("+1234567890123456789").length, 16);
});

test("yurtdışı numarası 7-15 hane arası geçerli", () => {
  assert.equal(isValidInternationalPhone("+49 171 1234567"), true);
  assert.equal(isValidInternationalPhone("+1 212 555 0123"), true);
  assert.equal(isValidInternationalPhone("12345"), false, "çok kısa");
  assert.equal(isValidInternationalPhone("+1234567890123456"), false, "çok uzun");
  /*
    Türkiye numarası da geçerli: yurtdışında yaşayan müşteri Türk
    numarası verebiliyor ve bunu reddetmek geçerli bir numarayı
    reddetmek olurdu.
  */
  assert.equal(isValidInternationalPhone("+905004443322"), true);
});
