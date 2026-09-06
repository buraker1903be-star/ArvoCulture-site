import { getStorefrontProducts } from "@/lib/products";

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
  const products = await getStorefrontProducts(200);

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
