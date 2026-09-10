"use client";

import { useState } from "react";
import { useFavourites } from "@/components/favourites";

/**
 * Favori düğmesi.
 *
 * Durum artık FavouritesProvider’dan geliyor; üye müşteride bu
 * liste hesaptan, misafirde tarayıcıdan beslenir. Düğmenin kendisi
 * ikisini ayırt etmez.
 *
 * Sunucuda render edilirken favori durumu bilinmiyor: ilk çizimde
 * boş kalp gösterilip istemcide düzeltiliyor. Aksi hâlde sunucu ve
 * istemci çıktısı uyuşmaz ve React uyarı verir.
 */
export function FavouriteButton({
  slug,
  label,
}: {
  slug: string;
  label: string;
}) {
  const { isFavourite, toggle } = useFavourites();
  const active = isFavourite(slug);

  /*
    Favoriye eklendiği an kalp bir kez büyüyüp yerine oturuyor.
    Bunu CSS'e `aria-pressed="true"` üzerinden bağlamak kolay
    olurdu ama yanlış olurdu: favoriler sayfası açıldığında
    ekrandaki bütün kalpler aynı anda zıplardı. Hareketin anlamı
    "şu an ekledin" — o yüzden tıklamaya bağlı.
  */
  const [vurgu, setVurgu] = useState(false);

  return (
    <button
      type="button"
      className={`fav-button${vurgu ? " is-pop" : ""}`}
      aria-pressed={active}
      aria-label={
        active ? `${label} favorilerden çıkar` : `${label} favorilere ekle`
      }
      title={active ? "Favorilerden çıkar" : "Favorilere ekle"}
      onClick={(event) => {
        // Kart bağlantısının içinde; tıklama ürüne gitmesin.
        event.preventDefault();
        event.stopPropagation();
        /* Yalnızca eklerken; çıkarırken kutlama olmaz. */
        if (!active) {
          setVurgu(true);
          window.setTimeout(() => setVurgu(false), 420);
        }
        toggle(slug);
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20.4 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13z" />
      </svg>
    </button>
  );
}
