"use client";

import { useFavourites } from "@/components/favourites";

/**
 * Favori düğmesi.
 *
 * Durum artık FavouritesProvider'dan geliyor; üye müşteride bu
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
        toggle(slug);
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 20.4 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13z" />
      </svg>
    </button>
  );
}
