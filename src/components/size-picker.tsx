"use client";

import { useContext, useState } from "react";
import { CartContext } from "@/components/cart";
import type { Product } from "@/lib/product-types";

const SIZES = ["XS", "S", "M", "L", "XL"];

/**
 * Beden seçimi eskiden hiçbir işe yaramıyordu: butonlar durum tutmuyor,
 * seçim sepete taşınmıyordu. Müşteri bedenini seçtiğini sanıp yanlış
 * ürün sipariş edebilirdi. Artık seçim zorunlu ve sepete taşınıyor.
 */
export function SizePicker({ product }: { product: Product }) {
  const { add } = useContext(CartContext);
  const [size, setSize] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [warn, setWarn] = useState(false);

  return (
    <>
      <label className="option-label" id="beden-etiketi">
        Beden seç
      </label>
      <div className="sizes" role="radiogroup" aria-labelledby="beden-etiketi">
        {SIZES.map((option) => (
          <button
            type="button"
            key={option}
            role="radio"
            aria-checked={size === option}
            data-selected={size === option}
            onClick={() => {
              setSize(option);
              setWarn(false);
            }}
          >
            {option}
          </button>
        ))}
      </div>

      {warn && (
        <p className="option-warning" role="alert">
          Sepete eklemeden önce bir beden seçin.
        </p>
      )}

      <button
        className="button button-dark full"
        type="button"
        disabled={done}
        onClick={() => {
          if (!size) {
            setWarn(true);
            return;
          }
          add({ ...product, name: `${product.name} (${size})` });
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        }}
      >
        {done ? "Sepete eklendi" : "Sepete ekle"}
      </button>
    </>
  );
}
