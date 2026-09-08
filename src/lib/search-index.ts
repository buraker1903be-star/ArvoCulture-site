import { getStorefrontProducts } from "@/lib/products";

/**
 * Ä°stemciye gÃ¶nderilen hafif arama dizini.
 *
 * TÃ¼m Ã¼rÃ¼n nesnesi gÃ¶nderilseydi aÃ§Ä±klama metinleriyle birlikte
 * yÃ¼zlerce kilobayt olurdu. Buradan yalnÄ±zca arama ve sonuÃ§
 * kartÄ± iÃ§in gereken alanlar geÃ§er.
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
  const products = await getStorefrontProducts(3000);

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
