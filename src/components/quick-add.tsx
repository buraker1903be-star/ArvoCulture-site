"use client";

import Link from "next/link";
import { useContext, useState } from "react";
import { CartContext } from "@/components/cart";
import type { Product } from "@/lib/product-types";

/**
 * Kartlardan doğrudan sepete ekleme.
 * Giyimde beden zorunlu olduğu için hızlı ekleme yapılmaz;
 * bedensiz sipariş, iade sebeplerinin başında gelir.
 */
export function QuickAdd({ product }: { product: Product }) {
  const { add } = useContext(CartContext);
  const [done, setDone] = useState(false);

  if (product.available === false) {
    return (
      <button className="btn btn-ghost btn-block" type="button" disabled>
        Tükendi
      </button>
    );
  }

  if (product.category === "Giyim") {
    return (
      <Link className="btn btn-ghost btn-block" href={`/urun/${product.slug}`}>
        Beden seç
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-ghost btn-block"
      disabled={done}
      onClick={() => {
        add(product);
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      }}
    >
      {done ? "Sepete eklendi ✓" : "Sepete ekle"}
    </button>
  );
}
