"use client";

import { useEffect, useState } from "react";
import { readFavourites, toggleFavourite } from "@/lib/favourites";

/**
 * Favori düğmesi.
 *
 * Sunucuda render edilirken favori durumu bilinmiyor; ilk
 * çizimde boş kalp gösterilip istemcide düzeltiliyor. Aksi
 * hâlde sunucu ve istemci çıktısı uyuşmuyor ve React uyarı
 * veriyor.
 */
export function FavouriteButton({
  slug,
  label,
}: {
  slug: string;
  label: string;
}) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = () => setActive(readFavourites().includes(slug));
    sync();

    window.addEventListener("arvo:favourites", sync);
    // Başka sekmede eklenirse burada da güncellensin.
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("arvo:favourites", sync);
      window.removeEventListener("storage", sync);
    };
  }, [slug]);

  return (
    <button
      type="button"
      className="fav-button"
      aria-pressed={active}
      aria-label={
        active ? `${label} favorilerden çıkar` : `${label} favorilere ekle`
      }
      title={active ? "Favorilerden çıkar" : "Favorilere ekle"}
      onClick={(event) => {
        // Kart bağlantısının içinde; tıklama ürüne gitmesin.
        event.preventDefault();
        event.stopPropagation();
        toggleFavourite(slug);
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20.4 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13z" />
      </svg>
    </button>
  );
}
