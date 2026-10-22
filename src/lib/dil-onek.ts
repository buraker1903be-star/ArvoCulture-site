/*
  DİL ÖNEKİ — SAF.

  İngilizce sayfalar `/en` altında duruyor (ayrı adres, ayrı önbellek
  anahtarı, ayrı dizin kaydı). O ağacın içindeki her bağlantı da
  ağacın içinde kalmalı: İngilizce ana sayfadan bir ürüne tıklayan
  müşteri Türkçe sayfaya düşerse ayrı adres kurmanın bütün anlamı
  kaybolur.

  Önek TEK YERDEN hesaplanıyor, çünkü bağlantı üreten yer çok
  (ürün kartı, kırıntı, benzer ürünler, son gezilenler, arama) ve
  her birinde "yol /en ile mi başlıyor" kontrolü yazmak, birinde
  atlandığında sessizce Türkçeye düşen bir bağlantı demekti.
*/

export type Dil = "tr" | "en";

/** `/en` ağacındaki yolların öneki; Türkçede boş. */
export const dilOneki = (dil: Dil) => (dil === "en" ? "/en" : "");

/**
 * Yoldan dili çıkarır.
 *
 * İstemci bileşenleri (son gezilenler, arama katmanı) kendi
 * bağlantılarını üretirken bunu `usePathname()` ile çağırıyor; sunucu
 * bileşenleri dili prop olarak alıyor çünkü kanca kullanamıyorlar.
 *
 * `/engel` gibi `/en` ile BAŞLAYAN ama İngilizce olmayan bir yol
 * yanlış eşleşmesin diye sınır aranıyor: tam `/en` ya da `/en/`.
 */
export function yoldanDil(yol: string | null | undefined): Dil {
  const temiz = yol ?? "";
  return temiz === "/en" || temiz.startsWith("/en/") ? "en" : "tr";
}
