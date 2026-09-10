import { cache } from "react";
import { rpcOrEmpty } from "@/lib/arc";
import { ttlCache } from "@/lib/ttl-cache";

export type StorefrontDiscount = {
  id: string;
  name: string;
  code: string | null;
  discount_type: "percentage" | "fixed_amount" | "free_shipping";
  value: number;
  minimum_subtotal: number;
  combinable: boolean;
  badge: string;
};

/**
 * İndirim ve kupon tanımları.
 *
 * Bunlar da her sayfada okunuyor: üst bandaki kampanya şeridi ve
 * sepetteki kupon değerlendirmesi buradan besleniyor.
 *
 * Otuz saniye seçildi, koleksiyonlardaki gibi altmış değil. Kupon
 * bir kampanyanın parçası ve kampanya "şimdi başlasın" denerek
 * açılabilir; yarım dakika, mağaza sahibinin sabrını zorlamadan
 * her isteği veritabanına göndermemeye yetiyor.
 *
 * Burada saklanan şey indirimin *tanımı* — ürün fiyatı değil.
 * Müşteriye gösterilen tutarı ARC hesaplıyor.
 */
const yukle = ttlCache(
  () =>
    rpcOrEmpty<StorefrontDiscount>(
      "get_arvoculture_storefront_discounts",
      {},
      { revalidate: 30, tags: ["storefront-discounts"] },
    ),
  30_000,
);

export const getStorefrontDiscounts = cache(
  async (): Promise<StorefrontDiscount[]> => yukle(),
);
