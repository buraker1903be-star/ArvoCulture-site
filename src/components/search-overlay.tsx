"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export type SearchTile = {
  label: string;
  href: string;
  image?: string;
  note?: string;
};

/**
 * Arama katmanı.
 *
 * Arama kutusuna basıldığında sayfayı terk etmek yerine tam ekran
 * bir katman açılır. Amaç, aramayı bir sayfa geçişi değil bir
 * eylem hâline getirmek: müşteri aradığını bulamazsa Escape'e
 * basıp kaldığı yerden devam eder.
 *
 * Popüler aramalar metin etiketi yerine görselli kutular; kokuyu
 * ya da kremi görmek, "Parfüm" yazısını okumaktan daha hızlı
 * karar verdirir.
 */
export function SearchOverlay({ tiles }: { tiles: SearchTile[] }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    // Katman açıkken arka plan kaymasın ve Escape kapatsın.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  function submit() {
    const query = value.trim();
    if (!query) return;
    close();
    router.push(`/arama?q=${encodeURIComponent(query)}`);
  }

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
        <div className="search-layer" role="dialog" aria-modal="true" aria-label="Arama">
          <button
            type="button"
            className="search-veil"
            aria-label="Aramayı kapat"
            onClick={close}
          />

          <div className="search-sheet">
            <div className="search-field">
              <input
                ref={inputRef}
                type="search"
                value={value}
                placeholder="Ne aramıştınız?"
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submit();
                }}
              />
              <button type="button" className="btn" onClick={submit}>
                Ara
              </button>
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
