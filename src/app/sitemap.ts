import type { MetadataRoute } from "next";
import { brands, brandPath, routes, siteUrl, type RouteKey } from "@/lib/site";

const keys = Object.keys(routes) as RouteKey[];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages: MetadataRoute.Sitemap = keys.map((key) => ({
    url: `${siteUrl}${routes[key].tr}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: key === "home" ? 1 : 0.7,
    alternates: {
      languages: {
        tr: `${siteUrl}${routes[key].tr}`,
        en: `${siteUrl}${routes[key].en}`,
      },
    },
  }));

  const brandPages: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${siteUrl}${brandPath(brand.slug, "tr")}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
    alternates: {
      languages: {
        tr: `${siteUrl}${brandPath(brand.slug, "tr")}`,
        en: `${siteUrl}${brandPath(brand.slug, "en")}`,
      },
    },
  }));

  const legal: MetadataRoute.Sitemap = [
    "/kvkk-aydinlatma-metni",
    "/gizlilik-ve-cerez-politikasi",
  ].map((p) => ({
    url: `${siteUrl}${p}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [...pages, ...brandPages, ...legal];
}
