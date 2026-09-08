"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { Rail } from "@/components/rail";
import { readRecent, pushRecent } from "@/lib/recent";
import type { Product } from "@/lib/product-types";

/**
 * Son gezilen ürünler rafı.
 *
 * Ürün sayfasında o ürünü listeye ekler ve diğerlerini gösterir.
 * Ana sayfada yalnızca gösterir.
 */
export function RecentProducts({
  products,
  currentSlug,
  title = "Son gezdikleriniz",
}: {
  products: Product[];
  /** Ürün sayfasındaysa o ürün listeye eklenir ve gösterilmez. */
  currentSlug?: string;
  title?: string;
}) {
  const [slugs, setSlugs] = useState<string[] | null>(null);

  useEffect(() => {
    // Önce mevcut listeyi oku, sonra bu ürünü ekle: aksi hâlde
    // ürün kendi rafında görünürdü.
    const previous = readRecent();
    // Tek seferlik başlangıç değeri; zincirleme render riski yok.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlugs(previous);
    if (currentSlug) pushRecent(currentSlug);
  }, [currentSlug]);

  if (slugs === null) return null;

  const chosen = slugs
    .filter((slug) => slug !== currentSlug)
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product));

  // İki üründen az varsa raf göstermeye değmez.
  if (chosen.length < 2) return null;

  return (
    <section className="panel">
      <div className="head">
        <div>
          <h2>{title}</h2>
          <p>Kaldığınız yerden devam edin.</p>
        </div>
      </div>

      <Rail>
        {chosen.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </Rail>
    </section>
  );
}
