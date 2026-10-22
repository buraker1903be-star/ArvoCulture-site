import type { SozlukAnahtari } from "./sozluk";

/*
  SİPARİŞ DURUM SAYFASININ TİPLERİ VE BİÇİMLENDİRMESİ.

  SUNUCUYA BAĞLI HİÇBİR ŞEY YOK ve bu bilinçli: okuma
  lib/siparis-durumu-oku.ts'te duruyor. Aynı dosyada olduğunda
  testler `@/lib/arc` üzerinden `@/lib/env`'e ulaşıyor ve ortam
  değişkeni eksik diye düşüyordu — depoda yazılı kural bunu
  söylüyor: test edilemeyen mantık parçasını ayırın.

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
 * Toplamdan düşülmüş indirim.
 *
 * HESAPLANIYOR, OKUNMUYOR: ArvoARC siparişte indirimi ayrı bir
 * sütunda tutmuyor; kupon da havale indirimi de doğrudan toplamdan
 * düşülüyor. İlk sürüm indirim satırını hiç göstermiyordu ve ilk
 * gerçek siparişte rakamlar TUTMUYORDU — 470,90 + 120,00 = 590,90
 * ama toplam 576,77 (havale indirimi, mal bedelinin %3'ü, kargoya
 * uygulanmıyor). Müşteri topladığında tutmayan bir hesap görünce
 * "benden fazla mı alındı" diye arar.
 *
 * VERGİ BU HESABA GİRMEZ. İkinci sürüm `tax` alanını da toplayıp
 * indirimi 14,13 yerine 75,44 gösterdi: toplam yine tutuyordu ama
 * iki satır birden uyduruk olmuştu. ArvoARC'ta `tax`, fiyatın
 * ÜZERİNE EKLENEN bir kalem değil, fiyatın İÇİNDEN ÇIKARILAN KDV —
 * hesaplayan fonksiyonun adı bunu söylüyor: `arc_extract_vat`.
 * Türkiye'de fiyatlar KDV dahil; vergi bilgi olarak gösterilir,
 * toplama eklenmez.
 *
 * Farkı almak indirimin KAYNAĞINI bilmeyi gerektirmiyor: kupon,
 * havale ya da ileride eklenecek başka bir indirim, hepsi buraya
 * düşüyor. Eksi çıkarsa 0 dönüyor; uydurma bir "indirim" yazmaktansa
 * satırı hiç yazmamak doğru.
 */
export function indirimTutari(
  s: Pick<SiparisDurumu, "ara_toplam" | "kargo" | "toplam">,
): number {
  return toplamFarki(s.ara_toplam, s.kargo, s.toplam);
}

/**
 * Aynı kural, sipariş listesindeki/hesap içindeki sipariş için.
 *
 * İKİ EKRAN AYNI SİPARİŞİ GÖSTERİYOR ve biri hesabı doğru, öbürü
 * yanlış yapıyordu. Misafir takip sayfası (`/siparis/<anahtar>`)
 * indirimi buradaki kuralla hesaplıyordu; hesap içindeki sipariş
 * detayı (`/hesap/siparis/<numara>`) ise ArvoARC'ın `discount`
 * alanına bakıyordu ve o alan HAVALE İNDİRİMİNİ TAŞIMIYOR.
 *
 * Sonuç canlıda görüldü (AC261017-F93525): ara toplam 470,90 +
 * kargo 120,00 = 590,90 ama toplam 576,77. Aradaki 14,13 hiçbir
 * satırda yazmıyordu. Müşteri topladığında tutmayan bir hesap
 * görünce "benden fazla mı alındı" diye arar.
 *
 * Kural neden çıkarma: ArvoARC siparişte indirimi ayrı bir sütunda
 * TUTMUYOR; kupon da havale indirimi de doğrudan toplamdan
 * düşülüyor. Elimizdeki tek doğru kaynak farkın kendisi.
 */
export function toplamFarki(
  araToplam: number | null | undefined,
  kargo: number | null | undefined,
  toplam: number | null | undefined,
): number {
  const fark = (araToplam ?? 0) + (kargo ?? 0) - (toplam ?? 0);
  return fark > 0 ? fark : 0;
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
  Aynı kodların SÖZLÜK anahtarları (lib/sozluk): İngilizce vitrinde
  sipariş takip sayfası durumu tarayıcıda çeviriyor. Tanınmayan kod
  null — yukarıdaki metinlerle aynı kural, sayfa onu boş geçiyor.
*/
const DURUM_ANAHTARI: Record<string, SozlukAnahtari> = {
  pending: "durumPending",
  confirmed: "durumConfirmed",
  processing: "durumProcessing",
  fulfilled: "durumFulfilled",
  cancelled: "durumCancelled",
  refunded: "durumRefunded",
};
const ODEME_ANAHTARI: Record<string, SozlukAnahtari> = {
  pending: "odemePending",
  authorized: "odemeAuthorized",
  paid: "odemePaid",
  partially_refunded: "odemePartiallyRefunded",
  refunded: "odemeRefunded",
  failed: "odemeFailed",
};
export const durumAnahtari = (kod: string): SozlukAnahtari | null => DURUM_ANAHTARI[kod] ?? null;
export const odemeAnahtari = (kod: string): SozlukAnahtari | null => ODEME_ANAHTARI[kod] ?? null;

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
