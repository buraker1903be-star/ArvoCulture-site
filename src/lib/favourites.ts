"use client";

/**
 * Favorilerin tarayıcı tarafındaki deposu.
 *
 * Bu modül yalnızca saklama işini yapar — hesapla eşitleme ve
 * birleştirme mantığı FavouritesProvider'dadır (bkz.
 * components/favourites.tsx).
 *
 * Üye müşteride asıl kaynak veritabanıdır; buradaki liste o
 * listenin yerel kopyasıdır ve sayfa ilk açıldığında ekranın
 * ağ isteğini beklemeden dolmasını sağlar. Misafir müşteride
 * ise tek kaynak burasıdır: favorilemek için üyelik istemek
 * gereksiz sürtünme yaratırdı.
 */
const KEY = "arvo-favourites";
const EVENT = "arvo:favourites";

export function readFavourites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? list.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Listeyi yazar ve aynı sayfadaki diğer bileşenleri haberdar eder.
 * Depolama başarısız olsa bile (özel pencere, dolu kota) olay
 * yayımlanır: ekran müşterinin dokunuşuna yanıt vermeye devam eder.
 */
export function writeFavourites(slugs: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(slugs));
  } catch {
    /* Sessizce geçiliyor: saklayamamak, çalışmamaktan iyidir. */
  }
  window.dispatchEvent(new Event(EVENT));
}
