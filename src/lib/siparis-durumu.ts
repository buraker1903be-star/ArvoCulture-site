import "server-only";
import { rpcDeger } from "@/lib/arc";

/*
  SİPARİŞ DURUM SAYFASININ VERİSİ.

  Müşteriye WhatsApp'tan giden bağlantı buraya düşüyor. Oturum
  istemiyor: siparişi bulan şey bağlantıdaki 32 haneli anahtar
  (ArvoARC `arc_orders.public_token`).

  Mevcut sipariş detayı (/hesap/siparis/[numara]) oturum arkasında ve
  misafir sipariş veren müşteri oraya giremiyor; bildirimdeki bağlantı
  giriş duvarına çarpardı.

  ADRES, E-POSTA VE TELEFON GELMİYOR. Fonksiyon onları hiç
  döndürmüyor: bağlantı WhatsApp'tan gidiyor ve iletilebiliyor,
  "siparişim nerede" sorusu için de gerekmiyorlar.
*/

export type DurumKalemi = {
  ad: string;
  sku: string | null;
  adet: number;
  birim: number;
  tutar: number;
};

export type DurumGonderisi = {
  firma: string | null;
  takip_no: string | null;
  takip_adresi: string | null;
  durum: string | null;
  cikis: string | null;
  teslim: string | null;
};

export type SiparisDurumu = {
  siparis_no: string;
  tarih: string;
  durum: string;
  odeme_durumu: string;
  musteri: string | null;
  para_birimi: string | null;
  ara_toplam: number;
  kargo: number;
  vergi: number;
  toplam: number;
  kalemler: DurumKalemi[];
  gonderiler: DurumGonderisi[];
};

/** Anahtarın biçimi sunucuda da denetleniyor; veritabanına boşuna gidilmiyor. */
export const anahtarGecerli = (anahtar: string) => /^[0-9a-f]{32}$/.test(anahtar);

/**
 * Siparişi anahtarıyla okur.
 *
 * `null` = böyle bir sipariş yok (sayfa 404 verir).
 * Okuma başarısız olursa `ArcError` fırlar — çağıran taraf "sipariş
 * yok" ile "okuyamadım"ı ayırmalı; ikisini aynı göstermek müşteriye
 * "siparişiniz bulunamadı" dedirtir ve destek çağrısı üretir.
 */
export async function getSiparisDurumu(anahtar: string): Promise<SiparisDurumu | null> {
  if (!anahtarGecerli(anahtar)) return null;
  /*
    ÖNBELLEĞE GİRMEZ. Sipariş durumu müşteri sayfayı açtığı anda
    doğru olmalı: "kargoya verildi" mesajını alıp bağlantıya basan
    müşteriye altmış saniye önceki "hazırlanıyor" durumunu göstermek,
    bildirimin kendisini yalanlar.
  */
  return await rpcDeger<SiparisDurumu>(
    "arc_storefront_order_status",
    { p_token: anahtar },
    { onbelleksiz: true },
  );
}

/** Panelin durum kodları; müşteri "processing" okumamalı. */
const DURUM_METNI: Record<string, string> = {
  pending: "Siparişiniz alındı",
  confirmed: "Siparişiniz onaylandı",
  processing: "Hazırlanıyor",
  fulfilled: "Kargoya verildi",
  cancelled: "İptal edildi",
  refunded: "İade edildi",
};

const ODEME_METNI: Record<string, string> = {
  pending: "Ödeme bekleniyor",
  authorized: "Ödeme onaylandı",
  paid: "Ödendi",
  partially_refunded: "Kısmen iade edildi",
  refunded: "İade edildi",
  failed: "Ödeme alınamadı",
};

/*
  Tanınmayan kod OLDUĞU GİBİ gösterilmiyor, boş geçiliyor: ArvoARC'a
  yeni bir durum eklendiği gün müşteriye "awaiting_restock" yazmak,
  hiçbir şey yazmamaktan kötü.
*/
export const durumMetni = (kod: string) => DURUM_METNI[kod] ?? null;
export const odemeMetni = (kod: string) => ODEME_METNI[kod] ?? null;

/*
  Tutarlar ArvoARC'tan KURUŞ olarak geliyor; vitrin TL gösteriyor.
  Bu sınır bu depoda iki kez hata üretti, o yüzden çevrim tek yerde.
*/
export const liraYazisi = (kurus: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
    (kurus ?? 0) / 100,
  );

/*
  Tarih TÜRKİYE saatiyle. Dilim verilmezse sunucunun yerel saati
  (UTC) yazılır ve gece 00:00–03:00 arasındaki sipariş bir önceki güne
  düşer.
*/
export const tarihYazisi = (iso: string) =>
  new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
