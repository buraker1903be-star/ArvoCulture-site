import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase-public";

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
  available?: boolean;
  badge?: string;
  badgeTone?: "green" | "navy" | "gold" | "red";
  bestSeller?: boolean;
  discountPercent?: number;
};

export const products: Product[] = [
  {
    slug: "basic-regular-fit-mint",
    name: "Basic Regular Fit Mint Yeşili Tişört",
    category: "Giyim",
    price: 599.9,
    eyebrow: "ARVOCULTURE APPAREL",
    tone: "mint",
    subtitle:
      "Dengeli regular fit kalıbı ve pamuklu dokusuyla zamansız bir günlük stil.",
    description:
      "Penye cotton kumaşı, bisiklet yakası ve kısa kollu regular fit kalıbıyla günlük kullanıma uygun olarak tasarlandı.",
    tags: ["Regular Fit", "Pamuk", "Erkek"],
  },
  {
    slug: "basic-regular-fit-fume",
    name: "Basic Regular Fit Füme Tişört",
    category: "Giyim",
    price: 599.9,
    eyebrow: "ARVOCULTURE APPAREL",
    tone: "graphite",
    subtitle:
      "Dengeli regular fit kalıbı ve pamuklu dokusuyla zamansız bir günlük stil.",
    description:
      "Penye cotton kumaşı, bisiklet yakası ve kısa kollu regular fit kalıbıyla günlük kullanıma uygun olarak tasarlandı.",
    tags: ["Regular Fit", "Pamuk", "Erkek"],
  },
  {
    slug: "society-vancouver",
    name: "The Society Vancouver Oversize Tişört",
    category: "Giyim",
    price: 1000,
    eyebrow: "THE SOCIETY COLLECTION",
    tone: "ivory",
    subtitle:
      "Rahat oversize kalıbı ve özgün baskısıyla günlük stilin güçlü parçası.",
    description:
      "Şehir kültüründen ilham alan tasarımı, rahat kalıbı ve yumuşak dokusuyla modern stile eşlik eder.",
    tags: ["Oversize", "Unisex", "Koleksiyon"],
  },
  {
    slug: "l-recapin-set",
    name: "L-Recapin Şampuan + Tonik İkilisi",
    category: "Bakım",
    price: 3423.63,
    oldPrice: 4027.8,
    eyebrow: "BEAUTY & CARE",
    tone: "sage",
    subtitle:
      "Saç ve saç derisi bakım rutininizi tamamlamak için seçilmiş bakım seti.",
    description:
      "Şampuan ve toniği bir araya getiren iki aşamalı set, düzenli saç bakım rutininizi tamamlamak üzere sunulur.",
    tags: ["Saç Bakımı", "Set", "Çok Satan"],
  },
  {
    slug: "aloe-via-spf50",
    name: "Aloe Via Güneş Koruyucu SPF 50",
    category: "Bakım",
    price: 1699.9,
    eyebrow: "BEAUTY & CARE",
    tone: "sun",
    subtitle:
      "Günlük güneş bakımını yüksek koruma faktörüyle tamamlayan bakım ürünü.",
    description:
      "SPF 50 koruma faktörü ve Aloe Vera içeren formülüyle günlük güneş bakım rutininize eşlik eder.",
    tags: ["SPF 50", "Güneş Bakımı", "Aloe Vera"],
  },
  {
    slug: "iconic-elixirs",
    name: "Iconic Elixirs Eau de Parfum",
    category: "Parfüm",
    price: 1899.9,
    eyebrow: "SIGNATURE SCENTS",
    tone: "rose",
    subtitle: "Karakterinizi tamamlayan, özgün ve kalıcı bir koku deneyimi.",
    description:
      "Günün ritmine eşlik eden karakterli koku profiliyle stilinize özgün bir imza kazandırır.",
    tags: ["Parfüm", "Unisex", "Yeni"],
  },
];
export const formatPrice = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
    n,
  );
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

async function getProductBadges(): Promise<Map<string, ProductBadgeRow>> {
  try {
    const endpoint = new URL(
      "/rest/v1/rpc/get_arvoculture_storefront_product_badges",
      SUPABASE_URL,
    );
    const [response, badges] = await Promise.all([
      fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: "{}",
      next: { revalidate: 60, tags: ["storefront-product-badges"] },
    });
    if (!response.ok) return new Map();
    const rows = (await response.json()) as ProductBadgeRow[];
    return new Map(rows.map((row) => [row.slug, row]));
  } catch {
    return new Map();
  }
}

const plainText = (value: string | null | undefined) =>
  (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

const inferCategory = (row: StorefrontRow) => {
  const text = `${row.product_type ?? ""} ${row.name}`.toLocaleLowerCase(
    "tr-TR",
  );
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

const mapProduct = (row: StorefrontRow, index = 0): Product => {
  const paths = Array.isArray(row.image_paths)
    ? row.image_paths.filter((x): x is string => typeof x === "string")
    : [];
  const description = plainText(row.description);
  return {
    slug: row.slug,
    name: row.name,
    category: inferCategory(row),
    price: Number(row.price) / 100,
    oldPrice: row.compare_at_price
      ? Number(row.compare_at_price) / 100
      : undefined,
    eyebrow: row.vendor || "ARVOCULTURE",
    tone: ["mint", "graphite", "ivory", "sage", "sun", "rose"][index % 6],
    subtitle:
      plainText(row.subtitle) ||
      "ArvoCulture seçkisinden özenle seçilmiş ürün.",
    description: description || plainText(row.subtitle),
    tags: row.product_type ? [row.product_type] : [],
    image: paths[0]
      ? `${SUPABASE_URL}/storage/v1/object/public/arc-product-images/${paths[0]}`
      : undefined,
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

export async function getStorefrontProducts(limit = 24): Promise<Product[]> {
  const url = SUPABASE_URL;
  const key = SUPABASE_PUBLISHABLE_KEY;
  try {
    const endpoint = new URL(
      "/rest/v1/rpc/get_arvoculture_storefront_products",
      url,
    );
    const [response, badges] = await Promise.all([
      fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_limit: Math.min(200, Math.max(1, limit)) }),
      next: { revalidate: 60, tags: ["storefront-products"] },
      }),
      getProductBadges(),
    ]);
    if (!response.ok) return products;
    const rows = (await response.json()) as StorefrontRow[];
    return rows.map((row, index) =>
      applyBadge(mapProduct(row, index), badges.get(row.slug)),
    );
  } catch {
    return products;
  }
}

export async function getStorefrontCollectionProducts({
  collectionSlug,
  menuGroups,
  limit = 200,
}: {
  collectionSlug?: string;
  menuGroups?: string[];
  limit?: number;
}): Promise<Product[]> {
  if (
    collectionSlug &&
    !/^[a-z0-9][a-z0-9-]{0,199}$/.test(collectionSlug)
  ) {
    return [];
  }

  try {
    const endpoint = new URL(
      "/rest/v1/rpc/get_arvoculture_storefront_collection_products",
      SUPABASE_URL,
    );
    const [response, badges] = await Promise.all([
      fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_collection_slug: collectionSlug ?? null,
        p_menu_groups: menuGroups?.length ? menuGroups : null,
        p_limit: Math.min(200, Math.max(1, limit)),
      }),
      next: {
        revalidate: 60,
        tags: [
          collectionSlug
            ? `storefront-collection-${collectionSlug}`
            : "storefront-collection-groups",
        ],
      },
      }),
      getProductBadges(),
    ]);
    if (!response.ok) return [];
    const rows = (await response.json()) as StorefrontRow[];
    return rows.map((row, index) =>
      applyBadge(mapProduct(row, index), badges.get(row.slug)),
    );
  } catch {
    return [];
  }
}

export async function getStorefrontProduct(
  slug: string,
): Promise<Product | undefined> {
  if (!/^[a-z0-9][a-z0-9-]{0,199}$/.test(slug)) return undefined;
  try {
    const endpoint = new URL(
      "/rest/v1/rpc/get_arvoculture_storefront_product",
      SUPABASE_URL,
    );
    const [response, badges] = await Promise.all([
      fetch(endpoint, {
        method: "POST",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ p_slug: slug }),
        next: { revalidate: 60, tags: [`storefront-product-${slug}`] },
      }),
      getProductBadges(),
    ]);
    if (!response.ok) return undefined;
    const rows = (await response.json()) as StorefrontRow[];
    return rows[0]
      ? applyBadge(mapProduct(rows[0]), badges.get(rows[0].slug))
      : undefined;
  } catch {
    return undefined;
  }
}
