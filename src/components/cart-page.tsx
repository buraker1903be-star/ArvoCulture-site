"use client";

import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { CartContext, cartKey } from "@/components/cart";
import { formatPrice } from "@/lib/product-types";
import {
  readCoupon,
  writeCoupon,
  clearCoupon,
  readNote,
  writeNote,
} from "@/lib/cart-extras";

/** Kargo kuralı ARC’taki sipariş fonksiyonuyla aynı tutulmalıdır. */
const SHIPPING_FEE = 120;
const FREE_OVER = 2000;

/**
 * Sepet sayfası.
 *
 * Çekmece hızlı bakış içindir; bu sayfa düzenleme içindir.
 * Kupon kodu ve müşteri notu burada girilir, ödeme adımına
 * taşınır.
 *
 * Kuponun geçerliliği burada doğrulanmaz — indirim tutarını ARC
 * hesaplar. Burada yalnızca kod saklanır; aksi hâlde istemcide
 * hesaplanan bir indirim gerçek tutarla çelişebilirdi.
 */
export function CartPageView() {
  const { items, total, remove, setQuantity } = useContext(CartContext);

  const [coupon, setCoupon] = useState("");
  const [couponSaved, setCouponSaved] = useState(false);
  /*
    Kupon anında doğrulanıyor. Öncesinde yalnızca kaydediliyordu
    ve geçersizse ödeme adımında sessizce yok sayılıyordu;
    müşteri indirim aldığını sanıyordu.
  */
  const [couponState, setCouponState] = useState<
    "idle" | "checking" | "error"
  >("idle");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);

  async function applyCoupon() {
    const code = coupon.trim();
    if (!code) return;

    setCouponState("checking");
    setCouponMessage("");

    try {
      const response = await fetch(
        "https://arc.arvo-os.com/api/storefront/kupon",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, subtotal: total }),
        },
      );

      const data = (await response.json()) as {
        valid?: boolean;
        message?: string;
        discountAmount?: number;
      };

      if (!data.valid) {
        setCouponState("error");
        setCouponMessage(data.message ?? "Bu kod geçerli değil.");
        return;
      }

      writeCoupon(code);
      setCouponSaved(true);
      setCouponDiscount(Number(data.discountAmount ?? 0));
      setCouponState("idle");
      setCouponMessage(data.message ?? "Kod uygulandı.");
    } catch {
      setCouponState("error");
      setCouponMessage("Kod şu anda doğrulanamıyor. Tekrar deneyin.");
    }
  }
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  useEffect(() => {
    /*
      localStorage sunucuda okunamaz; değerler ilk render’dan
      sonra yüklenir. Tek seferlik başlangıç değeri olduğu için
      zincirleme render riski yok.
    */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCoupon(readCoupon());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNote(readNote());
  }, []);

  const shipping = total >= FREE_OVER ? 0 : SHIPPING_FEE;
  const remaining = Math.max(FREE_OVER - total, 0);

  if (items.length === 0) {
    return (
      <section className="panel order-result">
        <p className="about-eyebrow">Sepetim</p>
        <h1>Sepetiniz boş.</h1>
        <p>
          Seçkimize göz atın; beğendiğiniz ürünleri buradan
          tamamlayabilirsiniz.
        </p>
        <div className="order-actions">
          <Link className="btn" href="/koleksiyon/tumu">
            Alışverişe başla
          </Link>
          <Link href="/koleksiyon/firsatlar">İndirimdeki ürünler</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="panel about-hero detail-hero">
        <p className="about-eyebrow">Sepetim</p>
        <h1>Seçimlerinizi tamamlayın.</h1>
      </section>

      <div className="cart-layout">
        <div className="cart-main">
          <section className="panel">
            <div className="head">
              <div>
                <h2>Ürünler</h2>
                <p>
                  {items.length} çeşit ·{" "}
                  {items.reduce((sum, item) => sum + item.quantity, 0)} adet
                </p>
              </div>
            </div>

            <ul className="cart-items">
              {items.map((item) => (
                <li key={cartKey(item)} className="cart-item">
                  <Link href={`/urun/${item.slug}`} className="cart-thumb">
                    {item.image && (
                      <Image src={item.image} alt="" fill sizes="88px" />
                    )}
                  </Link>

                  <div className="cart-item-text">
                    <small>{item.eyebrow}</small>
                    <Link href={`/urun/${item.slug}`}>{item.name}</Link>
                    {item.variantLabel && (
                      <small className="cart-variant">{item.variantLabel}</small>
                    )}
                    <span className="quantity">
                      <button
                        type="button"
                        aria-label="Azalt"
                        onClick={() => setQuantity(cartKey(item), item.quantity - 1)}
                      >
                        −
                      </button>
                      <b>{item.quantity}</b>
                      <button
                        type="button"
                        aria-label="Artır"
                        onClick={() => setQuantity(cartKey(item), item.quantity + 1)}
                      >
                        +
                      </button>
                    </span>
                  </div>

                  <div className="cart-item-price">
                    <b>{formatPrice(item.price * item.quantity)}</b>
                    <small>{formatPrice(item.price)} / adet</small>
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
          </section>

          <section className="panel">
            <div className="head">
              <div>
                <h2>Sipariş notu</h2>
                <p>Teslimatla ilgili iletmek istediğiniz bir şey var mı?</p>
              </div>
            </div>

            <textarea
              className="cart-note"
              rows={3}
              maxLength={500}
              placeholder="Örneğin: Kapıcıya teslim edilebilir, öğleden sonra evdeyim…"
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                setNoteSaved(false);
              }}
            />

            <div className="cart-note-foot">
              <small>{note.length} / 500</small>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  writeNote(note);
                  setNoteSaved(true);
                }}
              >
                {noteSaved ? "Not kaydedildi ✓" : "Notu kaydet"}
              </button>
            </div>
          </section>
        </div>

        <aside className="panel cart-summary">
          <div className="head">
            <h2>Özet</h2>
          </div>

          {/* İndirim kodu. Geçerliliği ödeme adımında sunucuda
              doğrulanır; burada yalnızca saklanır. */}
          <div className="coupon-form">
            <input
              type="text"
              placeholder="İndirim kodu"
              value={coupon}
              onChange={(event) => {
                setCoupon(event.target.value.toUpperCase());
                setCouponSaved(false);
              }}
            />
            {couponSaved ? (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  clearCoupon();
                  setCoupon("");
                  setCouponSaved(false);
                }}
              >
                Kaldır
              </button>
            ) : (
              <button
                type="button"
                className="btn"
                disabled={!coupon.trim() || couponState === "checking"}
                onClick={applyCoupon}
              >
                {couponState === "checking" ? "Kontrol ediliyor…" : "Uygula"}
              </button>
            )}
          </div>

          {couponState === "error" && (
            <p className="form-error" role="alert">
              {couponMessage}
            </p>
          )}

          {couponSaved && couponState !== "error" && (
            <p className="cart-saving">
              {couponDiscount > 0
                ? `Kod uygulandı · ${formatPrice(couponDiscount)} indirim`
                : "Kod uygulandı."}
            </p>
          )}

          <dl className="summary-totals">
            <div>
              <dt>Ara toplam</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
            <div>
              <dt>Kargo</dt>
              <dd>{shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}</dd>
            </div>
            <div className="grand">
              <dt>Toplam</dt>
              <dd>{formatPrice(total + shipping)}</dd>
            </div>
          </dl>

          {remaining > 0 && (
            <p className="hint">
              {formatPrice(remaining)} daha ekleyin, kargo ücretsiz olsun.
            </p>
          )}

          <Link className="btn btn-block" href="/odeme">
            Ödemeye geç
          </Link>

          <Link className="drawer-link" href="/koleksiyon/tumu">
            Alışverişe devam et
          </Link>
        </aside>
      </div>
    </>
  );
}
