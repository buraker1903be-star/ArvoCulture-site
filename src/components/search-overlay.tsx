"use client";

import Link from "next/link";

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
}: {
  /** Popüler arama terimleri. */
  terms: string[];
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

  return (
    <>
      <button
        type="button"
        className="search-box"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <span>Ürün, marka veya kategori ara</span>
        <em>Ara</em>
      </button>

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
              <LiveSearch autoFocus onNavigate={close} limit={8} />
              <button type="button" className="search-close" onClick={close}>
                Kapat
              </button>
            </div>

            <p className="search-heading">Sık aranan aramalar</p>

            {/*
              Metin etiketleri. Görsel kutular katalog
              değiştikçe boşalıyordu; etiket her zaman çalışıyor
              ve aynı alana çok daha fazla terim sığıyor.
            */}
            <div className="search-terms">
              {terms.map((term) => (
                <Link
                  key={term}
                  href={`/arama?q=${encodeURIComponent(term)}`}
                  onClick={close}
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
