"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { LiveSearch } from "@/components/live-search";
import type { SearchItem } from "@/lib/search-index";

export type SearchTile = {
  label: string;
  href: string;
  image?: string;
  note?: string;
};

/**
 * Arama katmanı.
 *
 * Kutuya basıldığında sayfayı terk etmek yerine tam ekran bir
 * katman açılır. İçindeki arama ilk harften itibaren sonuç
 * gösterir; müşteri aradığını bulamazsa Escape'e basıp kaldığı
 * yerden devam eder.
 */
export function SearchOverlay({
  tiles,
  items,
}: {
  tiles: SearchTile[];
  items: SearchItem[];
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
              <LiveSearch items={items} autoFocus onNavigate={close} limit={8} />
              <button type="button" className="search-close" onClick={close}>
                Kapat
              </button>
            </div>

            <p className="search-heading">En çok arananlar</p>

            <div className="search-tiles">
              {tiles.map((tile) => (
                <a key={tile.href} href={tile.href} className="search-tile">
                  <span className="search-tile-art">
                    {tile.image && (
                      <Image src={tile.image} alt="" fill sizes="180px" />
                    )}
                  </span>
                  <strong>{tile.label}</strong>
                  {tile.note && <small>{tile.note}</small>}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
