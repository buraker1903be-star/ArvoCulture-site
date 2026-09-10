import { getStorefrontProducts, CATALOG_LIMIT } from "@/lib/products";

/**
 * İstemciye gönderilen hafif arama dizini.
 *
 * Tüm ürün nesnesi gönderilseydi açıklama metinleriyle birlikte
 * yüzlerce kilobayt olurdu. Buradan yalnızca arama ve sonuç
 * kartı için gereken alanlar geçer.
 */
export type SearchItem = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  image?: string;
};

export async function getSearchIndex(): Promise<SearchItem[]> {
  /*
    Arama tüm katalogu görmeli. 200 sınırı, tedarikçiden gelen
    3.000+ ürünü aramanın tamamen dışında bırakıyordu.
  */
  const products = await getStorefrontProducts(CATALOG_LIMIT);

  return products
    .filter((product) => product.available !== false)
    .map((product) => ({
      slug: product.slug,
      name: product.name,
      brand: product.eyebrow,
      category: product.category,
      price: product.price,
      oldPrice: product.oldPrice,
      image: product.image,
    }));
}
