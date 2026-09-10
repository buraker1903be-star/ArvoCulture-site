"use client";

/**
 * Son gezilen ürünler.
 *
 * Tarayıcıda tutuluyor; üyelik gerekmiyor. Yalnızca ürün
 * slug’ları saklanıyor — ürün bilgisi katalogdan tazelenir,
 * böylece fiyatı değişen ya da tükenen ürün eski bilgisiyle
 * görünmez.
 */
const KEY = "arvo-recent";
const LIMIT = 12;

export function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? list.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Ürünü listenin başına alır; tekrar varsa öne taşınır. */
export function pushRecent(slug: string) {
  try {
    const current = readRecent().filter((item) => item !== slug);
    const next = [slug, ...current].slice(0, LIMIT);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Depolama kapalıysa (gizli sekme kotası) sessizce geç:
    // bu özellik uğruna sayfa bozulmamalı.
  }
}
