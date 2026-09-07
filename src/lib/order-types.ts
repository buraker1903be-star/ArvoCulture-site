export type OrderItem = {
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total: number;
  slug: string | null;
  image: string | null;
};

export type Order = {
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  currency: string;
  coupon_code: string | null;
  address: {
    line?: string;
    district?: string;
    city?: string;
    postal?: string;
  };
  created_at: string;
  items: OrderItem[];
};

export const STATUS_LABEL: Record<string, string> = {
  pending: "Ödeme bekleniyor",
  confirmed: "Hazırlanıyor",
  processing: "Hazırlanıyor",
  fulfilled: "Teslim edildi",
  delivered: "Teslim edildi",
  cancelled: "İptal edildi",
  refunded: "İade edildi",
};

/** ARC görsel yolunu tam adrese çevirir. */
export function productImageUrl(supabaseUrl: string, path: string | null) {
  if (!path) return null;
  return `${supabaseUrl}/storage/v1/object/public/arc-product-images/${path}`;
}

export function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

/**
 * Görseli olmayan kalemler için baş harf yer tutucusu.
 * Boş bir kare "yükleniyor" izlenimi veriyor; harf kasıtlı görünür.
 */
export function initials(name: string) {
  return name
    .replace(/^LR\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toLocaleUpperCase("tr-TR") ?? "")
    .join("");
}
