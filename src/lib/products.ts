import { cache } from "react";
import { rpc, rpcOrEmpty } from "@/lib/arc";
import { env } from "@/lib/env";
import type { Product } from "@/lib/product-types";

export { formatPrice } from "@/lib/product-types";
export type { Product } from "@/lib/product-types";

type StorefrontRow = {
  slug: string;
  name: string;
  /*
    Liste sorgularında istenmiyor: kart bu alanı kullanmıyor ve
    3.400 ürün için tek başına 9 MB yer tutuyor. Ürün detay
    sayfası tekil sorguda tam satırı alır.
  */
  description?: string | null;
  subtitle: string | null;
  vendor: string | null;
  product_type: string | null;
  price: number;
  compare_at_price: number | null;
  available: boolean;
  image_paths: unknown;
  /* Tedarikçi ürünlerinde tablo hâlindeki özellikler. */
  specs?: unknown;
  size_guide?: unknown;
  sizes?: unknown;
};

type ProductBadgeRow = {
  slug: string;
  badge: string | null;
  badge_tone: string | null;
  is_best_seller: boolean;
  discount_percent: number;
};

const badgeTones = new Set(["green", "navy", "gold", "red"]);

const getProductBadges = cache(
  async (): Promise<Map<string, ProductBadgeRow>> => {
    const rows = await rpcOrEmpty<ProductBadgeRow>(
      "get_arvoculture_storefront_product_badges",
      {},
      { revalidate: 60, tags: ["storefront-product-badges"] },
    );
    return new Map(rows.map((row) => [row.slug, row]));
  },
);

const plainText = (value: string | null | undefined) =>
  (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const inferCategory = (row: StorefrontRow) => {
  const text = `${row.product_type ?? ""} ${row.name}`.toLocaleLowerCase("tr-TR");
  /*
    Giyim anahtar kelimeleri. Tedarikçi kataloğu geldiğinden beri
    liste genişletildi: eşofman, ceket, hırka, pantolon gibi
    ürünler "Kişisel Bakım" olarak sınıflanıyordu.
  */
  if (
    /tişört|tisort|t-shirt|sweat|hoodie|kapüşon|kapuson|giyim|oversize|regular fit|eşofman|esofman|jogger|pantolon|şort|sort|ceket|mont|hırka|hirka|yelek|gömlek|gomlek|elbise|etek|tayt|body|atlet|takım|takim|rüzgarlık|ruzgarlik|kaban|blazer|tulum|bluz|kazak|triko/.test(
      text,
    )
  )
    return "Giyim";
  if (/parfüm|parfum|eau de parfum|eau de toilette| edp| edt/.test(text))
    return "Parfüm";
  if (
    /ruj|maskara|fondöten|fondoten|highlighter|makyaj|lipgloss|dudak|eyeliner|concealer|bronzer|pudra/.test(
      text,
    )
  )
    return "Kozmetik";
  if (
    /vitamin|kapsül|kapsul|protein|pro balance|probalance|colostrum|drinking gel|takviye|omega|mineraller/.test(
      text,
    )
  )
    return "Takviyeler";
  return "Kişisel Bakım";
};

const TONES = ["mint", "graphite", "ivory", "sage", "sun", "rose"];

const mapProduct = (row: StorefrontRow, index = 0): Product => {
  const paths = Array.isArray(row.image_paths)
    ? row.image_paths.filter((x): x is string => typeof x === "string")
    : [];
  const description = plainText(row.description);
  /*
    Görsel yolu iki biçimde gelebilir: ARC deposundaki göreli yol
    ya da tedarikçi CDN'inin tam adresi. Tedarikçi ürünlerinde
    görselleri kopyalamak yerine kaynağı kullanıyoruz.
  */
  const images = paths.map((path) =>
    path.startsWith("http")
      ? path
      : `${env.supabaseUrl}/storage/v1/object/public/arc-product-images/${path}`,
  );

  /*
    Görsel türü HAM yoldan belirlenir, dönüştürülmüş adresten
    değil. Kendi ürünlerimizin görselleri de tam adrese
    çevriliyor; adrese bakmak her ürünü tedarikçi ürünü
    sanmaya ve paket çekimlerinin kırpılmasına yol açıyordu.

    Ham yol "http" ile başlıyorsa tedarikçi CDN'inden gelen
    manken fotoğrafıdır. Göreli yol ise kendi deposundaki
    paket çekimidir.
  */
  const artStyle: "packshot" | "lifestyle" =
    paths[0]?.startsWith("http") ? "lifestyle" : "packshot";
  return {
    slug: row.slug,
    name: row.name,
    category: inferCategory(row),
    price: Number(row.price) / 100,
    oldPrice: row.compare_at_price
      ? Number(row.compare_at_price) / 100
      : undefined,
    eyebrow: row.vendor || "ARVOCULTURE",
    tone: TONES[index % TONES.length] as string,
    subtitle:
      plainText(row.subtitle) || "ArvoCulture seçkisinden özenle seçilmiş ürün.",
    description: description || plainText(row.subtitle),
    tags: row.product_type ? [row.product_type] : [],
    image: images[0],
    images,
    artStyle,
    // İçe aktarılan ürünlerde tablo hâlinde saklanan özellikler.
    specs: Array.isArray(row.specs)
      ? (row.specs as Array<{ label: string; value: string }>)
      : [],
    sizeGuide: Array.isArray(row.size_guide)
      ? (row.size_guide as Array<{ label: string; value: string }>)
      : [],
    sizes: Array.isArray(row.sizes) ? (row.sizes as string[]) : [],
    available: row.available,
  };
};

const applyBadge = (
  product: Product,
  badge: ProductBadgeRow | undefined,
): Product => ({
  ...product,
  badge: badge?.badge ?? undefined,
  badgeTone: badgeTones.has(badge?.badge_tone ?? "")
    ? (badge?.badge_tone as Product["badgeTone"])
    : "green",
  bestSeller: badge?.is_best_seller ?? false,
  discountPercent:
    badge?.discount_percent && badge.discount_percent > 0
      ? badge.discount_percent
      : undefined,
});

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,199}$/;

/**
 * Katalogun tamamını kapsaması gereken çağrılar için tek üst sınır.
 *
 * Sitemap, arama dizini ve "tüm ürünler" koleksiyonu kataloğun
 * tamamını görmek zorunda; bu sayı kataloğun bugünkü boyutunun
 * (3.400 civarı) belirgin biçimde üzerinde tutulmalı. Daha önce bu
 * değer üç ayrı dosyaya 3.000 olarak yazılmıştı ve katalog o sayıyı
 * aşınca aradaki ürünler sessizce görünmez oldu: arama onları
 * bulamıyor, sitemap Google'a bildirmiyor, favorilere eklenince
 * listede çıkmıyorlardı.
 *
 * Not: veritabanı tarafında da bir tavan var. Supabase'in PostgREST
 * `db_max_rows` ayarı öntanımlı olarak 1.000'dir ve buradaki değer
 * ne olursa olsun yanıtı keser; bu ayar 20.000'e çıkarıldı.
 */
export const CATALOG_LIMIT = 5000;

/**
 * Ürün kartının ihtiyaç duyduğu sütunlar.
 *
 * `description` bilerek yok. Kartta kullanılmıyor ama satır başına
 * en ağır alan o: katalog tüm sütunlarla 11,9 MB, bu listeyle
 * 3,0 MB. Fark her istekte Supabase'den sunucuya taşınan veridir.
 * Kart için gereken kısa metin `subtitle` alanından geliyor ve o
 * zaten veritabanı tarafında hesaplanıyor.
 *
 * `specs` ve `size_guide` de yalnızca ürün detay sayfasında
 * gösteriliyor; tekil sorgu tam satırı getirir.
 */
const CARD_COLUMNS =
  "slug,name,subtitle,vendor,product_type,price,compare_at_price,available,image_paths,sizes";

/**
 * Katalog listesi. ARC ulaşılamazsa boş liste döner; sayfa "katalog
 * geçici olarak görüntülenemiyor" durumunu gösterir. Eski fiyat gösterilmez.
 */
export const getStorefrontProducts = cache(
  async (limit = 24): Promise<Product[]> => {
    const [rows, badges] = await Promise.all([
      rpcOrEmpty<StorefrontRow>(
        "get_arvoculture_storefront_products",
        { p_limit: Math.min(CATALOG_LIMIT, Math.max(1, limit)) },
        {
          revalidate: 60,
          tags: ["storefront-products"],
          columns: CARD_COLUMNS,
        },
      ),
      getProductBadges(),
    ]);
    return rows.map((row, index) =>
      applyBadge(mapProduct(row, index), badges.get(row.slug)),
    );
  },
);

/**
 * Sitemap için yalnızca ürün adresleri.
 *
 * Sitemap ürünün adından fiyatına hiçbir alanını kullanmıyor,
 * yalnızca slug'ı yazıyor. Tam satır istemek 11,9 MB, yalnızca
 * slug istemek 0,3 MB taşıyor — kırk kat fark.
 */
export const getStorefrontProductSlugs = cache(
  async (limit = CATALOG_LIMIT): Promise<string[]> => {
    const rows = await rpcOrEmpty<{ slug: string }>(
      "get_arvoculture_storefront_products",
      { p_limit: Math.min(CATALOG_LIMIT, Math.max(1, limit)) },
      {
        revalidate: 3600,
        tags: ["storefront-products"],
        columns: "slug",
      },
    );
    return rows
      .map((row) => row.slug)
      .filter((slug): slug is string => typeof slug === "string");
  },
);

/**
 * İndirimli ürünler.
 *
 * Katalogdan süzmek yerine ayrı bir uç nokta kullanılıyor:
 * katalog son güncellenene göre sıralı olduğu için tedarikçi
 * ürünleri ilk 200'ü dolduruyor ve indirimliler listeye hiç
 * giremiyordu.
 */
export const getStorefrontDeals = cache(async (limit = 12) => {
  const rows = await rpcOrEmpty<StorefrontRow>(
    "get_arvoculture_storefront_deals",
    { p_limit: limit },
    { revalidate: 60, tags: ["storefront-deals"] },
  );
  return rows.map((row, index) => mapProduct(row, index));
});

export const getStorefrontCollectionProducts = cache(
  async ({
    collectionSlug,
    menuGroups,
    limit = 200,
  }: {
    collectionSlug?: string;
    menuGroups?: string[];
    limit?: number;
  }): Promise<Product[]> => {
    if (collectionSlug && !SLUG_PATTERN.test(collectionSlug)) return [];

    const [rows, badges] = await Promise.all([
      rpcOrEmpty<StorefrontRow>(
        "get_arvoculture_storefront_collection_products",
        {
          p_collection_slug: collectionSlug ?? null,
          p_menu_groups: menuGroups ?? null,
          p_limit: Math.min(200, Math.max(1, limit)),
        },
        {
          revalidate: 60,
          tags: [`storefront-collection-${collectionSlug ?? "all"}`],
        },
      ),
      getProductBadges(),
    ]);
    return rows.map((row, index) =>
      applyBadge(mapProduct(row, index), badges.get(row.slug)),
    );
  },
);

/**
 * Tek ürün. Burada hata bilinçli olarak yutulmuyor: ARC erişilemezse
 * istisna fırlar ve hata sınırı devreye girer. Aksi hâlde geçici bir
 * kesinti sırasında Google'a "bu ürün yok" (404) sinyali gider ve ürün
 * dizinden düşer.
 */
export const getStorefrontProduct = cache(
  async (slug: string): Promise<Product | undefined> => {
    if (!SLUG_PATTERN.test(slug)) return undefined;

    const [rows, badges] = await Promise.all([
      rpc<StorefrontRow>(
        "get_arvoculture_storefront_product",
        { p_slug: slug },
        { revalidate: 60, tags: [`storefront-product-${slug}`] },
      ),
      getProductBadges(),
    ]);

    const row = rows[0];
    return row ? applyBadge(mapProduct(row), badges.get(row.slug)) : undefined;
  },
);
