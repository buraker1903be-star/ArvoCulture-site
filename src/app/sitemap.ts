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

export const revalidate = 3600;

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
    ...products.map((slug) => ({
      url: `${env.siteUrl}/urun/${slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ];
}
