/*
  SÖZLÜK.

  Eksik bir çeviri görünmez bir kusur: sayfa açılıyor, düğme duruyor,
  yalnızca metni yanlış dilde. Bu yüzden eksiklik TESTTE yakalanıyor.
*/
import test from "node:test";
import assert from "node:assert/strict";
import { ceviri, SOZLUK, type SozlukAnahtari } from "@/lib/sozluk";

test("her anahtarın iki dilde karşılığı var", () => {
  const eksik: string[] = [];
  for (const [anahtar, satir] of Object.entries(SOZLUK)) {
    if (!satir[0]?.trim()) eksik.push(`${anahtar} (tr)`);
    if (!satir[1]?.trim()) eksik.push(`${anahtar} (en)`);
  }
  assert.deepEqual(eksik, [], `karşılığı olmayan: ${eksik.join(", ")}`);
});

test("çeviri dile göre seçiliyor", () => {
  assert.equal(ceviri("sepeteEkle", "tr"), "Sepete ekle");
  assert.equal(ceviri("sepeteEkle", "en"), "Add to cart");
});

test("yer tutucular iki dilde de duruyor", () => {
  /*
    {n}, {kod}, {tutar}, {urun}, {oran}, {c}, {a} yerine çalışma
    anında değer giriyor. Bir dilde yer tutucu düşerse o dilde sayı
    ya da ürün adı HİÇ görünmez — sessiz bir kusur.
  */
  const tutucu = /\{[a-z]+\}/g;
  const hatalar: string[] = [];
  for (const [anahtar, satir] of Object.entries(SOZLUK)) {
    const tr = (satir[0].match(tutucu) ?? []).slice().sort();
    const en = (satir[1].match(tutucu) ?? []).slice().sort();
    if (tr.join(",") !== en.join(",")) {
      hatalar.push(`${anahtar}: tr[${tr}] en[${en}]`);
    }
  }
  assert.deepEqual(hatalar, [], hatalar.join(" · "));
});

test("Türkçe metinler İngilizce karşılığından farklı", () => {
  /*
    Aynı metni iki dile de yazmak, çevirinin atlandığını gösteriyor.
    İstisnalar gerçekten aynı olanlar: marka adları, kısaltmalar.
  */
  const AYNI_OLABILIR = new Set<SozlukAnahtari>([]);
  const ayni = (Object.entries(SOZLUK) as [SozlukAnahtari, readonly string[]][])
    .filter(([anahtar, satir]) => satir[0] === satir[1] && !AYNI_OLABILIR.has(anahtar))
    .map(([anahtar]) => anahtar);
  assert.deepEqual(ayni, [], `çevrilmemiş: ${ayni.join(", ")}`);
});
