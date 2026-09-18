import { FREE_SHIPPING_OVER, SHIPPING_FEE } from "./shipping";
import { SELLER } from "./seller";

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

/**
 * Mağazanın satış ayarları (TL). ARC'ta mağaza panelinden değişir;
 * vitrin get_arvoculture_storefront_settings ile okur
 * (lib/store-settings.ts). Okunamazsa varsayılan: bugünkü sabitler.
 */
export type SalesRules = {
  shippingFee: number;
  freeShippingOver: number;
  transferEnabled: boolean;
  transferDiscountPercent: number;
};

export const DEFAULT_SALES_RULES: SalesRules = {
  shippingFee: SHIPPING_FEE,
  freeShippingOver: FREE_SHIPPING_OVER,
  transferEnabled: true,
  transferDiscountPercent: SELLER.transferDiscountPercent,
};

/** get_arvoculture_storefront_settings satırı (tutarlar kuruş). */
export type SalesRulesRow = {
  shipping_fee: number | string | null;
  free_shipping_threshold: number | string | null;
  bank_transfer_enabled: boolean | null;
  bank_transfer_discount_percent: number | string | null;
};

export function toSalesRules(row: SalesRulesRow | undefined): SalesRules {
  if (!row) return DEFAULT_SALES_RULES;
  const kurus = (value: SalesRulesRow["shipping_fee"], fallback: number) => {
    const n = Number(value);
    return value === null || !Number.isFinite(n) || n < 0 ? fallback : n / 100;
  };
  const percent = Number(row.bank_transfer_discount_percent);
  return {
    shippingFee: kurus(row.shipping_fee, DEFAULT_SALES_RULES.shippingFee),
    freeShippingOver: kurus(row.free_shipping_threshold, DEFAULT_SALES_RULES.freeShippingOver),
    // ARC ile aynı: yalnızca açık bir "false" havaleyi kapatır.
    transferEnabled: row.bank_transfer_enabled !== false,
    // numeric sütun metin olarak gelebilir ("2.5").
    transferDiscountPercent:
      row.bank_transfer_discount_percent === null || !Number.isFinite(percent) || percent < 0 || percent > 100
        ? DEFAULT_SALES_RULES.transferDiscountPercent
        : percent,
  };
}

/** Kargo ücreti (TL). Eşik indirim öncesi ara toplamla karşılaştırılır. */
export function shippingFor(
  subtotal: number,
  freeShippingCoupon = false,
  rules: SalesRules = DEFAULT_SALES_RULES,
): number {
  if (freeShippingCoupon) return 0;
  return toKurus(subtotal) >= toKurus(rules.freeShippingOver) ? 0 : rules.shippingFee;
}

/** Ücretsiz kargoya kalan tutar (TL). Kargo zaten ücretsizse 0. */
export function amountToFreeShipping(
  subtotal: number,
  freeShippingCoupon = false,
  rules: SalesRules = DEFAULT_SALES_RULES,
): number {
  if (freeShippingCoupon) return 0;
  return Math.max(toKurus(rules.freeShippingOver) - toKurus(subtotal), 0) / 100;
}

/**
 * Havale indirimi (TL). Taban yalnızca mal bedeli — kupon düşülmüş ara
 * toplam; kargo girmez. ARC'taki gibi kuruşta yuvarlanır.
 */
export function transferDiscountFor(goods: number, percent: number): number {
  return Math.round((Math.max(toKurus(goods), 0) * percent) / 100) / 100;
}
