import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";

/*
  Yanlış bir yorum ("POST önbelleğe alınmıyor") bir yıl boyunca fark
  edilmedi: site haritası, satılamaz ürünleri çıkaran migration
  uygulandıktan sonra bir saatten uzun süre eski listeyi verdi.
  Kural artık yorumda değil denetimde.

  Liste bilerek KISA: ürün sayfası ve varyant listesi de eklenmişti
  ve bütün ürün sayfaları 500 verdi — o rota `revalidate = 60` ile
  saklanıyor ve saklanan bir sayfanın içinde `no-store` çelişki.
  Bayatlığı orada fetch değil rota önbelleği belirliyor.
*/
const denetim = (kok: string) => {
  const sonuc = spawnSync(process.execPath, ["scripts/check-onbellek.mjs", kok], {
    encoding: "utf8",
  });
  return { cikis: sonuc.status ?? 1, cikti: `${sonuc.stdout}${sonuc.stderr}` };
};

test("önbellekli çağrı yakalanıyor", () => {
  const { cikis, cikti } = denetim("tests/fixtures/onbellek/src");
  assert.equal(cikis, 1);
  assert.match(cikti, /kotu\.ts/);
  assert.match(cikti, /get_arvoculture_storefront_product_slugs önbelleksiz çağrılmalı/);
});

test("doğru çağrı sorun sayılmıyor", () => {
  const { cikti } = denetim("tests/fixtures/onbellek/src");
  assert.ok(!cikti.includes("iyi.ts"), "önbelleksiz çağrı listelenmemeli");
});

test("gerçek kaynak ağacı denetimden geçiyor", () => {
  const { cikis, cikti } = denetim("src");
  assert.equal(cikis, 0, cikti);
  assert.match(cikti, /1 fonksiyon önbelleksiz çağrılıyor/);
});
