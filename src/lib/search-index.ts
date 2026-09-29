import { cache } from "react";
import { rpcTumSayfalar } from "@/lib/arc";
import { env } from "@/lib/env";
import { inferCategory } from "@/lib/products";

/**
 * İstemciye gönderilen hafif arama dizini.
 *
 * Kendi sorgusunu kullanıyor. Eskiden katalog listesini çekip
 * kullanmadığı alanları atıyordu: her ürünün galerisinin tamamı,
 * alt başlığı ve beden listesi Supabase’den sunucuya taşınıyordu —
 * 3,0 MB — sonra 3.400 ürün tek tek `mapProduct`’tan geçiriliyor ve
 * geriye yedi alan kalıyordu. Sayfa 2,6 saniyede açılıyordu.
 *
 * Yeni sorgu yalnızca bu yedi alanı getiriyor, ilk görseli
 * getiriyor (sonuç kartı tek resim gösteriyor) ve stok süzmesini
 * veritabanında yapıyor.
 *
 * Bilerek `rpc` kullanılıyor, `rpcOrEmpty` değil. Hata yutulursa
 * arama sessizce "sonuç bulunamadı" der ve müşteri kataloğun boş
 * olduğunu sanır — bu oturumun başındaki hatanın mekanizması tam
 * olarak buydu. Artık hata görünür oluyor.
 */
export type SearchItem = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  image?: string;
  /*
    Görsel türü: manken fotoğrafı mı, paket çekimi mi. Arama kartı
    çerçeveyi buna göre seçiyor (bkz. .card-art[data-art]); bu bilgi
    yokken dikey manken fotoğrafları kare çerçevede küçülüyordu.
    İsteğe bağlı: SearchItem üreten başka yerler kırılmasın.
  */
  artStyle?: "packshot" | "lifestyle";
};

type SearchRow = {
  slug: string;
  name: string;
  vendor: string | null;
  product_type: string | null;
  price: number;
  compare_at_price: number | null;
  image_path: string | null;
};

/**
 * Görsel yolu iki biçimde gelebilir: ArvoARC deposundaki göreli yol ya
 * da tedarikçi CDN’inin tam adresi.
 */
const imageUrl = (path: string | null) => {
  if (!path) return undefined;
  return path.startsWith("http")
    ? path
    : `${env.supabaseUrl}/storage/v1/object/public/arc-product-images/${path}`;
};

export const getSearchIndex = cache(async (): Promise<SearchItem[]> => {
  /*
    SAYFA SAYFA: tek istek 1000 üründe kesiliyordu (PostgREST sınırı,
    fonksiyonun LIMIT'inden bağımsız) ve dizin "en son dokunulan 1000
    ürün"e dönüştüğü için müşteri satın alabildiği ürünü arayıp
    bulamıyordu. Sayfalama başlıkla denendi, bu uçta yok sayıldı;
    fonksiyona p_offset eklendi (30.09.2026).
  */
  const rows = await rpcTumSayfalar<SearchRow>(
    "get_arvoculture_storefront_search_index",
    {},
    { revalidate: 300, tags: ["storefront-products"] },
  );

  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    brand: row.vendor || "ARVOCULTURE",
    category: inferCategory(row),
    /* Tutarlar kuruş olarak gelir. */
    price: Number(row.price) / 100,
    oldPrice: row.compare_at_price
      ? Number(row.compare_at_price) / 100
      : undefined,
    image: imageUrl(row.image_path),
    /* Kural products.ts'teki ile aynı: tedarikçi CDN'inden gelen tam
       adres manken fotoğrafı, ArvoARC deposundaki yol paket çekimi. */
    artStyle: row.image_path?.startsWith("http") ? "lifestyle" : "packshot",
  }));
});
