"use client";

import Link from "next/link";
import { useContext, useRef, useState } from "react";
import { CartContext } from "@/components/cart";
import { flyToCart } from "@/lib/fly-to-cart";
import type { Product } from "@/lib/product-types";

/**
 * Kartlardan doğrudan sepete ekleme.
 * Giyimde beden zorunlu olduğu için hızlı ekleme yapılmaz;
 * bedensiz sipariş, iade sebeplerinin başında gelir.
 */
export function QuickAdd({ product }: { product: Product }) {
  const { add } = useContext(CartContext);
  const [done, setDone] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
      ref={buttonRef}
      onClick={() => {
        // Görsel, karttan sepet ikonuna uçar: eklemenin gerçekten
        // olduğunu ve nereye gittiğini gösterir.
        flyToCart(buttonRef.current, product.image);
        add(product);
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      }}
    >
      {done ? "Sepete eklendi ✓" : "Sepete ekle"}
    </button>
  );
}
