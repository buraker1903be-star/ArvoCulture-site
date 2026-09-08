"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { readFavourites } from "@/lib/favourites";
import type { Product } from "@/lib/product-types";

export function FavouritesView({ products }: { products: Product[] }) {
  const [slugs, setSlugs] = useState<string[] | null>(null);

  useEffect(() => {
    const sync = () => setSlugs(readFavourites());
    sync();
    window.addEventListener("arvo:favourites", sync);
    return () => window.removeEventListener("arvo:favourites", sync);
  }, []);

  // Liste okunana kadar boş durum gösterilmiyor: kısa bir an
  // için "favoriniz yok" yazması yanıltıcı olurdu.
  if (slugs === null) {
    return (
      <section className="panel">
        <p className="hint">Yükleniyor…</p>
      </section>
    );
  }

  const chosen = slugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product));

  if (chosen.length === 0) {
    return (
      <section className="panel order-result">
        <h2>Henüz favoriniz yok.</h2>
        <p>
          Beğendiğiniz ürünlerin köşesindeki kalbe dokunun; hepsi burada
          birikir.
        </p>
        <div className="order-actions">
          <Link className="btn" href="/koleksiyon/tumu">
            Ürünlere göz at
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="head">
        <div>
          <h2>{chosen.length} ürün</h2>
          <p>Favorilerinize eklediğiniz ürünler.</p>
        </div>
      </div>
      <div className="grid">
        {chosen.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
