"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { CartContext } from "@/components/cart";
import { flyToCart } from "@/lib/fly-to-cart";
import {
  displayVariantLabel,
  formatPrice,
  renkAdi,
  type Product,
} from "@/lib/product-types";
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
  varyantOkunamadi = false,
}: {
  product: Product;
  variants: Variant[];
  /** Seçenekler ArvoARC'tan okunamadı; hangi varyant olduğu bilinmiyor. */
  varyantOkunamadi?: boolean;
}) {
  const { add } = useContext(CartContext);
  const [renk, setRenk] = useState<string | null>(null);
  const [beden, setBeden] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [warn, setWarn] = useState(false);
  const [done, setDone] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const kutuRef = useRef<HTMLDivElement>(null);
  /*
    SABİT SATIN ALMA ÇUBUĞU (18.10.2026).

    Telefonda "Sepete ekle" ekranın ALTINDA kalıyordu: müşteri
    görsel, künye, başlık, alt başlık ve fiyatı geçip kaydırmak
    zorundaydı. Satın alma kutusu görüş alanından çıkınca ekranın
    altında fiyat ve düğme beliriyor.

    Ölçüt kutunun KENDİSİ, sayfa kaydırma miktarı değil: kaydırma
    eşiği ekran boyuna ve ürünün görsel sayısına göre değişiyor ve
    kısa sayfalarda çubuk hiç çıkmıyordu.
  */
  const [cubuk, setCubuk] = useState(false);

  useEffect(() => {
    const hedef = kutuRef.current;
    if (!hedef) return;

    const gozlemci = new IntersectionObserver(
      ([giris]) => setCubuk(!giris.isIntersecting),
      /* Kutunun son pikseli çıkınca değil, düğmesi çıkınca:
         üstteki seçenekler görünürken çubuk gereksiz. */
      { rootMargin: "-64px 0px 0px 0px" },
    );
    gozlemci.observe(hedef);
    return () => gozlemci.disconnect();
  }, []);

  /*
    Çubuk görünürken alt gezinme çubuğu iniyor: ikisi üst üste
    ekranın dörtte birini kaplıyordu. Gezinme bir kaydırma
    uzaklıkta; satın alma düğmesi parmağın altında kalmalı.
  */
  useEffect(() => {
    const govde = document.body;
    if (cubuk) govde.dataset.satinAlmaCubugu = "acik";
    else delete govde.dataset.satinAlmaCubugu;
    return () => {
      delete govde.dataset.satinAlmaCubugu;
    };
  }, [cubuk]);

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
      /* Çubuktan basıldığında seçenekler ekranda değil: uyarıyı
         göstermek tek başına yetmez, müşteriyi seçeneklere
         götürüyoruz. */
      kutuRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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

  /*
    SEÇENEKLER OKUNAMADIYSA SATIŞ KAPALI (17.10.2026).

    Önceden okuma hatası boş varyant listesine dönüşüyordu: kutu
    renk/beden sormuyor, sepete SKU yazılmıyor ve ArvoARC siparişi
    stokta olan herhangi bir varyanta bağlıyordu — müşteri seçmediği
    tonu alıyordu. "Tükendi" demek de yanlış olurdu; ürün tükenmiş
    değil, biz okuyamıyoruz.
  */
  if (varyantOkunamadi) {
    return (
      <div className="pdp-buy">
        <button className="btn btn-block" type="button" disabled>
          Seçenekler yüklenemedi
        </button>
        <p className="stock-line">
          Ürün seçenekleri şu anda alınamadı. Sayfayı yenileyin; sürerse
          bize yazın.
        </p>
      </div>
    );
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

  const fiyat = selected?.price ?? product.price;

  return (
    <div className="pdp-buy" ref={kutuRef}>
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

      {/*
        Sabit çubuk yalnızca TELEFONDA ve satın alma kutusu
        ekrandan çıkınca (CSS + gözlemci). Fiyat da burada:
        müşteri düğmeye basarken ne ödeyeceğini görmeli, seçilen
        varyantın fiyatı ürün fiyatından farklı olabiliyor.
      */}
      <div className="pdp-sticky" data-acik={cubuk ? "evet" : "hayir"} aria-hidden={!cubuk}>
        <span className="pdp-sticky-fiyat">
          <small>{selected ? displayVariantLabel(selected) : "Fiyat"}</small>
          <b>{formatPrice(fiyat)}</b>
        </span>
        <button
          type="button"
          className="btn"
          onClick={handleAdd}
          tabIndex={cubuk ? 0 : -1}
        >
          {done ? "Eklendi ✓" : "Sepete ekle"}
        </button>
      </div>
    </div>
  );
}
