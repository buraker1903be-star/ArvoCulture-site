/*
  Kargo kuralı tek yerde.

  Sepet, çekmece, ödeme ve arama motoru şeması (seo.ts) aynı
  sayıları kullanıyor. Önceden üç bileşende ayrı ayrı yazılıydı;
  biri değişip diğeri unutulsaydı sepet ile ödeme farklı kargo
  ücreti gösterirdi.

  ARC’taki sipariş fonksiyonuyla ve seller.ts’teki metinlerle
  ("120 TL", "2.000 TL") aynı tutulmalıdır.
*/

/** Kargo ücreti (TL). */
export const SHIPPING_FEE = 120;

/** Bu tutar ve üzerindeki siparişlerde kargo ücretsiz (TL). */
export const FREE_SHIPPING_OVER = 2000;
