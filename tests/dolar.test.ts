import assert from "node:assert/strict";
import test from "node:test";
import { dolara, dolarYazisi } from "@/lib/dolar";

/*
  Kural ArvoARC'ta lib/dolar-fiyati.ts içinde ve AYNI olmak
  zorunda; ikisi ayrılırsa müşteri ödemede başka tutar görür.
  Buradaki sayılar oradaki testle birebir aynı senaryolar.
*/
test("kur ve kâr payı birlikte uygulanıyor", () => {
  /* 400 TL ÷ 40 = 10 USD; %10 kâr payıyla 11 USD. */
  assert.equal(dolara(400, 40, 10), 11);
});

test("yukarı yuvarlanıyor: aşağı yuvarlamak her üründe zarar", () => {
  assert.equal(dolara(100, 40, 10), 2.75);
  /* 101 ÷ 40 × 1,10 = 2,7775 → 2,78 (yukarı). */
  assert.equal(dolara(101, 40, 10), 2.78);
});

test("kâr payı sıfırken yalnızca kur uygulanıyor", () => {
  assert.equal(dolara(400, 40, 0), 10);
});

test("kur yoksa fiyat YOK: uydurma kurla fiyat gösterilmiyor", () => {
  assert.equal(dolara(400, null, 10), null);
  assert.equal(dolara(400, 0, 10), null);
  assert.equal(dolara(400, -5, 10), null);
  assert.equal(dolara(400, Number.NaN, 10), null);
});

test("dolar yazımı İngilizce biçimde", () => {
  assert.equal(dolarYazisi(1234.56), "$1,234.56");
  assert.equal(dolarYazisi(11), "$11.00");
});
