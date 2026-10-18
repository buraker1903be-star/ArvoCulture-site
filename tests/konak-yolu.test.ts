import { test } from "node:test";
import assert from "node:assert/strict";
import { konagiTemizle, yolaYaz } from "@/lib/konak-yolu";

/*
  Proxy her isteği `/<konak>/...` olarak yeniden yazıyor. Eleme
  listesi sessizce bozulabilecek türden: yanlışlıkla elenen bir
  rota 404 verir, elenmeyen bir dosya yeniden yazılıp kaybolur.
  İkisi de derlemede görünmez.
*/

test("sıradan adres konak segmentiyle yazılıyor", () => {
  assert.equal(yolaYaz("/sss", "ornek.com"), "/ornek.com/sss");
  assert.equal(yolaYaz("/urun/bir-urun", "ornek.com"), "/ornek.com/urun/bir-urun");
});

test("kök adres çift eğik çizgi üretmiyor", () => {
  /* `/` + `/` = `//` olurdu ve rota bulunamazdı. */
  assert.equal(yolaYaz("/", "ornek.com"), "/ornek.com");
});

test("derleme çıktısı ve uçlar yeniden yazılmıyor", () => {
  assert.equal(yolaYaz("/_next/static/chunk.js", "ornek.com"), null);
  assert.equal(yolaYaz("/api/urunler", "ornek.com"), null);
});

test("public dosyaları yeniden yazılmıyor", () => {
  /* Yazılsaydı gerçek dosyalar kaybolurdu. */
  for (const yol of ["/logo.png", "/icon/icon-192.png", "/sw.js", "/a.woff2"]) {
    assert.equal(yolaYaz(yol, "ornek.com"), null, yol);
  }
});

test("kök sözleşmeleri yeniden yazılmıyor", () => {
  /* robots/manifest/sitemap yalnızca app kökünde tanınıyor;
     [konak] altına taşındıklarında rota listesinden düştüler. */
  assert.equal(yolaYaz("/robots.txt", "ornek.com"), null);
  assert.equal(yolaYaz("/sitemap.xml", "ornek.com"), null);
  assert.equal(yolaYaz("/manifest.webmanifest", "ornek.com"), null);
});

test("llms.txt sıradan bir rota: yeniden yazılıyor", () => {
  /* Uzantılı ama kök sözleşmesi değil; elenirse 404 verirdi. */
  assert.equal(yolaYaz("/llms.txt", "ornek.com"), "/ornek.com/llms.txt");
});

test("zaten yazılmış adres ikinci kez yazılmıyor", () => {
  /* İç yönlendirmelerde proxy yeniden çalışıyor; sonsuz
     `/konak/konak/...` üretmemeli. */
  assert.equal(yolaYaz("/ornek.com", "ornek.com"), null);
  assert.equal(yolaYaz("/ornek.com/sss", "ornek.com"), null);
});

test("konak boşsa yeniden yazılmıyor", () => {
  /* Boş segment bütün adresleri bozardı. */
  assert.equal(yolaYaz("/sss", ""), null);
});

test("konak temizleme: şema, port ve büyük harf düşüyor", () => {
  assert.equal(konagiTemizle("ORNEK.com"), "ornek.com");
  assert.equal(konagiTemizle("ornek.com:3000"), "ornek.com");
  assert.equal(konagiTemizle("https://ornek.com/yol"), "ornek.com");
  assert.equal(konagiTemizle(null), "");
  assert.equal(konagiTemizle("  "), "");
});

test("benzer adlı başka mağaza yanlışlıkla eşleşmiyor", () => {
  /* "/ornek.community" ile "/ornek.com" karıştırılmamalı. */
  assert.equal(yolaYaz("/ornek.community", "ornek.com"), "/ornek.com/ornek.community");
});
