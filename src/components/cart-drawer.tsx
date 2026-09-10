"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CartContext, cartKey } from "@/components/cart";
import { formatPrice } from "@/lib/product-types";
import { evaluateCoupon } from "@/lib/coupon";
import { readCoupon, writeCoupon, clearCoupon } from "@/lib/cart-extras";
import { useLayerBack } from "@/lib/use-layer-back";

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
  const { items, total, remove, setQuantity, discounts } =
    useContext(CartContext);
  const [code, setCode] = useState("");
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Portal yalnızca tarayıcıda kurulabilir; ilk render’dan sonra
  // bir kez işaretlenir. Kayıtlı kupon da burada okunur.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setCode(readCoupon());
  }, []);

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

  /* Telefonda geri hareketi çekmeceyi kapatsın, siteyi değil. */
  useLayerBack(open, close);

  if (!open || !mounted) return null;

  /*
    Kupon her tuşta yeniden değerlendirilir; müşteri kodu yazar
    yazmaz indirimi görüyor. Değerlendirme yalnızca gösterim
    içindir — gerçek tutarı ARC hesaplar.
  */
  const coupon = code.trim() ? evaluateCoupon(discounts, code, total) : null;
  const discount = coupon?.ok ? coupon.amount : 0;
  const afterDiscount = Math.max(total - discount, 0);
  const freeShipping = coupon?.ok ? coupon.freeShipping : false;
  const shipping =
    freeShipping || afterDiscount >= FREE_OVER ? 0 : SHIPPING_FEE;
  const remaining = Math.max(FREE_OVER - afterDiscount, 0);

  /*
    Çekmece doğrudan <body> altına basılır. Başlık `position:
    sticky` ve `z-index: 40` ile kendi yığın bağlamını oluşturuyor;
    çekmece onun içinde kalsaydı z-index değeri ne olursa olsun
    sayfa içeriğinin arkasında görünürdü.
  */
  return createPortal(
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
                <li key={cartKey(item)}>
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
                    {/* Beden bilgisi satırda görünsün. */}
                    {item.variantLabel && <small>{item.variantLabel}</small>}
                    <span className="quantity">
                      <button
                        type="button"
                        aria-label="Azalt"
                        onClick={() =>
                          setQuantity(cartKey(item), item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <b>{item.quantity}</b>
                      <button
                        type="button"
                        aria-label="Artır"
                        onClick={() =>
                          setQuantity(cartKey(item), item.quantity + 1)
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
                      onClick={() => remove(cartKey(item))}
                    >
                      Kaldır
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="drawer-foot">
              {/* İndirim kodu: yazıldığı anda uygulanır. */}
              <div className="coupon-form">
                <input
                  type="text"
                  placeholder="İndirim kodu"
                  value={code}
                  onChange={(event) => {
                    const next = event.target.value.toUpperCase();
                    setCode(next);
                    if (next.trim()) writeCoupon(next);
                    else clearCoupon();
                  }}
                />
                {code.trim() && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setCode("");
                      clearCoupon();
                    }}
                  >
                    Sil
                  </button>
                )}
              </div>

              {coupon && !coupon.ok && (
                <p className="coupon-warn">{coupon.reason}</p>
              )}
              {coupon?.ok && (
                <p className="cart-saving">{coupon.label} uygulandı.</p>
              )}

              <dl className="summary-totals">
                <div>
                  <dt>Ara toplam</dt>
                  <dd>{formatPrice(total)}</dd>
                </div>
                {discount > 0 && (
                  <div className="is-discount">
                    <dt>İndirim</dt>
                    <dd>−{formatPrice(discount)}</dd>
                  </div>
                )}
                <div>
                  <dt>Kargo</dt>
                  <dd>
                    {shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}
                  </dd>
                </div>
                <div className="grand">
                  <dt>Toplam</dt>
                  <dd>{formatPrice(afterDiscount + shipping)}</dd>
                </div>
              </dl>
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
    </div>,
    document.body,
  );
}
