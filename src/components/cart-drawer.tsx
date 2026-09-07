"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useContext, useEffect, useState } from "react";
import { CartContext } from "@/components/cart";
import { formatPrice } from "@/lib/product-types";

const SHIPPING_FEE = 120;
const FREE_OVER = 2000;

/**
 * Sepet çekmecesi.
 *
 * Başlıktaki sepet ikonuna basıldığında sağdan açılır. Müşteri
 * sayfayı terk etmeden sepetini görüyor; ürün eklemeye devam
 * edebiliyor. Sepet sayfası ayrıca duruyor, çekmeceden oraya
 * geçilebiliyor.
 */
export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, total, remove, setQuantity } = useContext(CartContext);
  const [closing, setClosing] = useState(false);

  const close = useCallback(() => {
    // Kapanış animasyonu bitmeden bileşen kaldırılmasın.
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 220);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  if (!open) return null;

  const shipping = total >= FREE_OVER ? 0 : SHIPPING_FEE;
  const remaining = Math.max(FREE_OVER - total, 0);

  return (
    <div
      className={`drawer-layer${closing ? " is-closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Sepet"
    >
      <button
        type="button"
        className="drawer-veil"
        aria-label="Sepeti kapat"
        onClick={close}
      />

      <aside className="drawer">
        <header className="drawer-head">
          <h2>Sepetim</h2>
          <button type="button" onClick={close} aria-label="Kapat">
            ✕
          </button>
        </header>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <p>Sepetiniz boş.</p>
            <Link className="btn" href="/koleksiyon/tumu" onClick={close}>
              Alışverişe başla
            </Link>
          </div>
        ) : (
          <>
            {/* Ücretsiz kargoya kalan tutar: en etkili sepet
                büyütme aracı. */}
            {remaining > 0 && (
              <p className="drawer-nudge">
                <b>{formatPrice(remaining)}</b> daha ekleyin, kargo ücretsiz
                olsun.
              </p>
            )}

            <ul className="drawer-items">
              {items.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/urun/${item.slug}`}
                    className="drawer-thumb"
                    onClick={close}
                  >
                    {item.image && (
                      <Image src={item.image} alt="" fill sizes="64px" />
                    )}
                  </Link>

                  <div className="drawer-text">
                    <Link href={`/urun/${item.slug}`} onClick={close}>
                      {item.name}
                    </Link>
                    <span className="quantity">
                      <button
                        type="button"
                        aria-label="Azalt"
                        onClick={() =>
                          setQuantity(item.slug, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <b>{item.quantity}</b>
                      <button
                        type="button"
                        aria-label="Artır"
                        onClick={() =>
                          setQuantity(item.slug, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </span>
                  </div>

                  <div className="drawer-price">
                    <b>{formatPrice(item.price * item.quantity)}</b>
                    <button
                      type="button"
                      className="remove-item"
                      onClick={() => remove(item.slug)}
                    >
                      Kaldır
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="drawer-foot">
              <div className="drawer-total">
                <span>Ara toplam</span>
                <b>{formatPrice(total)}</b>
              </div>
              <p className="hint">
                {shipping === 0
                  ? "Kargo ücretsiz."
                  : `Kargo ${formatPrice(shipping)} · vergiler dahildir.`}
              </p>
              <Link className="btn btn-block" href="/odeme" onClick={close}>
                Ödemeye geç
              </Link>
              <Link className="drawer-link" href="/sepet" onClick={close}>
                Sepet detayına git
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
