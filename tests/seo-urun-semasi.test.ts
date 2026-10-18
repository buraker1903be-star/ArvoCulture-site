import assert from "node:assert/strict";
import test from "node:test";
import type { Product } from "@/lib/product-types";

/* Şema adresi artık parametre: önceden env.siteUrl sabitinden
   geliyordu ve ikinci bir kiracının ürün şeması ArvoCulture'ın
   adresini gösterirdi. */
const ADRES = "https://ornek-magaza.test";
/* Ürünün kendi markası yoksa şemaya mağaza adı giriyor. */
const MAGAZA = "Örnek Mağaza";

/*
  lib/seo.ts, lib/env üzerinden ortam değişkeni okuyor ve eksikse
  BİLEREK hata fırlatıyor ("yanlış yapılandırmayla sessizce çalışan
  bir mağaza, hiç çalışmayan mağazadan daha tehlikelidir"). Bu yüzden
  şema dosyasının testi hiç yoktu. Değişkenler burada test değerleriyle
  dolduruluyor ve modül ondan sonra içeri alınıyor; `env` sabiti
  modül yüklenirken hesaplandığı için sıra önemli.
*/
process.env.ARC_SUPABASE_URL ??= "https://ornek.supabase.co";
process.env.ARC_SUPABASE_PUBLISHABLE_KEY ??= "test-anahtar";
process.env.ARC_ORGANIZATION_ID ??= "00000000-0000-0000-0000-000000000000";
process.env.NEXT_PUBLIC_SITE_URL ??= "https://arvoculture.com";

const { productSchema } = await import("@/lib/seo");
type SchemaVariant = { sku: string; price: number; available: boolean };

/*
  Ürün şeması Google'ın ücretsiz ürün listelemelerini besliyor ve bu
  dosyanın testi yoktu. İki hata 17.10.2026'da canlıda ölçüldü:

   - `sku` alanında ürün slug'ı yazıyordu; mağazanın hiçbir yerinde
     geçmeyen bir değer satıcı kimliği olarak gönderiliyordu.
   - Dört tonlu rujda tek bir Offer ve kataloğun EN DÜŞÜK fiyatı
     veriliyordu; tonları farklı fiyatlı üründe arama sonucundaki
     fiyat sepette ödenenden farklı olurdu. Google fiyat
     uyuşmazlığında ürünü listeden düşürüyor.
*/
const urun = (over: Partial<Product> = {}): Product => ({
  slug: "lr-ruj",
  name: "LR Mat Ruj",
  category: "Kozmetik",
  price: 1899.9,
  eyebrow: "LR HEALTH & BEAUTY",
  tone: "",
  subtitle: "",
  description: "Ruj",
  tags: [],
  images: ["https://ornek/1.jpg"],
  artStyle: "packshot",
  specs: [],
  sizeGuide: [],
  sizes: [],
  available: true,
  ...over,
});

const v = (over: Partial<SchemaVariant> = {}): SchemaVariant => ({
  sku: "29020-1",
  price: 1899.9,
  available: true,
  ...over,
});

test("tek varyantlı üründe gerçek SKU ve kesin fiyat veriliyor", () => {
  const sema = productSchema(urun(), ADRES, MAGAZA, undefined, [v({ sku: "28244-301", price: 3411.9 })]) as never as {
    sku?: string;
    offers: { "@type": string; price?: string };
  };
  assert.equal(sema.sku, "28244-301");
  assert.equal(sema.offers["@type"], "Offer");
  assert.equal(sema.offers.price, "3411.90");
});

test("çok varyantlı üründe SKU verilmiyor, fiyat aralığı veriliyor", () => {
  const sema = productSchema(urun(), ADRES, MAGAZA, undefined, [
    v({ sku: "29020-1", price: 1899.9 }),
    v({ sku: "29020-2", price: 2099.9 }),
    v({ sku: "29020-3", price: 1899.9 }),
  ]) as never as {
    sku?: string;
    offers: { "@type": string; lowPrice?: string; highPrice?: string; offerCount?: number; price?: string };
  };
  /* Tek bir SKU yok; uydurmaktansa alan hiç verilmiyor. */
  assert.equal(sema.sku, undefined);
  assert.equal(sema.offers["@type"], "AggregateOffer");
  assert.equal(sema.offers.lowPrice, "1899.90");
  assert.equal(sema.offers.highPrice, "2099.90");
  assert.equal(sema.offers.offerCount, 3);
  assert.equal(sema.offers.price, undefined);
});

test("varyantların hiçbiri satılabilir değilse stokta değil", () => {
  /* Ürünün "satılabilir" olması varyantlarından en az birinin
     satılabilir olması demek (ArvoARC: bool_or). */
  const sema = productSchema(urun({ available: true }), ADRES, MAGAZA, undefined, [
    v({ available: false }),
    v({ sku: "29020-2", available: false }),
  ]) as never as { offers: { availability: string } };
  assert.equal(sema.offers.availability, "https://schema.org/OutOfStock");
});

test("bir varyant satılabilirse stokta", () => {
  const sema = productSchema(urun(), ADRES, MAGAZA, undefined, [
    v({ available: false }),
    v({ sku: "29020-2", available: true }),
  ]) as never as { offers: { availability: string } };
  assert.equal(sema.offers.availability, "https://schema.org/InStock");
});

test("varyant bilgisi yoksa ürünün kendi alanına düşülüyor", () => {
  const stokta = productSchema(urun({ available: false }), ADRES, MAGAZA) as never as { offers: { availability: string; price?: string } };
  assert.equal(stokta.offers.availability, "https://schema.org/OutOfStock");
  /* Varyant yoksa Offer ve ürünün fiyatı. */
  assert.equal(stokta.offers.price, "1899.90");
});

test("iade penceresi ve satıcı kimliği şemada duruyor", () => {
  /* Şemadaki süre ile sözleşmedeki sürenin ayrışması mevzuat riski;
     ikisi de seller.ts'ten geliyor. */
  const sema = productSchema(urun(), ADRES, MAGAZA, undefined, [v()]) as never as {
    offers: { hasMerchantReturnPolicy: { merchantReturnDays: number }; seller: { "@id": string } };
  };
  assert.equal(sema.offers.hasMerchantReturnPolicy.merchantReturnDays, 14);
  assert.match(sema.offers.seller["@id"], /#store$/);
});