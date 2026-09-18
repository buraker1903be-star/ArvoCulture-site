import type { StorefrontDiscount } from "@/lib/discounts";
import { toKurus } from "@/lib/order-quote";

/**
 * Kupon değerlendirmesi — yalnızca gösterim içindir.
 *
 * Gerçek indirim ARC’ta, veritabanındaki kayıttan hesaplanır ve
 * PayTR’a giden tutar odur. Burada aynı kuralları uygulayıp
 * müşteriye anında geri bildirim veriyoruz; iki taraf ayrıldığında
 * sunucu kazanır.
 */
export type CouponResult =
  | { ok: true; amount: number; freeShipping: boolean; label: string }
  | { ok: false; reason: string };

export function evaluateCoupon(
  discounts: StorefrontDiscount[],
  code: string,
  subtotal: number,
): CouponResult {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { ok: false, reason: "Kod girin." };

  const found = discounts.find(
    (discount) => (discount.code ?? "").toUpperCase() === normalized,
  );

  if (!found) {
    return { ok: false, reason: "Bu kod geçerli değil." };
  }

  // Tutarlar ARC’ta kuruş cinsinden tutulur; karşılaştırma ve hesap da
  // kuruşta yapılır ki kayan nokta farkı sınırda sonucu değiştirmesin.
  const subtotalKurus = toKurus(subtotal);
  const minimum = (found.minimum_subtotal ?? 0) / 100;
  if (subtotalKurus < (found.minimum_subtotal ?? 0)) {
    return {
      ok: false,
      reason: `Bu kod ${new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
      }).format(minimum)} ve üzeri sepetlerde geçerli.`,
    };
  }

  if (found.discount_type === "free_shipping") {
    return {
      ok: true,
      amount: 0,
      freeShipping: true,
      label: "Kargo ücretsiz",
    };
  }

  // ARC sipariş fonksiyonuyla aynı: yüzde indirim kuruşta yuvarlanır,
  // sabit indirim (value kuruş) ara toplamı aşamaz.
  const amountKurus =
    found.discount_type === "percentage"
      ? Math.round((subtotalKurus * found.value) / 100)
      : Math.min(found.value, subtotalKurus);
  const amount = amountKurus / 100;

  return {
    ok: true,
    amount,
    freeShipping: false,
    label:
      found.discount_type === "percentage"
        ? `%${found.value} indirim`
        : "İndirim",
  };
}
