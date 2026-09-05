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
