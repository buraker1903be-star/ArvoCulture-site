import { cache } from "react";
import { rpc } from "@/lib/arc";

/**
 * Ürün varyantları.
 *
 * Sepet ürün slug’ı yerine varyant SKU’su taşımalı; aksi hâlde
 * müşteri "L" seçse bile sipariş stokta olan herhangi bir
 * varyanta bağlanıyor ve yanlış beden gönderiliyor.
 */
export type Variant = {
  sku: string;
  title: string;
  color: string | null;
  size: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  available: boolean;
};

/*
  OKUNAMADI, "VARYANT YOK" DEĞİL (17.10.2026).

  Burada `rpcOrEmpty` kullanılıyordu: ArvoARC'a giden çağrı hata
  verdiğinde boş liste dönüyor, ürün sayfası bunu "bu ürünün seçeneği
  yok" diye okuyordu. Sonuç, düzeltilmiş bir hatanın sessizce geri
  gelmesiydi:

    - seçenek listesi boş → renk/beden sorulmuyor,
    - seçili varyant yok → sepete SKU yazılmıyor,
    - ödeme adımında SKU yerine slug gidiyor,
    - ArvoARC slug'ı gördüğünde stokta olan HERHANGİ bir varyanta
      bağlıyor (arc_create_order: `order by (v.stock > 0) desc`).

  Yani müşteri rujun hangi tonunu aldığını seçmemiş sayılıyor ve
  kutudan başka ton çıkıyordu. Üstelik karttaki fiyat varyantların
  EN DÜŞÜĞÜ (min(v.price)); ödenen tutar da farklı olabiliyordu.

  BOŞ LİSTE DE ARIZADIR: hem ürün hem katalog fonksiyonu varyant
  tablosuna INNER JOIN ile bağlanıyor, yani sayfası açılabilen her
  ürünün en az bir varyantı var. Boş sonuç geldiyse okuma eksiktir.

  Bu yüzden çağıran taraf iki hâli ayırt edebiliyor; ürün sayfası
  okunamadığında sepete eklemeyi kapatıp durumu söylüyor.
*/
export type VaryantSonucu = {
  varyantlar: Variant[];
  /** Okuma başarısız ya da boş döndü: seçenekler bilinmiyor. */
  okunamadi: boolean;
};

export const getProductVariants = cache(
  async (slug: string): Promise<VaryantSonucu> => {
    let rows: Variant[];
    try {
      rows = await rpc<Variant>(
        "get_arvoculture_storefront_variants",
        { p_slug: slug },
        { revalidate: 60, tags: ["storefront-variants"] },
      );
    } catch (error) {
      console.error(error);
      return { varyantlar: [], okunamadi: true };
    }

    if (rows.length === 0) {
      console.error(`get_arvoculture_storefront_variants: ${slug} için varyant dönmedi.`);
      return { varyantlar: [], okunamadi: true };
    }

    return {
      varyantlar: rows.map((row) => ({
        ...row,
        // Tutarlar kuruş olarak gelir.
        price: Number(row.price) / 100,
        compare_at_price: row.compare_at_price
          ? Number(row.compare_at_price) / 100
          : null,
      })),
      okunamadi: false,
    };
  },
);
