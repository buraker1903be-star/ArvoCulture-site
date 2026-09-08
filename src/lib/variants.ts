import { cache } from "react";
import { rpcOrEmpty } from "@/lib/arc";

/**
 * Ürün varyantları.
 *
 * Sepet ürün slug'ı yerine varyant SKU'su taşımalı; aksi hâlde
 * müşteri "L" seçse bile sipariş stokta olan herhangi bir
 * varyanta bağlanıyor ve yanlış beden gönderiliyor.
 */
export type Variant = {
  sku: string;
  title: string;
  color: string | null;
  size: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  available: boolean;
};

export const getProductVariants = cache(
  async (slug: string): Promise<Variant[]> => {
    const rows = await rpcOrEmpty<Variant>(
      "get_arvoculture_storefront_variants",
      { p_slug: slug },
      { revalidate: 60, tags: ["storefront-variants"] },
    );

    return rows.map((row) => ({
      ...row,
      // Tutarlar kuruş olarak gelir.
      price: Number(row.price) / 100,
      compare_at_price: row.compare_at_price
        ? Number(row.compare_at_price) / 100
        : null,
    }));
  },
);

/**
 * Varyantlarda gerçek beden seçeneği var mı?
 *
 * Tek varyantlı ürünlerde (kozmetik, parfüm) beden seçtirmenin
 * anlamı yok. Bedeni olmayan varyantlar "Default" ya da boş
 * başlıkla gelir.
 */
export function hasSizes(variants: Variant[]) {
  const sizes = new Set(
    variants.map((v) => v.size).filter((s): s is string => Boolean(s)),
  );
  return sizes.size > 1;
}
