"use client";

import { useCallback, useState } from "react";
import { Layer } from "@/components/layer";
import { FavouritesView } from "@/components/favourites-view";

/**
 * Beğendiklerim katmanı.
 *
 * Başlıktaki kalp /favoriler sayfasına GİDİYORDU: müşteri baktığı
 * listeyi ya da ürünü terk ediyor, favorilerine bakıp geri tuşuyla
 * dönmek zorunda kalıyordu. Oysa favorilere bakmak çoğu zaman bir
 * KARŞILAŞTIRMA: "bunu mu alsam, beğendiğim ötekini mi". Sayfadan
 * çıkmak o karşılaştırmayı bozuyordu.
 *
 * Arama katmanıyla aynı kabuk (components/layer): portal, Escape,
 * kaydırma kilidi ve geri hareketi orada.
 *
 * /favoriler sayfası DURUYOR: hesap ekranından ve doğrudan
 * adresten açılabiliyor.
 */
export function FavouritesOverlay() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        className="header-action-link"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Beğendiklerim"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M12 20.4 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13z" />
        </svg>
        <span>Beğendiklerim</span>
      </button>

      <Layer
        open={open}
        onClose={close}
        label="Beğendiklerim"
        head={
          <div className="layer-title">
            <h2>Beğendiklerim</h2>
          </div>
        }
      >
        {/* Liste bileşeni sayfayla ORTAK: iki kopya, birinde
            düzeltilen bir durumun (okunamadı / boş / dolu)
            öbüründe kalması demekti. */}
        <FavouritesView />
      </Layer>
    </>
  );
}
