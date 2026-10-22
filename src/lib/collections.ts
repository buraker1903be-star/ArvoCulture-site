import { cache } from "react";
import { rpcOrEmpty } from "@/lib/arc";
import { ttlCache } from "@/lib/ttl-cache";
import { vitrinKonagi } from "@/lib/konak";

export type StorefrontCollection = {
  title: string;
  slug: string;
  description: string;
  menu_group: string;
  /** Ana kategori: Erkek, Kadın, Çocuk, Aksesuar. */
  parent: string;
  product_count: number;
  /*
    İNGİLİZCE BAŞLIK VE AÇIKLAMA. Çevirisi olmayan koleksiyonda
    `null`: Türkçe başlık KOPYALANMIYOR, çünkü o zaman "çevirisi var
    mı" sorusu yanıtlanamaz olurdu. Çağıran taraf `title_en ?? title`
    ile düşüyor.
  */
  title_en: string | null;
  description_en: string | null;
};

/**
 * Koleksiyon listesi.
 *
 * Sitenin en sık çekilen verisi: menü her sayfada var, yani her
 * istekte bir kez okunuyor. `rpc` POST kullandığı için Next'in
 * veri önbelleği devreye girmiyor ve buradaki `revalidate: 60`
 * pratikte hiçbir şey yapmıyordu — süreli önbellek o boşluğu
 * dolduruyor.
 *
 * İki katman birlikte çalışıyor:
 *   - `cache` (React): aynı istek içinde tekrar tekrar çağrılırsa
 *     bir kez çalışır.
 *   - `ttlCache`: istekler arasında altmış saniye saklar.
 *
 * Altmış saniye, koleksiyonların değişme hızına göre bol. Yeni bir
 * kategori ArvoARC'ta açıldığında menüde bir dakika içinde belirir.
 */
/* Anahtar mağazanın adresi: önbellek mağaza başına (lib/ttl-cache). */
const yukle = ttlCache(
  (konak: string) =>
    rpcOrEmpty<StorefrontCollection>(
      "arc_storefront_collections",
      { p_host: konak },
      { revalidate: 60, tags: ["storefront-collections"] },
    ),
  60_000,
);

export const getStorefrontCollections = cache(
  async (): Promise<StorefrontCollection[]> => yukle(await vitrinKonagi()),
);
