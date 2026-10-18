"use client";

import { useCallback, useEffect, useState } from "react";
import { LiveSearch } from "@/components/live-search";
import { Layer } from "@/components/layer";

/**
 * Arama katmanı.
 *
 * Kutuya ya da başlıktaki büyütece basıldığında sayfayı terk
 * etmek yerine tam ekran bir katman açılır. İçindeki arama ilk
 * harften itibaren sonuç gösterir; müşteri aradığını bulamazsa
 * Escape’e basıp kaldığı yerden devam eder.
 *
 * Katmanın kendisi `components/layer`: portal, Escape, kaydırma
 * kilidi ve geri hareketi orada ve favorilerle paylaşılıyor.
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
   *   geri tuşuyla dönüyordu.
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

      <Layer
        open={open}
        onClose={close}
        label="Arama"
        head={
          /*
            Sık arananlar ve son gezilenler arama bileşeninin
            içinde: yazmaya başlayınca kayboluyor, sonuçları aşağı
            itmiyor. Tıklanan terim katmandan çıkmadan aramaya
            yazılıyor.
          */
          <LiveSearch
            autoFocus
            onNavigate={close}
            limit={10}
            suggestions={terms}
          />
        }
      />
    </>
  );
}
