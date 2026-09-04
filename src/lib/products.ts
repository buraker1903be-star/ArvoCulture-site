import { cache } from "react";
import { rpc, rpcOrEmpty } from "@/lib/arc";
import { env } from "@/lib/env";
import type { Product } from "@/lib/product-types";

export { formatPrice } from "@/lib/product-types";
export type { Product } from "@/lib/product-types";

type StorefrontRow = {
  slug: string;
  name: string;
  description: string | null;
  subtitle: string | null;
  vendor: string | null;
  product_type: string | null;
  price: number;
  compare_at_price: number | null;
  available: boolean;
  image_paths: unknown;
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
  if (/tişört|tisort|sweat|hoodie|giyim|oversize|regular fit/.test(text))
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
  const images = paths.map(
    (path) =>
      `${env.supabaseUrl}/storage/v1/object/public/arc-product-images/${path}`,
  );
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
 * Katalog listesi. ARC ulaşılamazsa boş liste döner; sayfa "katalog
 * geçici olarak görüntülenemiyor" durumunu gösterir. Eski fiyat gösterilmez.
 */
export const getStorefrontProducts = cache(
  async (limit = 24): Promise<Product[]> => {
    const [rows, badges] = await Promise.all([
      rpcOrEmpty<StorefrontRow>(
        "get_arvoculture_storefront_products",
        { p_limit: Math.min(200, Math.max(1, limit)) },
        { revalidate: 60, tags: ["storefront-products"] },
      ),
      getProductBadges(),
    ]);
    return rows.map((row, index) =>
      applyBadge(mapProduct(row, index), badges.get(row.slug)),
    );
  },
);

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
