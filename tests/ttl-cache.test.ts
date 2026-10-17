import assert from "node:assert/strict";
import { test } from "node:test";
import { ttlCache } from "@/lib/ttl-cache";

test("önbellek mağaza başına: anahtar karışmıyor", async () => {
  /*
    ÇOK MAĞAZALI KİPTE KRİTİK. İlk sürüm tek değer saklıyordu ve
    vitrin tek mağazalıyken doğruydu. Aynı süreç iki mağazaya hizmet
    ettiğinde anahtarsız önbellek, A'nın satış kurallarını (kargo
    ücreti, havale indirimi) B'nin müşterisine gösterirdi — hata
    vermeyen, yanlış fiyat gösteren bir sızıntı.
  */
  const gorulen: string[] = [];
  const yukle = ttlCache(async (konak: string) => {
    gorulen.push(konak);
    return [`${konak} verisi`];
  }, 60_000);

  assert.deepEqual(await yukle("a.com"), ["a.com verisi"]);
  assert.deepEqual(await yukle("b.com"), ["b.com verisi"]);
  /* İkinci çağrılar önbellekten: veritabanına yeniden gidilmiyor. */
  assert.deepEqual(await yukle("a.com"), ["a.com verisi"]);
  assert.deepEqual(await yukle("b.com"), ["b.com verisi"]);
  assert.deepEqual(gorulen, ["a.com", "b.com"]);
});

test("aynı anahtarın eşzamanlı istekleri tek sorguya iniyor", async () => {
  let sayac = 0;
  const yukle = ttlCache(async () => {
    sayac += 1;
    await new Promise((c) => setTimeout(c, 5));
    return ["x"];
  }, 60_000);

  await Promise.all([yukle("a.com"), yukle("a.com"), yukle("a.com")]);
  assert.equal(sayac, 1);
});

test("farklı anahtarlar birbirini beklemiyor", async () => {
  const sayaclar: Record<string, number> = {};
  const yukle = ttlCache(async (konak: string) => {
    sayaclar[konak] = (sayaclar[konak] ?? 0) + 1;
    return [konak];
  }, 60_000);

  await Promise.all([yukle("a.com"), yukle("b.com")]);
  assert.deepEqual(sayaclar, { "a.com": 1, "b.com": 1 });
});
