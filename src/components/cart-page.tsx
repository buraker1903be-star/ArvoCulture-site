"use client";

import { useParaBirimi } from "@/components/para-birimi";
import { dilOneki } from "@/lib/dil-onek";

import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { CartContext, cartKey } from "@/components/cart";
import { CheckoutSteps } from "@/components/checkout-steps";
import { amountToFreeShipping, shippingFor, toKurus } from "@/lib/order-quote";
import {
  readCoupon,
  writeCoupon,
  clearCoupon,
  readNote,
  writeNote,
} from "@/lib/cart-extras";

/** Kargo kuralı ArvoARC’taki sipariş fonksiyonuyla aynı tutulmalıdır. */

/**
 * Sepet sayfası.
 *
 * Çekmece hızlı bakış içindir; bu sayfa düzenleme içindir.
 * Kupon kodu ve müşteri notu burada girilir, ödeme adımına
 * taşınır.
 *
 * Kuponun geçerliliği burada doğrulanmaz — indirim tutarını ArvoARC
 * hesaplar. Burada yalnızca kod saklanır; aksi hâlde istemcide
 * hesaplanan bir indirim gerçek tutarla çelişebilirdi.
 */
export function CartPageView() {
  /* Fiyatlar seçili para biriminde (para-birimi.tsx). */
  const { yaz, paraBirimi, t, dil } = useParaBirimi();
  /*
    BAĞLANTI ÖNEKİ DE DİLE BAĞLI. Sepet ve ödeme metinleri zaten
    İngilizceydi (dil para birimi seçiminden geliyor), ama
    bağlantılar öneksizdi: İngilizce sepetten "ödemeye geç" diyen
    müşteri TÜRKÇE ödeme sayfasına düşüyordu. Yarım çeviri değil,
    akışın ortasında dil değiştirmek.
  */
  const onek = dilOneki(dil);
  const { items, total, remove, setQuantity, salesRules } = useContext(CartContext);

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
  const [couponFreeShipping, setCouponFreeShipping] = useState(false);

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
          /*
            ArvoARC'ın kupon ucu ara toplamı KURUŞ bekliyor (arc_check_coupon
            onu kuruş cinsinden minimum_subtotal ile karşılaştırıyor).
            Önceden TL gönderiliyordu: 2.500 TL'lik sepet 25 TL gibi
            değerlendiriliyor, alt limitli kuponlar hak eden sepetlerde
            "… ve üzeri sepetlerde geçerli" diye reddediliyordu.
          */
          body: JSON.stringify({ code, subtotal: toKurus(total) }),
        },
      );

      const data = (await response.json()) as {
        valid?: boolean;
        message?: string;
        discountAmount?: number;
        freeShipping?: boolean;
      };

      if (!data.valid) {
        setCouponState("error");
        setCouponMessage(data.message ?? t("kodGecersiz"));
        return;
      }

      writeCoupon(code);
      setCouponSaved(true);
      // discountAmount kuruş döner.
      setCouponDiscount(Number(data.discountAmount ?? 0) / 100);
      setCouponFreeShipping(Boolean(data.freeShipping));
      setCouponState("idle");
      setCouponMessage(data.message ?? t("kodUygulandi"));
    } catch {
      setCouponState("error");
      setCouponMessage(t("kodDogrulanamadi"));
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
    setNote(readNote());
  }, []);

  const shipping = shippingFor(total, couponSaved && couponFreeShipping, salesRules);
  const remaining = amountToFreeShipping(total, couponSaved && couponFreeShipping, salesRules);
  /* Dolar modunda kargo ödeme adımında belirleniyor: yurtdışı
     tarifesi ancak ülke seçilince biliniyor ve yurt içi ücretini
     dolara çevirip göstermek sepette 3 dolar, ödemede 25 dolar
     demekti (ayrıntı: components/cart-drawer). */
  const kargoSonra = paraBirimi === "USD";

  if (items.length === 0) {
    return (
      <section className="panel order-result">
        <p className="about-eyebrow">{t("sepetim")}</p>
        <h1>{t("sepetBosBaslik")}</h1>
        <p>{t("sepetBosAciklama")}</p>
        <div className="order-actions">
          <Link className="btn" href={`${onek}/koleksiyon/tumu`}>
            {t("alisverisBasla")}
          </Link>
          <Link href={`${onek}/koleksiyon/firsatlar`}>{t("indirimdekiUrunler")}</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="panel about-hero detail-hero">
        <CheckoutSteps current="sepet" />
        <h1>{t("secimleriTamamla")}</h1>
      </section>

      <div className="cart-layout">
        <div className="cart-main">
          <section className="panel">
            <div className="head">
              <div>
                <h2>{t("urunler")}</h2>
                <p>
                  {t("cesitAdet")
                    .replace("{c}", String(items.length))
                    .replace(
                      "{a}",
                      String(items.reduce((sum, item) => sum + item.quantity, 0)),
                    )}
                </p>
              </div>
            </div>

            <ul className="cart-items">
              {items.map((item) => (
                <li key={cartKey(item)} className="cart-item">
                  {/* Görsel bağlantısı ürün adıyla aynı yere gidiyor;
                      ekran okuyucu ve Tab sırasında tekrar etmesin. */}
                  <Link
                    href={`/urun/${item.slug}`}
                    className="cart-thumb"
                    aria-hidden="true"
                    tabIndex={-1}
                  >
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
                        aria-label={t("azalt")}
                        onClick={() => setQuantity(cartKey(item), item.quantity - 1)}
                      >
                        −
                      </button>
                      <b>{item.quantity}</b>
                      <button
                        type="button"
                        aria-label={t("artir")}
                        onClick={() => setQuantity(cartKey(item), item.quantity + 1)}
                      >
                        +
                      </button>
                    </span>
                  </div>

                  <div className="cart-item-price">
                    <b>{yaz(item.price * item.quantity)}</b>
                    <small>
                      {yaz(item.price)} {t("birimFiyat")}
                    </small>
                    <button
                      type="button"
                      className="remove-item"
                      onClick={() => remove(cartKey(item))}
                    >
                      {t("kaldir")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <div className="head">
              <div>
                <h2>{t("siparisNotu")}</h2>
                <p>{t("siparisNotuAciklama")}</p>
              </div>
            </div>

            <textarea
              className="cart-note"
              aria-label={t("siparisNotu")}
              rows={3}
              maxLength={500}
              placeholder={t("siparisNotuOrnek")}
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
                {noteSaved ? t("notKaydedildi") : t("notuKaydet")}
              </button>
            </div>
          </section>
        </div>

        <aside className="panel cart-summary">
          <div className="head">
            <h2>{t("ozet")}</h2>
          </div>

          {/* İndirim kodu. Geçerliliği ödeme adımında sunucuda
              doğrulanır; burada yalnızca saklanır. */}
          <div className="coupon-form">
            <input
              type="text"
              placeholder={t("indirimKodu")}
              aria-label={t("indirimKodu")}
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
                {t("kaldir")}
              </button>
            ) : (
              <button
                type="button"
                className="btn"
                disabled={!coupon.trim() || couponState === "checking"}
                onClick={applyCoupon}
              >
                {couponState === "checking" ? t("kontrolEdiliyor") : t("uygula")}
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
                ? t("kodUygulandiIndirim").replace("{tutar}", yaz(couponDiscount))
                : t("kodUygulandi")}
            </p>
          )}

          <dl className="summary-totals">
            <div>
              <dt>{t("araToplam")}</dt>
              <dd>{yaz(total)}</dd>
            </div>
            <div>
              <dt>{t("kargo")}</dt>
              <dd>
                {kargoSonra
                  ? t("odemeAdiminda")
                  : shipping === 0
                    ? t("ucretsiz")
                    : yaz(shipping)}
              </dd>
            </div>
            <div className="grand">
              <dt>{t("toplam")}</dt>
              <dd>{yaz(total + (kargoSonra ? 0 : shipping))}</dd>
            </div>
          </dl>

          {!kargoSonra && remaining > 0 && (
            <p className="hint">
              {t("ucretsizKargoyaKalan").replace("{tutar}", yaz(remaining))}
            </p>
          )}

          <Link className="btn btn-block" href={`${onek}/odeme`}>
            {t("odemeyeGec")}
          </Link>

          <Link className="drawer-link" href={`${onek}/koleksiyon/tumu`}>
            {t("alisverisseDevam")}
          </Link>
        </aside>
      </div>
    </>
  );
}
