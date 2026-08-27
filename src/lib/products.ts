import {
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
} from "@/lib/supabase-public";

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
export async function getStorefrontProducts(limit = 24): Promise<Product[]> {
  const url = SUPABASE_URL;
  const key = SUPABASE_PUBLISHABLE_KEY;
  try {
    const endpoint = new URL(
      "/rest/v1/rpc/get_arvoculture_storefront_products",
      url,
    );
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_limit: Math.min(100, Math.max(1, limit)) }),
      next: { revalidate: 60, tags: ["storefront-products"] },
    });
    if (!response.ok) return products;
    const rows = (await response.json()) as StorefrontRow[];
    return rows.map((row, index) => {
      const paths = Array.isArray(row.image_paths)
        ? row.image_paths.filter((x): x is string => typeof x === "string")
        : [];
      const image = paths[0]
        ? `${url}/storage/v1/object/public/organization-assets/${paths[0]}`
        : undefined;
      return {
        slug: row.slug,
        name: row.name,
        category: row.product_type || "Seçkiler",
        price: Number(row.price) / 100,
        oldPrice: row.compare_at_price
          ? Number(row.compare_at_price) / 100
          : undefined,
        eyebrow: row.vendor || "ARVOCULTURE",
        tone: ["mint", "graphite", "ivory", "sage", "sun", "rose"][index % 6],
        subtitle:
          row.subtitle || "ArvoCulture seçkisinden özenle seçilmiş ürün.",
        description: row.description || row.subtitle || "",
        tags: row.product_type ? [row.product_type] : [],
        image,
        available: row.available,
      };
    });
  } catch {
    return products;
  }
}
