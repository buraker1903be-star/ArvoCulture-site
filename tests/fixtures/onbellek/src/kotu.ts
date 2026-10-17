// Denetim fikstürü: taze olması gereken çağrı önbellekli.
export const oku = async () =>
  rpcTumSayfalar<Satir>(
    "arc_storefront_product_slugs",
    {},
    { revalidate: 3600, tags: ["storefront-products"] },
  );
