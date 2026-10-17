// Denetim fikstürü: doğru çağrı.
export const oku = async () =>
  rpc<Satir>(
    "get_arvoculture_storefront_variants",
    { p_slug: "x" },
    { revalidate: 0, onbelleksiz: true, tags: ["storefront-variants"] },
  );
