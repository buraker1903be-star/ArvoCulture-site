// Denetim fikstürü: doğru çağrı.
export const oku = async () =>
  rpcTumSayfalar<Satir>(
    "arc_storefront_product_slugs",
    {},
    { revalidate: 0, onbelleksiz: true, tags: ["storefront-products"] },
  );
