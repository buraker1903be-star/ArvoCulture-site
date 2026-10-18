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
  /*
    Ödeme yöntemi — ArvoARC'ta metadata'da SERBEST METİN
    ("Banka havalesi / EFT", "Kredi kartı", "Nakit").

    İsteğe bağlı iki sebeple: eski siparişlerde alan hiç
    yazılmamış (geçmişi "kart" varsayıp doldurmak, varsayımı
    veriye dönüştürmek olurdu) ve RPC'ye yeni eklendi, migration
    uygulanana kadar gelmiyor.
  */
  payment_method?: string | null;
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
/*
  ANAHTARLAR ArvoARC'ın gerçek durum kümesi: draft, created, picked_up,
  in_transit, delivered, cancelled, failed
  (arc_shipments_status_check). Önce "shipped" ve "returned" yazılıydı;
  ikisi de ArvoARC'ta hiç üretilmiyor (OTO'nun "returned" durumu
  "failed"e çevriliyor) ve gerçekten olan "picked_up" eksikti — o da
  yedek metne düşüyordu.

  draft ve cancelled burada yok: o gönderiler müşteriye zaten
  gönderilmiyor (get_arvoculture_my_orders onları eliyor).
*/
export const SHIPMENT_STATUS_LABEL: Record<string, string> = {
  created: "Kargoya verildi",
  picked_up: "Kuryeye teslim edildi",
  in_transit: "Yolda",
  delivered: "Teslim edildi",
  failed: "Kargoda sorun var",
};

/*
  SORUNLU PAKETTE MÜŞTERİ NE YAPACAK?

  Durum rozeti "Kargoda sorun var" diyordu ve orada bitiyordu: açıklama
  da yok, atılacak adım da. Müşteri takip numarasına bakıyor, bir şey
  anlamıyor ve destek kanalına yazmak için kendi yolunu arıyor.

  Metin ÖZÜR DİLEMİYOR ve suçu kargo firmasına atmıyor: ikisi de
  müşterinin sorusunu ("paketim ne olacak?") yanıtlamıyor. Ne olduğu ve
  ne yapılacağı yazıyor.
*/
export const SHIPMENT_STATUS_NOTE: Record<string, string> = {
  failed:
    "Kargo firması bu paketi teslim edemedi; paket bize geri dönüyor olabilir. Durumu takip ediyoruz — bize yazarsanız aynı gün dönüş yaparız.",
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

/*
  İADE TALEBİ. get_arvoculture_my_returns fonksiyonu baştan beri vardı
  ama vitrin onu hiç çağırmıyordu: müşteri talep açıyor, sonra ne
  olduğunu yalnızca e-postadan öğreniyordu. Hesabında hiçbir iz
  olmadığı için sipariş sayfasına dönünce form yine açık duruyor ve
  ikinci gönderim veritabanı hatasına düşüyordu.
*/
export type ReturnRequestItem = { sku?: string | null; name?: string | null; quantity?: number; total?: number };

export type ReturnRequestRow = {
  id: string;
  order_number: string;
  items: ReturnRequestItem[] | null;
  reason: string;
  status: string;
  /* Operasyoncunun notu: iade adresi ve kargo talimatı burada geliyor. */
  status_note: string | null;
  refund_amount: number | null;
  created_at: string;
  resolved_at: string | null;
};

export const RETURN_STATUS: Record<string, { label: string; detail: string }> = {
  beklemede: {
    label: "İnceleniyor",
    detail: "Talebiniz bize ulaştı. Onaylandığında ürünü nasıl göndereceğinizi yazacağız.",
  },
  onaylandi: {
    label: "Onaylandı",
    detail: "Ürünü aşağıdaki talimata göre gönderin. Elimize ulaşıp kontrol edildikten sonra iadeniz yapılır.",
  },
  reddedildi: {
    label: "Reddedildi",
    detail: "Talebiniz karşılanamadı.",
  },
  tamamlandi: {
    label: "Tamamlandı",
    detail: "İadeniz yapıldı. Bankanıza yansıması birkaç iş günü sürebilir.",
  },
};

/*
  SİPARİŞİN MÜŞTERİYE GÖRÜNEN DURUMU.

  ArvoARC'ın sipariş durumu "fulfilled"da kalıyor — orada bu KARGOYA
  VERİLDİ demek ve "teslim edildi" diye ayrı bir durum yok. Paketler
  teslim edilse bile müşteri "Kargoya verildi" görüyordu; oysa gönderi
  kayıtları teslimi biliyor (cron OTO'dan çekiyor).

  Teslim sayılması için bütün paketlerin teslim edilmiş olması gerek:
  üç paketli siparişte birinin teslimi, müşteri kalanını beklerken
  yanlış bilgi olurdu.
*/
export function siparisDurumEtiketi(order: Order): string {
  const paketler = (order.shipments ?? []).filter((paket) => paket.status !== "cancelled");
  if (
    order.status === "fulfilled" &&
    paketler.length > 0 &&
    paketler.every((paket) => paket.status === "delivered")
  ) {
    return "Teslim edildi";
  }
  return STATUS_LABEL[order.status] ?? order.status;
}

/**
 * Siparişin yolculuğu: hangi adımdayız?
 *
 * Detay sayfasında durum TEK BİR ROZETTİ ("HAZIRLANIYOR") ve
 * müşteriye yalnızca şu anı söylüyordu: öncesi ne oldu, sonrası
 * ne gelecek, ne kadar kaldı — hiçbiri yok. Sipariş sayfasına
 * girmenin birinci sebebi tam da bu soru.
 *
 * Adımlar ArvoARC'ın durumundan ve GÖNDERİLERDEN türetiliyor;
 * ikisi birden gerekiyor çünkü sipariş durumu "fulfilled"da
 * kalıyor (orada "kargoya verildi" demek) ve paketler teslim
 * edilse bile sipariş o durumda duruyor (bkz. siparisDurumEtiketi).
 *
 * İPTAL VE İADE ÇİZELGEYE GİRMEZ: onlar yolculuğun bir adımı
 * değil, yolculuğun sonlanması. Dört adımlık bir çubuğun içine
 * "iptal edildi" koymak, iptal edilmiş siparişi yoldaymış gibi
 * gösterirdi; çağıran taraf `null` alınca tek satırlık bir durum
 * gösteriyor.
 */
export type SiparisAdimi = {
  ad: string;
  /** Tamamlandı mı, şu an mı, yoksa henüz gelmedi mi? */
  durum: "gecti" | "simdi" | "bekliyor";
  not?: string;
};

export function siparisAdimlari(order: Order): SiparisAdimi[] | null {
  if (order.status === "cancelled" || order.status === "refunded") return null;

  const paketler = (order.shipments ?? []).filter(
    (paket) => paket.status !== "cancelled",
  );
  const kargoda = paketler.length > 0 || order.status === "fulfilled";
  const teslim =
    paketler.length > 0 && paketler.every((paket) => paket.status === "delivered");

  /*
    "Hazırlanıyor" adımı ödeme bekleyen siparişte GEÇİLMİŞ
    sayılmıyor: havale siparişi ödeme gelene kadar hazırlanmaya
    başlamıyor ve çubuğu ilerletmek, olmayan bir ilerlemeyi
    müjdelemek olurdu.

    ÖDEME NOTU ÇİZELGEDEN ÇIKTI. "Hazırlanıyor" adımının altında
    "Ödemeniz bekleniyor" yazıyordu ve canlıda çelişkili
    okunuyordu: sipariş hem hazırlanıyor hem ödeme bekliyor
    görünüyordu. Ödemenin kendi kutusu var; orada yöntemiyle ve
    havalede hesap numarasıyla birlikte duruyor.
  */
  const odendi = ["paid", "authorized", "partially_refunded"].includes(
    order.payment_status,
  );
  const hazirlaniyor = odendi || order.status !== "pending";

  const sirali: Array<[string, boolean, string | undefined]> = [
    ["Siparişiniz alındı", true, undefined],
    ["Hazırlanıyor", hazirlaniyor, undefined],
    ["Kargoda", kargoda, undefined],
    ["Teslim edildi", teslim, undefined],
  ];

  /* Son "tamam" olan adım ŞU AN; ondan sonrası bekliyor. */
  const sonTamam = sirali.reduce(
    (son, [, tamam], sira) => (tamam ? sira : son),
    0,
  );

  return sirali.map(([ad, , not], sira) => ({
    ad,
    not,
    durum: sira < sonTamam ? "gecti" : sira === sonTamam ? "simdi" : "bekliyor",
  }));
}

/**
 * Ödeme yöntemi etiketi ve havale olup olmadığı.
 *
 * Metin ArvoARC'tan serbest geliyor; vitrin onu OLDUĞU GİBİ
 * gösteriyor ama havale olup olmadığını bilmesi gerekiyor:
 * ödenmemiş havale siparişinde müşterinin parayı nereye
 * göndereceğini söylemek zorundayız. Ayırt etme kuralı
 * ArvoARC'ın `isBankTransfer` kuralıyla aynı — metinde "havale"
 * aranıyor; etiket orada da serbest metin olduğu için sabit bir
 * koda bağlanamıyor.
 */
export function odemeYontemi(order: Pick<Order, "payment_method">): {
  etiket: string | null;
  havale: boolean;
} {
  const metin = (order.payment_method ?? "").trim();
  if (!metin) return { etiket: null, havale: false };
  return {
    etiket: metin,
    havale: metin.toLocaleLowerCase("tr").includes("havale"),
  };
}

/** Müşteriye gösterilecek ödeme durumu. */
export const ODEME_DURUM_ETIKETI: Record<string, string> = {
  pending: "Ödeme bekleniyor",
  authorized: "Ödeme onaylandı",
  paid: "Ödendi",
  partially_refunded: "Kısmen iade edildi",
  refunded: "İade edildi",
  failed: "Ödeme alınamadı",
};
