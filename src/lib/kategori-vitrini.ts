import { cache } from "react";
import {
  CATEGORIES,
  categoryKey,
  KATEGORI_MENU_GRUPLARI,
  type SiteCategory,
} from "@/lib/categories";
import { getStorefrontCollectionProductsPage } from "@/lib/products";

/*
  KATEGORİ KARTINDAKİ GERÇEK VERİ.

  Kartlarda fotoğraf, ad ve her birinde aynı "Keşfet" vardı: dört
  kart, dört stok fotoğrafı ve sıfır bilgi. Müşteri bölümün ne kadar
  büyük olduğunu ve içinde ne olduğunu ancak tıklayınca görüyordu.

  ÖNCE DENENEN VE ÇALIŞMAYAN YOL: sayıyı koleksiyon listesinden
  (`arc_storefront_collections.product_count`) almak. Canlıda hiçbir
  kartta rozet çıkmadı, çünkü bu dört kategori ArvoARC'ta KOLEKSİYON
  DEĞİL — menü gruplarından toplanıyorlar (KATEGORI_MENU_GRUPLARI).
  Grupların sayılarını toplamak da yanlış: ürünler birden çok
  koleksiyonda duruyor ve toplam şişiyor (bakım için 214 çıkıyor,
  gerçeği 89).

  Doğrusu kategori sayfasının kullandığı çağrının aynısı: ürünleri
  ve toplamı tek sorguda veren `..._products_page`. Sayı artık
  kategori sayfasındakiyle AYNI — kartta 89 yazıp sayfada 214
  görmek, hiç sayı yazmamaktan kötü olurdu.

  Altı ürün isteniyor, üçü basılıyor: aradan tükenenler ve görselsiz
  kayıtlar eleniyor.
*/
export type KategoriUrunu = { slug: string; ad: string; gorsel: string };

export type KategoriVitrini = SiteCategory & {
  urunSayisi?: number;
  urunler: KategoriUrunu[];
};

export const getKategoriVitrinleri = cache(
  async (): Promise<KategoriVitrini[]> =>
    Promise.all(
      CATEGORIES.map(async (kategori): Promise<KategoriVitrini> => {
        const gruplar = KATEGORI_MENU_GRUPLARI[categoryKey(kategori.href)];
        if (!gruplar) return { ...kategori, urunler: [] };

        const sayfa = await getStorefrontCollectionProductsPage(
          1,
          { menuGroups: gruplar },
          6,
        );

        /* Okunamadı ile "boş" aynı şey değil: çağrı düştüğünde kart
           sade çiziliyor, uydurma bir sayı yazmıyor. */
        if (sayfa.okunamadi) return { ...kategori, urunler: [] };

        return {
          ...kategori,
          urunSayisi: sayfa.total > 0 ? sayfa.total : undefined,
          urunler: sayfa.products
            .filter((urun) => urun.available !== false && Boolean(urun.image))
            .slice(0, 3)
            .map((urun) => ({
              slug: urun.slug,
              ad: urun.name,
              gorsel: urun.image as string,
            })),
        };
      }),
    ),
);
