import assert from "node:assert/strict";
import test from "node:test";
import { formatPhone, isValidPhone, phoneDigits } from "@/lib/phone";

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
