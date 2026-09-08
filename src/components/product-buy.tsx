"use client";

import { useContext, useMemo, useRef, useState } from "react";
import { CartContext } from "@/components/cart";
import { flyToCart } from "@/lib/fly-to-cart";
import type { Product } from "@/lib/product-types";
import type { Variant } from "@/lib/variants";

/**
 * Satın alma bloğu: beden, adet, sepete ekleme.
 *
 * Bedenler artık sabit bir listeden değil, ürünün gerçek
 * varyantlarından geliyor. Seçilen varyantın SKU'su sepete
 * yazılıyor; sipariş bu SKU üzerinden kuruluyor.
 *
 * Öncesinde sepet yalnızca ürün slug'ı taşıyordu: müşteri "L"
 * seçse bile ARC stokta olan herhangi bir varyantı alıyor ve
 * yanlış beden gönderiliyordu.
 */
export function ProductBuy({
  product,
  variants,
}: {
  product: Product;
  variants: Variant[];
}) {
  const { add } = useContext(CartContext);
  const [sku, setSku] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [warn, setWarn] = useState(false);
  const [done, setDone] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  /*
    Beden seçimi yalnızca gerçekten birden çok beden varsa
    gösterilir. Kozmetik ve parfümde tek varyant olur; orada
    seçim istemek gereksiz sürtünme yaratır.
  */
  const sizes = useMemo(
    () => variants.filter((variant) => variant.size),
    [variants],
  );
  const needsSize = sizes.length > 1;

  const selected = useMemo(() => {
    if (sku) return variants.find((variant) => variant.sku === sku) ?? null;
    // Tek varyantlı üründe seçim gerekmez.
    return variants.length === 1 ? variants[0]! : null;
  }, [sku, variants]);

  const soldOut =
    product.available === false ||
    (variants.length > 0 && variants.every((variant) => !variant.available));

  function handleAdd() {
    if (needsSize && !selected) {
      setWarn(true);
      return;
    }

    flyToCart(buttonRef.current, product.image);

    const variant = selected
      ? {
          sku: selected.sku,
          label: selected.size ?? selected.title,
          price: selected.price,
        }
      : undefined;

    for (let i = 0; i < quantity; i += 1) add(product, variant);

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
          <div
            className="sizes"
            role="radiogroup"
            aria-labelledby="beden-etiketi"
          >
            {sizes.map((variant) => (
              <button
                type="button"
                key={variant.sku}
                role="radio"
                aria-checked={selected?.sku === variant.sku}
                data-selected={selected?.sku === variant.sku}
                /* Stokta olmayan beden seçilemez ama gizlenmez:
                   müşteri hangi bedenin tükendiğini görmeli. */
                disabled={!variant.available}
                title={variant.available ? undefined : "Bu beden tükendi"}
                onClick={() => {
                  setSku(variant.sku);
                  setWarn(false);
                }}
              >
                {variant.size}
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
        {selected && selected.stock > 0 && selected.stock <= 5
          ? `Son ${selected.stock} adet`
          : "Stokta"}
      </p>
    </div>
  );
}
