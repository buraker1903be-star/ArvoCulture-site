import { env } from "@/lib/env";
import type { Product } from "@/lib/product-types";

const CURRENCY = "TRY";

/**
 * Product + Offer şeması. Google Alışveriş'in ücretsiz listelemeleri ve
 * zengin sonuçlar bu işaretlemeye bağlıdır; fiyat, para birimi ve stok
 * durumu eksiksiz olmalıdır.
 */
export function productSchema(product: Product) {
  const url = `${env.siteUrl}/urun/${product.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.subtitle,
    sku: product.slug,
    url,
    ...(product.image ? { image: [product.image] } : {}),
    brand: { "@type": "Brand", name: product.eyebrow || "ArvoCulture" },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: CURRENCY,
      price: product.price.toFixed(2),
      availability:
        product.available === false
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "ArvoCulture" },
    },
  };
}

export function breadcrumbSchema(trail: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: `${env.siteUrl}${step.path}`,
    })),
  };
}

export function storeSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": `${env.siteUrl}/#store`,
    name: "ArvoCulture",
    url: env.siteUrl,
    currenciesAccepted: CURRENCY,
    /** Holding ile varlık bağı. Tek yönlü bağ zayıf sinyal üretir. */
    parentOrganization: {
      "@type": "Organization",
      name: "ArvoCulture Group",
      url: "https://arvoculturegroup.com",
    },
  };
}
