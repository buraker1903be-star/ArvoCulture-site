"use client";

import { useCallback, useEffect, useState } from "react";
import { LiveSearch } from "@/components/live-search";
import { useLayerBack } from "@/lib/use-layer-back";

/**
 * Arama katmanı.
 *
 * Kutuya basıldığında sayfayı terk etmek yerine tam ekran bir
 * katman açılır. İçindeki arama ilk harften itibaren sonuç
 * gösterir; müşteri aradığını bulamazsa Escape’e basıp kaldığı
 * yerden devam eder.
 */
export function SearchOverlay({
  terms,
  trigger = "box",
}: {
  /** Popüler arama terimleri. */
  terms: string[];
  /**
   * Katmanı açan düğmenin biçimi.
   *
   * "box": ana sayfadaki geniş arama kutusu.
   * "icon": başlıktaki büyüteç. Önceden /arama sayfasına
   *   GİDİYORDU — müşteri sayfayı terk ediyor, aradığını bulamazsa
   *   geri tuşuyla dönüyordu. Katman aynı işi sayfadan çıkmadan
   *   yapıyor ve ana sayfadaki kutuyla aynı deneyimi veriyor.
   *
   * Alt çubuktaki "Ara" sekmesi de buraya bağlı: `arvo:search`
   * olayını YALNIZCA ikon sürümü dinliyor, yoksa ana sayfadaki
   * ikinci kopya da açılır ve üst üste iki katman oluşurdu.
   */
  trigger?: "box" | "icon";
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    // Katman açıkken arka plan kaymasın ve Escape kapatsın.
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

  /* Geri hareketi arama katmanını kapatsın, sayfayı terk etmesin. */
  useLayerBack(open, close);

  /*
    Alt çubuğun "Ara" sekmesi olayla açıyor; menü ve sepet de aynı
    desende (bkz. bottom-nav). Başlık ile alt çubuk ayrı
    bileşenler ve ortak bir durum sarmalayıcısı kurmak yerine tek
    yönlü bir olayla bağlanıyorlar.
  */
  useEffect(() => {
    if (trigger !== "icon") return;
    const ac = () => setOpen(true);
    window.addEventListener("arvo:search", ac);
    return () => window.removeEventListener("arvo:search", ac);
  }, [trigger]);

  return (
    <>
      {trigger === "icon" ? (
        <button
          type="button"
          className="header-action-link"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-label="Ara"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <span>Ara</span>
        </button>
      ) : (
        <button
          type="button"
          className="search-box"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
        >
          <span>Ürün, marka veya kategori ara</span>
          <em>Ara</em>
        </button>
      )}

      {open && (
        <div
          className="search-layer"
          role="dialog"
          aria-modal="true"
          aria-label="Arama"
        >
          <button
            type="button"
            className="search-veil"
            aria-label="Aramayı kapat"
            onClick={close}
          />

          <div className="search-sheet">
            <div className="search-head">
              <LiveSearch
                autoFocus
                onNavigate={close}
                limit={10}
                suggestions={terms}
              />
              {/*
                Kapat yuvarlak ve çarpılı: "Temizle" ile aynı
                biçimde iki soluk hap yan yana duruyordu ve hangisi
                hangisi belli olmuyordu. Çarpı, katmanı kapatmanın
                evrensel işareti; metin erişilebilir etikette
                duruyor.
              */}
              <button
                type="button"
                className="search-close"
                onClick={close}
                aria-label="Aramayı kapat"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            {/*
              Sık arananlar arama bileşeninin içinde: yazmaya
              başlayınca kayboluyor, sonuçları aşağı itmiyor.
              Tıklanan terim katmandan çıkmadan aramaya yazılıyor.
            */}
          </div>
        </div>
      )}
    </>
  );
}
