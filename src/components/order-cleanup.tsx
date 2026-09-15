"use client";

import { useEffect } from "react";
import { clearCart } from "@/components/cart";
import { clearCoupon, clearNote } from "@/lib/cart-extras";

/**
 * Sipariş onay sayfasında sepeti, kuponu ve notu temizler.
 *
 * Yalnızca sipariş numarasıyla gelindiğinde çalışıyor: adres elle
 * açıldığında müşterinin sepeti silinmemeli.
 *
 * Temizlik sipariş oluşturulurken değil burada yapılıyor. Kartlı
 * ödemede sipariş PayTR ekranı açılmadan oluşuyor; ödeme başarısız
 * olursa müşteri sepetini kaybetmemeli.
 */
export function OrderCleanup({ orderNumber }: { orderNumber?: string }) {
  useEffect(() => {
    if (!orderNumber) return;
    clearCart();
    clearCoupon();
    clearNote();
  }, [orderNumber]);

  return null;
}
