/*
  Kargo kuralı tek yerde.

  Sepet, çekmece, ödeme ve arama motoru şeması (seo.ts) aynı
  sayıları kullanıyor. Önceden üç bileşende ayrı ayrı yazılıydı;
  biri değişip diğeri unutulsaydı sepet ile ödeme farklı kargo
  ücreti gösterirdi.

  Bunlar yalnızca YEDEK: gerçek değerler ARC'taki mağaza ayarlarından
  gelir (lib/store-settings.ts); okunamazsa bunlara düşülür. Metinler
  shippingTerms (lib/order-quote.ts) ile bu sayılardan üretilir.
*/

/** Kargo ücreti (TL). */
export const SHIPPING_FEE = 120;

/** Bu tutar ve üzerindeki siparişlerde kargo ücretsiz (TL). */
export const FREE_SHIPPING_OVER = 2000;
