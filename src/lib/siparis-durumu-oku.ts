import "server-only";
import { rpcDeger } from "@/lib/arc";
import { anahtarGecerli, type SiparisDurumu } from "@/lib/siparis-durumu";

/*
  SİPARİŞ DURUM SAYFASININ OKUMASI.

  Tipler ve biçimlendirme lib/siparis-durumu.ts'te; burada yalnızca
  ArvoARC çağrısı var. Ayrı durmalarının sebebi test: aynı dosyada
  olsalardı saf mantığı sınayan test de `@/lib/env` üzerinden ortam
  değişkeni isterdi.
*/

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

