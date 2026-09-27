export type OrderItem = {
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total: number;
  slug: string | null;
  image: string | null;
};

/** RPC tarafından tek şemaya normalleştirilmiş adres. */
export type OrderAddress = {
  line?: string;
  district?: string;
  city?: string;
  postal?: string;
  name?: string;
  phone?: string;
  company?: string;
  tax_office?: string;
  tax_number?: string;
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
  address: OrderAddress | null;
  billing_address: OrderAddress | null;
  note: string | null;
  created_at: string;
  items: OrderItem[];
  /*
    Gönderiler. Bir sipariş birden çok pakete bölünebiliyor (ayrı
    depolardan çıkan kalemler) ve her paketin kendi takip numarası var.
    ArvoARC'ın get_arvoculture_my_orders fonksiyonundan geliyor; eski
    siparişlerde ve fonksiyon yenilenmeden önce ALAN HİÇ GELMEYEBİLİR,
    bu yüzden isteğe bağlı.
  */
  shipments?: Shipment[] | null;
};

export type ShipmentItem = { name: string; quantity: number };

export type Shipment = {
  sequence: number;
  status: string;
  carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  items: ShipmentItem[];
};

/*
  Gönderi durumunun müşteriye gösterilen karşılığı. Panelin ayrıntılı
  adımları (OTO'nun arrivedTerminal, outForDelivery…) burada üç şeye
  iniyor: yola çıktı, teslim edildi, sorun var. Müşterinin kararını
  değiştiren tek şey bu.
*/
export const SHIPMENT_STATUS_LABEL: Record<string, string> = {
  created: "Kargoya verildi",
  shipped: "Yolda",
  in_transit: "Yolda",
  delivered: "Teslim edildi",
  failed: "Kargoda sorun var",
  returned: "İade sürecinde",
};

export const STATUS_LABEL: Record<string, string> = {
  pending: "Ödeme bekleniyor",
  confirmed: "Hazırlanıyor",
  processing: "Hazırlanıyor",
  /*
    ArvoARC'ta "fulfilled" KARGOYA VERİLDİ demek, teslim edildi değil
    (ArvoARC/src/lib/order-flow.ts). Burada "Teslim edildi" yazıyordu ve
    sipariş kargoya verilir verilmez müşteriye paketi teslim alınmış gibi
    gösteriyordu; artık durum gönderi oluşunca kendiliğinden değiştiği
    için bu her siparişte olurdu.
  */
  fulfilled: "Kargoya verildi",
  delivered: "Teslim edildi",
  cancelled: "İptal edildi",
  refunded: "İade edildi",
};

/**
 * ArvoARC görsel yolunu tam adrese çevirir.
 *
 * Tedarikçi ürünlerinin görselleri zaten tam adres olarak
 * saklanıyor; önüne Supabase adresi eklenince bozuk bağlantı
 * oluşuyor ve sipariş kartlarında kırık görsel çıkıyordu.
 */
export function productImageUrl(supabaseUrl: string, path: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
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
