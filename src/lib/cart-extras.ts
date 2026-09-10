"use client";

/**
 * Kupon kodu ve müşteri notu.
 *
 * Sepet kalemleriyle aynı depoda ama ayrı anahtarlarda tutulur;
 * sepet temizlendiğinde de silinirler. Ödeme sayfası bu değerleri
 * okuyup ARC’a gönderir.
 *
 * Not: kuponun geçerliliği burada değil sunucuda doğrulanır.
 * Buradaki değer yalnızca müşterinin yazdığıdır.
 */
const COUPON_KEY = "arvo-cart-coupon";
const NOTE_KEY = "arvo-cart-note";

export function readCoupon() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(COUPON_KEY) ?? "";
}

export function writeCoupon(value: string) {
  localStorage.setItem(COUPON_KEY, value.trim().toUpperCase());
}

export function clearCoupon() {
  localStorage.removeItem(COUPON_KEY);
}

export function readNote() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(NOTE_KEY) ?? "";
}

export function writeNote(value: string) {
  localStorage.setItem(NOTE_KEY, value.slice(0, 500));
}
