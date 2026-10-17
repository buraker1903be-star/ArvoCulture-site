import { displayVariantLabel } from "@/lib/product-types";
import type { CartVariant } from "@/components/cart";

/*
  KARTTAN SEPETE EKLEME, VARYANT BİLİNİYORSA (17.10.2026).

  Koleksiyon kartındaki "Sepete ekle" düğmesi yalnızca KATEGORİYE
  bakıyordu: "Giyim" ise bedene gidiyor, değilse ürünü SKU'suz
  sepete atıyordu. Kural, vitrin yalnızca tekstil satarken
  doğruydu. 30.09.2026'da kozmetikte RENK seçicisi eklendi: LR'ın
  rujunun altı tonu var ve kategorisi "Kozmetik".

  Sonuç: müşteri karttan "Sepete ekle" diyor, sepete SKU yazılmıyor,
  ödeme adımında slug gidiyor ve ArvoARC siparişi stokta olan
  herhangi bir tona bağlıyor (arc_create_order). Kutudan başka ton
  çıkıyordu. Üstelik kartta yazan fiyat varyantların EN DÜŞÜĞÜ
  (min(v.price)), yani ton başına fiyat değişen üründe gösterilen
  tutar da ödenenden farklı olabiliyordu.

  Ölçüt artık kategori değil, VARYANT SAYISI: tek varyantlıysa
  karttan eklenir ve o varyantın SKU'su yazılır; birden çoksa
  müşteri ürün sayfasında seçer.

  Saf; testi tests/varyant-ozeti.test.ts.
*/
export type VaryantSatiri = {
  sku: string;
  title?: string | null;
  color?: string | null;
  size?: string | null;
  price: number;
};

export type VaryantOzeti = {
  adet: number;
  /** Tek varyantlıysa sepete yazılacak kalem; değilse null. */
  tek: CartVariant | null;
};

export function varyantOzeti(varyantlar: VaryantSatiri[]): VaryantOzeti {
  if (varyantlar.length !== 1) return { adet: varyantlar.length, tek: null };
  const varyant = varyantlar[0]!;
  return {
    adet: 1,
    tek: {
      sku: varyant.sku,
      label: displayVariantLabel(varyant),
      price: varyant.price,
    },
  };
}
