import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getStorefrontProducts } from "@/lib/products";
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
    getStorefrontProducts(200),
    getStorefrontCollections(),
  ]);

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
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ];
}
