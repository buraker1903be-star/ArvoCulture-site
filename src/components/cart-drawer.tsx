"use client";

import { useParaBirimi } from "@/components/para-birimi";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CartContext, cartKey } from "@/components/cart";
import { evaluateCoupon, kuponaTabiToplam } from "@/lib/coupon";
import { readCoupon, writeCoupon, clearCoupon } from "@/lib/cart-extras";
import { useLayerBack } from "@/lib/use-layer-back";
import { amountToFreeShipping, shippingFor } from "@/lib/order-quote";


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
  /* Fiyatlar seçili para biriminde (para-birimi.tsx). */
  const { yaz, paraBirimi, t } = useParaBirimi();
  const { items, total, remove, setQuantity, discounts, salesRules } =
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
    içindir — gerçek tutarı ArvoARC hesaplar.
  */
  /* İndirimli satırlar kupona girmiyor (kupon "birleşebilir"
     işaretli değilse); kural lib/coupon'da ve ArvoARC'ın sipariş
     fonksiyonunda AYNI. */
  const adet = items.reduce((t, satir) => t + satir.quantity, 0);
  const kuponaTabi = kuponaTabiToplam(items);
  const coupon = code.trim()
    ? evaluateCoupon(discounts, code, total, kuponaTabi)
    : null;
  const discount = coupon?.ok ? coupon.amount : 0;
  const afterDiscount = Math.max(total - discount, 0);
  const freeShipping = coupon?.ok ? coupon.freeShipping : false;
  // Eşik indirim ÖNCESİ ara toplamla karşılaştırılır (ArvoARC ile aynı):
  // kupon kullanmak ücretsiz kargoyu kaybettirmemeli.
  const shipping = shippingFor(total, freeShipping, salesRules);
  const remaining = amountToFreeShipping(total, freeShipping, salesRules);
  /*
    DOLAR MODUNDA KARGO ÖDEME ADIMINDA BELİRLENİYOR.

    Burada yurt içi tarifesi (120 TL) yazılıyordu ve dolar modunda
    "$3,15" olarak görünüyordu; oysa yurtdışı tarifesi onun on katı ve
    ancak müşteri ÜLKESİNİ seçince bilinebiliyor. Sepette 3 dolar
    görüp ödemede 25 dolar bulmak, bu depodaki en pahalı kusurların
    kalıbı. TL eşiğine dayanan "şu kadar daha ekleyin" şeridi de aynı
    sebeple dolar modunda çizilmiyor.

    Dolar modu yurt içi müşteriyi de kapsıyor (TL'den dolara geçmek
    serbest) ve onun için küçük bir kayıp: kesin ücreti bir adım
    sonra görüyor. Karşılığı, yurtdışı müşterisine hiç yanlış rakam
    göstermemek.
  */
  const kargoSonra = paraBirimi === "USD";

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
      aria-label={t("sepet")}
    >
      <button
        type="button"
        className="drawer-veil"
        aria-label={t("sepetiKapat")}
        onClick={close}
      />

      <aside className="drawer">
        <header className="drawer-head">
          {/* Sayı başlıkta: müşteri kaç kalemi olduğunu listeyi
              saymadan görüyor. */}
          <h2>
            {t("sepetim")}
            {items.length > 0 && (
              <span className="drawer-sayi">
                {t(adet === 1 ? "urunSayisiTek" : "urunSayisi").replace(
                  "{n}",
                  String(adet),
                )}
              </span>
            )}
          </h2>
          <button type="button" onClick={close}>
            {t("kapat")}
          </button>
        </header>

        {items.length === 0 ? (
          <div className="drawer-empty">
            <p>{t("sepetBos")}</p>
            <Link className="btn" href="/koleksiyon/tumu" onClick={close}>
              {t("alisverisBasla")}
            </Link>
          </div>
        ) : (
          <>
            {/*
              Ücretsiz kargoya kalan tutar: en etkili sepet büyütme
              aracı. Altındaki çizgi eşiğe ne kadar yaklaşıldığını
              gösteriyor; eşik geçilince mesaj kaybolmak yerine
              müşteriye kargonun ücretsiz olduğunu söylüyor.
            */}
            {!kargoSonra && (
            <div
              className="drawer-nudge"
              /* Eşik geçilince şerit yeşile dönüyor: "kazandın"
                 demenin en kısa yolu. */
              data-ucretsiz={shipping === 0 ? "" : undefined}
            >
              <p>
                {shipping === 0 ? (
                  t("kargonuzUcretsiz")
                ) : (
                  <>
                    <b>{yaz(remaining)}</b> daha ekleyin, kargo
                    ücretsiz olsun.
                  </>
                )}
              </p>
              <span className="drawer-progress" aria-hidden="true">
                <i
                  style={{
                    width: `${shipping === 0 ? 100 : Math.min(100, (total / salesRules.freeShippingOver) * 100)}%`,
                  }}
                />
              </span>
            </div>
            )}

            <ul className="drawer-items">
              {items.map((item) => (
                <li key={cartKey(item)}>
                  <Link
                    href={`/urun/${item.slug}`}
                    className="drawer-thumb"
                    onClick={close}
                    aria-hidden="true"
                    tabIndex={-1}
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
                        aria-label={t("azalt")}
                        onClick={() =>
                          setQuantity(cartKey(item), item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <b>{item.quantity}</b>
                      <button
                        type="button"
                        aria-label={t("artir")}
                        onClick={() =>
                          setQuantity(cartKey(item), item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </span>
                  </div>

                  <div className="drawer-price">
                    <b>{yaz(item.price * item.quantity)}</b>
                    {/*
                      ÜSTÜ ÇİZİLİ FİYAT SEPETTE DE GÖRÜNÜYOR.
                      Müşteri indirimi karttan hatırlıyordu; sepete
                      girince kazancı kayboluyordu. Aynı alan
                      kuponun o satıra uygulanıp uygulanmayacağını
                      da belirliyor (lib/coupon).
                    */}
                    {item.oldPrice && item.oldPrice > item.price && (
                      <s>{yaz(item.oldPrice * item.quantity)}</s>
                    )}
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

            <footer className="drawer-foot">
              {/* İndirim kodu: yazıldığı anda uygulanır. */}
              <div className="coupon-form">
                <input
                  type="text"
                  placeholder={t("indirimKodu")}
                  aria-label={t("indirimKodu")}
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
                    {t("sil")}
                  </button>
                )}
              </div>

              {coupon && !coupon.ok && (
                <p className="coupon-warn">{coupon.reason}</p>
              )}
              {coupon?.ok && (
                <p className="cart-saving">{t("kuponUygulandi").replace("{kod}", coupon.label)}</p>
              )}

              {/*
                KUPON NEDEN DAHA AZ İNDİRDİ?

                Kupon birleşmiyorsa indirimli satırlar hesaba
                girmiyor (ArvoARC'ta da öyle) ama müşteri bunu
                yalnızca rakamdan anlıyordu: "%10 girdim, %10
                düşmedi". Sepette indirimli ürün VARSA ve kupon
                uygulandıysa sebebi yazıyor.
              */}
              {coupon?.ok && kuponaTabi < total && (
                <p className="coupon-note">
                  {t("kuponHaricTutuldu").replace("{tutar}", yaz(kuponaTabi))}
                </p>
              )}

              <dl className="summary-totals">
                <div>
                  <dt>{t("araToplam")}</dt>
                  <dd>{yaz(total)}</dd>
                </div>
                {discount > 0 && (
                  <div className="is-discount">
                    <dt>{t("indirim")}</dt>
                    <dd>−{yaz(discount)}</dd>
                  </div>
                )}
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
                  <dd>{yaz(afterDiscount + (kargoSonra ? 0 : shipping))}</dd>
                </div>
              </dl>
              <Link className="btn btn-block" href="/odeme" onClick={close}>
                {t("odemeyeGec")}
              </Link>
              <Link className="drawer-link" href="/sepet" onClick={close}>
                {t("sepetDetayi")}
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>,
    document.body,
  );
}
