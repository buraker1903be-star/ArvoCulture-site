import { cache } from "react";
import { rpcOrEmpty } from "@/lib/arc";
import { ttlCache } from "@/lib/ttl-cache";

export type StorefrontCollection = {
  title: string;
  slug: string;
  description: string;
  menu_group: string;
  /** Ana kategori: Erkek, Kadın, Çocuk, Aksesuar. */
  parent: string;
  product_count: number;
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
 * kategori ARC'ta açıldığında menüde bir dakika içinde belirir.
 */
const yukle = ttlCache(
  () =>
    rpcOrEmpty<StorefrontCollection>(
      "get_arvoculture_storefront_collections",
      {},
      { revalidate: 60, tags: ["storefront-collections"] },
    ),
  60_000,
);

export const getStorefrontCollections = cache(
  async (): Promise<StorefrontCollection[]> => yukle(),
);
