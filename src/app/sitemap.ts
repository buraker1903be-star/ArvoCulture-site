import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getStorefrontProductSlugs } from "@/lib/products";
import { getStorefrontCollections } from "@/lib/collections";

const staticPaths = [
  "",
  "/hakkimizda",
  "/iletisim",
  "/sss",
  "/teslimat",
  "/teslimat-iade",
  "/iptal-iade",
  "/on-bilgilendirme-formu",
  "/mesafeli-satis-sozlesmesi",
  "/kvkk-aydinlatma-metni",
  "/gizlilik",
  "/kullanim-kosullari",
  "/yasal-bildirim",
  "/ticari-elektronik-ileti",
];

/*
  Sitemap derleme sırasında değil, istek anında üretiliyor.

  Önceden derleme sırasında üretiliyordu ve katalog sorgusu zaman
  aşımına uğrayınca tüm dağıtım düşüyordu. Sitemap'in geçici bir
  veritabanı takılması yüzünden yayını engellemesi doğru değil:
  burada hata olursa sitemap 500 döner, arama motoru bir öncekini
  kullanmaya devam eder, site yayına çıkar.
*/
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [products, collections] = await Promise.all([
    getStorefrontProductSlugs(),
    getStorefrontCollections(),
  ]);

  /*
    Ürünsüz sitemap yayımlanmaz.

    Katalog çağrısı geçici bir sebeple boş dönerse, üretilen
    sitemap Google’a "3.400 ürünün hepsi kalktı" der ve bu yanlış
    bilgi bir saat önbellekte kalır. Dizinden düşen sayfaları geri
    kazanmak haftalar sürer. Üretimi durdurmak çok daha ucuz:
    arama motoru bir önceki sitemap’i kullanmaya devam eder.
  */
  if (products.length === 0) {
    throw new Error(
      "Sitemap üretilemedi: katalog boş döndü. Ürünsüz sitemap yayımlanmıyor.",
    );
  }

  return [
    ...staticPaths.map((path) => ({
      url: `${env.siteUrl}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.4,
    })),
    ...collections.map((collection) => ({
      url: `${env.siteUrl}/koleksiyon/${collection.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${env.siteUrl}/urun/${product.slug}`,
      /* Ürünün kendi güncellenme tarihi. Hepsine üretim zamanını
         yazmak, her sayfanın her gün değiştiği anlamına gelirdi ve
         arama motoru için işe yaramaz bir sinyaldir. */
      lastModified: product.updatedAt ?? now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ];
}
