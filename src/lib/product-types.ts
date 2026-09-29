/**
 * İstemci tarafında da kullanılabilen ürün tipi ve biçimlendiriciler.
 * Veri çekme kodu (server-only) src/lib/products.ts içindedir — ikisi
 * bilinçli olarak ayrıdır, aksi hâlde sunucuya özel modüller sepet gibi
 * istemci bileşenlerine sızar.
 */
export type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  eyebrow: string;
  tone: string;
  subtitle: string;
  description: string;
  tags: string[];
  image?: string;
  /** Galeri için tüm görseller. image, bunun ilk elemanıdır. */
  images: string[];
  /**
   * Görselin türü. Kart ve galeri çerçevesi buna göre değişir:
   * paket çekimi nefes almalı, manken fotoğrafı çerçeveyi
   * doldurmalı.
   */
  artStyle: "packshot" | "lifestyle";
  /** Tedarikçi ürünlerinde tablo hâlindeki özellikler. */
  specs: Array<{ label: string; value: string }>;
  sizeGuide: Array<{ label: string; value: string }>;
  /** Stokta olan bedenler. Koleksiyon filtresi bunu kullanır. */
  sizes: string[];
  available?: boolean;
  badge?: string;
  badgeTone?: "green" | "navy" | "gold" | "red";
  bestSeller?: boolean;
  discountPercent?: number;
};

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(n);

/**
 * Gösterilebilir varyant etiketi.
 *
 * Tek varyantlı ürünler (kozmetik, parfüm, setler) tedarikçi
 * kataloğundan "Default Title" gibi yer tutucu başlıklarla gelir.
 * Bu, ürünün bir özelliği değil veri kaynağının varsayılanı;
 * sepette ürün adının altında göstermek anlamsız.
 *
 * Üstelik iki kat bozuk görünüyordu: sayfa Türkçe olduğu için
 * CSS büyük harfe çevirirken "Title" kelimesindeki i harfini
 * İ yapıyor ve müşteri sepette "DEFAULT TİTLE" okuyordu.
 *
 * Gerçek bir beden ya da varyant adı varsa olduğu gibi döner.
 */
const PLACEHOLDER_VARIANT_TITLES = new Set([
  "default title",
  "default",
  "title",
  "varsayilan",
  "varsayılan",
  "tek beden",
  "standart",
]);

export function displayVariantLabel(
  input: { size?: string | null; color?: string | null; title?: string | null } | undefined,
): string | undefined {
  if (!input) return undefined;

  /*
    RENK DE ETİKETE GİRİYOR. Önce yalnızca bedene bakılıyordu; rengi ve
    bedeni olan bir üründe sepette "M" yazıyor, hangi renk olduğu
    kayboluyordu. Kozmetikte beden hiç yok, orada tek ayırt edici renk
    (30.09.2026'da renk seçici eklenince ortaya çıktı).
  */
  const size = input.size?.trim();
  const color = input.color?.trim();
  if (size && color) return `${color} · ${size}`;
  if (size) return size;
  if (color) return color;

  const title = input.title?.trim();
  if (!title) return undefined;

  /* Karşılaştırma ASCII küçük harfle: yer tutucular İngilizce
     geliyor ve Türkçe küçük harf kuralı "Title" kelimesini
     "tıtle" yapıp eşleşmeyi kaçırırdı. */
  return PLACEHOLDER_VARIANT_TITLES.has(title.toLowerCase())
    ? undefined
    : title;
}
