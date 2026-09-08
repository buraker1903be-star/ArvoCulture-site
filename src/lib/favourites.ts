"use client";

/**
 * Favoriler.
 *
 * Tarayıcı depolamasında tutuluyor: üyelik zorunlu değil ve
 * misafir müşteri de listesini kaybetmiyor. Hesaba bağlamak
 * ileride eklenebilir; şu an giriş yapmayı zorunlu kılmak
 * gereksiz sürtünme yaratırdı.
 */
const KEY = "arvo-favourites";

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

export function toggleFavourite(slug: string) {
  const current = readFavourites();
  const next = current.includes(slug)
    ? current.filter((item) => item !== slug)
    : [...current, slug];

  localStorage.setItem(KEY, JSON.stringify(next));
  // Aynı sayfadaki diğer bileşenler haberdar olsun.
  window.dispatchEvent(new Event("arvo:favourites"));
  return next;
}
