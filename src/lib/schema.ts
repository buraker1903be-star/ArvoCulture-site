import { brands, organization, siteUrl } from "@/lib/site";

/**
 * Holding varlık şeması. Marka sitelerinde bunun karşılığı olarak
 * `parentOrganization` ile geri referans verilmelidir — tek yönlü bağ
 * arama motorlarında zayıf sinyal üretir.
 */
export function organizationSchema() {
  const { address, registry } = organization;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: organization.name,
    legalName: organization.legalName,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    email: organization.email,
    telephone: organization.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.district,
      addressRegion: address.city,
      postalCode: address.postalCode,
      addressCountry: address.country,
    },
    ...(registry.taxId ? { taxID: registry.taxId } : {}),
    ...(registry.mersis ? { identifier: registry.mersis } : {}),
    subOrganization: brands
      .filter((brand) => brand.url)
      .map((brand) => ({
        "@type": "Organization",
        name: brand.name,
        url: brand.url,
      })),
  };
}

export function breadcrumbSchema(
  trail: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: `${siteUrl}${step.path}`,
    })),
  };
}
