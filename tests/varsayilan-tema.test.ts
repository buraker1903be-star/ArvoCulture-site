import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultTheme } from "@/lib/storefront-theme-varsayilan";

/*
  VARSAYILAN TEMA YANSIZ OLMAK ZORUNDA.

  Tema okuması ANAHTAR BAŞINA yedeğe düşüyor: mağazanın kaydında
  olmayan her alan buradan geliyor. Burada ArvoCulture'ın pazarlama
  metni duruyordu ve teması olmayan her mağaza onu gösteriyordu —
  başka bir mağazanın kupon kodunu ve kargo eşiğini müşterisine
  vaat olarak.

  Bu testler o metnin geri sızmasını engelliyor.
*/

/** Tema nesnesindeki bütün metin değerleri. */
const metinler = Object.entries(defaultTheme)
  .filter((cift): cift is [string, string] => typeof cift[1] === "string")
  .map(([anahtar, deger]) => ({ anahtar, deger }));

test("marka adı geçmiyor", () => {
  for (const { anahtar, deger } of metinler) {
    assert.doesNotMatch(
      deger.toLocaleLowerCase("tr-TR"),
      /arvo/,
      `${anahtar} marka adı taşıyor: ${deger}`,
    );
  }
});

test("kupon kodu ya da tutar vaadi geçmiyor", () => {
  /* "2.000 TL üzeri ücretsiz kargo" başka mağazada yanlış; kargo
     kuralı zaten satış ayarlarından geliyor (lib/order-quote). */
  for (const { anahtar, deger } of metinler) {
    assert.doesNotMatch(deger, /\bTL\b|₺|%\s?\d/, `${anahtar} tutar vaadi taşıyor: ${deger}`);
    assert.doesNotMatch(deger, /\b[A-Z]{3,}\d+\b/, `${anahtar} kupon kodu taşıyor: ${deger}`);
  }
});

test("dış adres geçmiyor", () => {
  /* Kapak görseli ArvoCulture'ın Shopify CDN'indeki dosyasıydı:
     başka bir mağazanın ana sayfası onun görselini çekiyordu. */
  for (const { anahtar, deger } of metinler) {
    assert.doesNotMatch(deger, /^https?:\/\//, `${anahtar} dış adres taşıyor: ${deger}`);
  }
});

test("düğme adresleri her mağazada var olan bir yere gidiyor", () => {
  /* Varsayılanlar /koleksiyon/giyim ve /koleksiyon/bakim idi; o
     koleksiyonlar başka mağazada yok ve düğmeler 404'e çıkıyordu.
     "tumu" katalog yolu, her mağazada çalışıyor. */
  for (const adres of [defaultTheme.primary_cta_href, defaultTheme.secondary_cta_href]) {
    if (!adres) continue;
    assert.match(adres, /^\/(koleksiyon\/tumu|arama|)$/, `kırık olabilecek adres: ${adres}`);
  }
});

test("boş bırakılan alanlar bilinçli", () => {
  /* Bu alanlar boşken ilgili bölüm HİÇ çizilmiyor (duyuru şeridi,
     ikinci düğme, kampanya bloğu, altbilgi cümlesi). Doldurulmak
     istenirse bölümü gizleyen koşullar da gözden geçirilmeli. */
  assert.equal(defaultTheme.announcement, "");
  assert.equal(defaultTheme.secondary_cta_label, "");
  assert.equal(defaultTheme.campaign_title, "");
  assert.equal(defaultTheme.footer_tagline, "");
  assert.equal(defaultTheme.hero_image_url, undefined);
});

test("mağaza adı yansız", () => {
  /* 17.10.2026: tanınmayan bir alt alan adında ArvoCulture'ın adı
     görünüyordu (deneme.shop.arvo-os.com). */
  assert.equal(defaultTheme.store_name, "Mağaza");
});
