// Denetim fikstürü: taze olması gereken çağrı önbellekli.
export const oku = async () =>
  rpc<Satir>(
    "get_arvoculture_storefront_product",
    { p_slug: "x" },
    { revalidate: 60, tags: ["storefront-products"] },
  );
