"use client";

import { useContext, useRef, useState } from "react";
import { CartContext } from "@/components/cart";
import { flyToCart } from "@/lib/fly-to-cart";
import type { Product } from "@/lib/product-types";

const SIZES = ["XS", "S", "M", "L", "XL"];

/**
 * Satın alma bloğu: adet, beden ve sepete ekleme.
 *
 * Giyimde beden seçimi zorunlu. Eskiden butonlar durum tutmuyordu
 * ve seçim sepete taşınmıyordu; müşteri bedenini seçtiğini sanıp
 * bedensiz sipariş verebiliyordu.
 */
export function ProductBuy({ product }: { product: Product }) {
  const { add } = useContext(CartContext);
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [warn, setWarn] = useState(false);
  const [done, setDone] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const needsSize = product.category === "Giyim";
  const soldOut = product.available === false;

  function handleAdd() {
    if (needsSize && !size) {
      setWarn(true);
      return;
    }

    flyToCart(buttonRef.current, product.image);

    const item = size ? { ...product, name: `${product.name} (${size})` } : product;
    for (let i = 0; i < quantity; i += 1) add(item);

    setDone(true);
    setTimeout(() => setDone(false), 1800);
  }

  if (soldOut) {
    return (
      <div className="pdp-buy">
        <button className="btn btn-block" type="button" disabled>
          Tükendi
        </button>
        <p className="stock-line">Şu anda stokta yok</p>
      </div>
    );
  }

  return (
    <div className="pdp-buy">
      {needsSize && (
        <>
          <label className="option-label" id="beden-etiketi">
            Beden
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
            <p className="field-warn" role="alert">
              Sepete eklemeden önce bir beden seçin.
            </p>
          )}
        </>
      )}

      {/* Adet seçimi butonun yanında; müşteri sepete gidip tek tek
          artırmak zorunda kalmıyor. */}
      <label className="option-label" id="adet-etiketi">
        Adet
      </label>

      <div className="pdp-actions">
        <span className="quantity" aria-labelledby="adet-etiketi">
          <button
            type="button"
            aria-label="Azalt"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            −
          </button>
          <b>{quantity}</b>
          <button
            type="button"
            aria-label="Artır"
            onClick={() => setQuantity(Math.min(20, quantity + 1))}
          >
            +
          </button>
        </span>

        <button
          ref={buttonRef}
          type="button"
          className="btn"
          onClick={handleAdd}
        >
          {done ? "Sepete eklendi ✓" : "Sepete ekle"}
        </button>
      </div>

      <p className="stock-line" data-in-stock="true">
        Stokta
      </p>
    </div>
  );
}
