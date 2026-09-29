"use client";

import { useContext, useMemo, useRef, useState } from "react";
import { CartContext } from "@/components/cart";
import { flyToCart } from "@/lib/fly-to-cart";
import { displayVariantLabel, renkAdi, type Product } from "@/lib/product-types";
import { bedenSecenekleri, renkSecenekleri, varyantBul } from "@/lib/variant-select";
import type { Variant } from "@/lib/variants";

/**
 * Satın alma bloğu: beden, adet, sepete ekleme.
 *
 * Bedenler artık sabit bir listeden değil, ürünün gerçek
 * varyantlarından geliyor. Seçilen varyantın SKU’su sepete
 * yazılıyor; sipariş bu SKU üzerinden kuruluyor.
 *
 * Öncesinde sepet yalnızca ürün slug’ı taşıyordu: müşteri "L"
 * seçse bile ArvoARC stokta olan herhangi bir varyantı alıyor ve
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
  const [renk, setRenk] = useState<string | null>(null);
  const [beden, setBeden] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [warn, setWarn] = useState(false);
  const [done, setDone] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  /*
    RENK SEÇİMİ. Kutu tekstil için yazılmıştı ve yalnızca bedeni
    biliyordu; kozmetikte beden yok, renk var. LR'ın dudak kalemi ve
    rujunun altı tonu ürün sayfasında hiç görünmüyordu (30.09.2026).
  */
  const renkler = useMemo(() => renkSecenekleri(variants), [variants]);
  const needsColor = renkler.length > 1;

  /*
    Bedenler seçilen renge göre daralıyor: ikisi birden olan üründe
    "Beyaz" yalnızca S'te varsa M gösterilmemeli.
  */
  const sizes = useMemo(() => bedenSecenekleri(variants, renk), [variants, renk]);
  const needsSize = new Set(sizes.map((variant) => variant.size)).size > 1;

  const selected = useMemo(
    () => varyantBul(variants, renk, beden),
    [variants, renk, beden],
  );

  const soldOut =
    product.available === false ||
    (variants.length > 0 && variants.every((variant) => !variant.available));

  function handleAdd() {
    /* Seçim tamamlanmadan sepete eklenmiyor: eksik seçimde müşterinin
       istemediği ton ya da beden gönderilirdi. */
    if ((needsColor || needsSize) && !selected) {
      setWarn(true);
      return;
    }

    flyToCart(buttonRef.current, product.image);

    const variant = selected
      ? {
          sku: selected.sku,
          label: displayVariantLabel(selected),
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
      {needsColor && (
        <>
          <label className="option-label" id="renk-etiketi">
            Renk
          </label>
          <div className="sizes" role="radiogroup" aria-labelledby="renk-etiketi">
            {renkler.map((ad) => {
              const ayniRenk = variants.filter((variant) => variant.color === ad);
              const satilabilir = ayniRenk.some((variant) => variant.available);
              return (
                <button
                  type="button"
                  key={ad}
                  role="radio"
                  aria-checked={renk === ad}
                  data-selected={renk === ad}
                  /* Tükenen ton gizlenmiyor, seçilemiyor: müşteri hangi
                     tonun bittiğini görmeli. */
                  disabled={!satilabilir}
                  title={satilabilir ? undefined : "Bu ton tükendi"}
                  onClick={() => {
                    setRenk(ad);
                    setBeden(null);
                    setWarn(false);
                  }}
                >
                  {/* Ekranda okunan metin düzeltiliyor, seçim ham
                      değerle yapılıyor: aksi hâlde varyant bulunamazdı. */}
                  {renkAdi(ad)}
                </button>
              );
            })}
          </div>
        </>
      )}

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
                aria-checked={beden === variant.size}
                data-selected={beden === variant.size}
                /* Stokta olmayan beden seçilemez ama gizlenmez:
                   müşteri hangi bedenin tükendiğini görmeli. */
                disabled={!variant.available}
                title={variant.available ? undefined : "Bu beden tükendi"}
                onClick={() => {
                  setBeden(variant.size);
                  setWarn(false);
                }}
              >
                {variant.size}
              </button>
            ))}
          </div>
        </>
      )}

      {/*
        Uyarı beden bloğunun İÇİNDEYDİ: yalnızca renk seçilmesi gereken
        bir üründe (kozmetik) hiç görünmüyordu — düğmeye basılıyor,
        hiçbir şey olmuyordu. Artık ikisini de kapsıyor.
      */}
      {warn && (
        <p className="field-warn" role="alert">
          Sepete eklemeden önce {needsColor && needsSize ? "renk ve beden" : needsColor ? "bir renk" : "bir beden"} seçin.
        </p>
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
