import { FREE_SHIPPING_OVER, SHIPPING_FEE } from "./shipping";

/*
  Sepet ve ödeme ekranındaki tutar hesapları — ARC'ın aynası.

  Gerçek tutarı ARC hesaplar ve PayTR'a giden odur; burada yalnızca
  müşteriye gösterilen rakamlar var. Ama gösterilen rakam ödenen
  rakamla aynı olmalı. Önceden bu kurallar üç bileşende ayrı ayrı
  yazılıydı ve ARC 17 Eylül 2026'da iki kuralı değiştirdiğinde vitrine
  taşınmadı (ARC commit d05a033 ve f74cb99; ikisi de "vitrin ayrıca
  güncellenmeli" diye not düşmüştü):

   - Ücretsiz kargo eşiği indirim ÖNCESİ ara toplamla karşılaştırılır.
     Çekmece indirim SONRASI tutara bakıyordu: 2.000 TL'lik sepette %10
     kupon giren müşteri 120 TL kargo görüyordu, ARC kargo almıyordu.
   - "Ücretsiz Kargo" kuponu kargoyu sıfırlar. Sepet sayfası ve ödeme
     formu bunu görmüyor, kargoyu yine gösteriyordu.
   - Havale indirimi yalnızca mal bedeline uygulanır, kargoya değil; ve
     kuruşta yuvarlanır. Ödeme formu kargo dahil toplamın %3'ünü alıp
     tam liraya yuvarlıyordu.

  Hesaplar ARC gibi kuruş tamsayısıyla yapılır; bileşenler TL ile
  konuştuğu için giriş ve çıkış TL. Kaynaklar:
   - kargo ve kupon: ARC supabase/migrations/20260917150000_free_shipping_coupon.sql
   - havale:        ARC src/app/api/storefront/odeme/route.ts
*/

/** TL → kuruş (tamsayı). */
export const toKurus = (lira: number) => Math.round(lira * 100);

/** Kargo ücreti (TL). Eşik indirim öncesi ara toplamla karşılaştırılır. */
export function shippingFor(subtotal: number, freeShippingCoupon = false): number {
  if (freeShippingCoupon) return 0;
  return toKurus(subtotal) >= toKurus(FREE_SHIPPING_OVER) ? 0 : SHIPPING_FEE;
}

/** Ücretsiz kargoya kalan tutar (TL). Kargo zaten ücretsizse 0. */
export function amountToFreeShipping(subtotal: number, freeShippingCoupon = false): number {
  if (freeShippingCoupon) return 0;
  return Math.max(toKurus(FREE_SHIPPING_OVER) - toKurus(subtotal), 0) / 100;
}

/**
 * Havale indirimi (TL). Taban yalnızca mal bedeli — kupon düşülmüş ara
 * toplam; kargo girmez. ARC'taki gibi kuruşta yuvarlanır.
 */
export function transferDiscountFor(goods: number, percent: number): number {
  return Math.round((Math.max(toKurus(goods), 0) * percent) / 100) / 100;
}
