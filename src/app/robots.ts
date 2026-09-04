import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Sepet, ödeme, hesap ve arama sayfalarının dizine girmesi hem
      // anlamsız hem de arama sonuçlarında kalitesiz sonuç üretir.
      disallow: ["/sepet", "/odeme", "/hesap", "/arama"],
    },
    sitemap: `${env.siteUrl}/sitemap.xml`,
    host: env.siteUrl,
  };
}
