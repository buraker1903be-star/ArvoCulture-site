import { test } from "node:test";
import assert from "node:assert/strict";
import { telefonBicimi } from "@/lib/telefon";

/*
  Kayıttaki numara ham duruyor ("5074370507"); kayıttan okumaya
  geçince iletişim sayfası ve yapısal veri ülke kodu olmadan
  basıyordu.
*/

test("ham on hane ülke koduyla biçimleniyor", () => {
  assert.equal(telefonBicimi("5074370507"), "+90 507 437 05 07");
});

test("baştaki sıfır ve ülke kodu ayıklanıyor", () => {
  assert.equal(telefonBicimi("05074370507"), "+90 507 437 05 07");
  assert.equal(telefonBicimi("905074370507"), "+90 507 437 05 07");
  assert.equal(telefonBicimi("+90 507 437 05 07"), "+90 507 437 05 07");
  assert.equal(telefonBicimi("0507 437 05 07"), "+90 507 437 05 07");
});

test("tanınmayan biçim OLDUĞU GİBİ kalıyor", () => {
  /* Uydurma bir ülke kodu eklemek yanlış numara basmak olurdu. */
  assert.equal(telefonBicimi("+49 30 1234567"), "+49 30 1234567");
  assert.equal(telefonBicimi("0212 000 00 00"), "0212 000 00 00");
  assert.equal(telefonBicimi("dahili 14"), "dahili 14");
});

test("boş değer boş metin", () => {
  assert.equal(telefonBicimi(""), "");
  assert.equal(telefonBicimi(null), "");
  assert.equal(telefonBicimi(undefined), "");
  assert.equal(telefonBicimi("   "), "");
});
