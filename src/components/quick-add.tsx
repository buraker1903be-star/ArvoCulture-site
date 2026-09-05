"use client";

import Link from "next/link";
import { useContext, useState } from "react";
import { CartContext } from "@/components/cart";
import type { Product } from "@/lib/product-types";

/**
 * Kartlardaki hızlı ekleme.
 *
 * Eskiden bu etiket, ürün bağlantısının içinde duran bir <span>'di:
 * "Hızlı ekle +" yazıyor ama tıklayınca sepete eklemek yerine ürün
 * sayfasına gidiyordu. Verilen sözün tutulmaması, dönüşümü doğrudan
 * düşüren türden bir hatadır.
 *
 * Giyimde beden seçimi zorunlu olduğu için hızlı ekleme yapılmaz;
 * bunun yerine ürün sayfasına yönlendiren açık bir bağlantı gösterilir.
 */
export function QuickAdd({ product }: { product: Product }) {
  const { add } = useContext(CartContext);
  const [done, setDone] = useState(false);

  if (product.available === false) {
    return (
      <span className="quick-add is-disabled" aria-hidden="true">
        Tükendi
      </span>
    );
  }

  if (product.category === "Giyim") {
    return (
      <Link className="quick-add" href={`/urun/${product.slug}`}>
        Beden seç
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="quick-add"
      disabled={done}
      onClick={() => {
        add(product);
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      }}
    >
      {done ? "Sepete eklendi" : "Sepete ekle +"}
    </button>
  );
}
