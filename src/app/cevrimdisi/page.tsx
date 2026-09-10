import type { Metadata } from "next";
import { OfflineRetry } from "@/components/offline-retry";

/**
 * Çevrimdışı ekranı.
 *
 * Servis çalışanı bu sayfayı kurulum sırasında cihaza indiriyor;
 * bağlantı koptuğunda tarayıcının kendi "site açılamadı" hatası
 * yerine bu görünüyor. Uygulama gibi hissettiren ayrıntı budur:
 * uygulamalar bağlantı yokken de bir şey gösterir.
 *
 * Arama motorlarına kapalı: aranıp bulunacak bir sayfa değil.
 */
export const metadata: Metadata = {
  title: "Bağlantı yok",
  robots: { index: false, follow: false },
};

export default function Offline() {
  return (
    <main className="simple-page">
      <p className="eyebrow">Çevrimdışı</p>
      <h1>İnternet bağlantısı görünmüyor.</h1>
      <p>
        Bağlantın geri geldiğinde kaldığın yerden devam edebilirsin. Sepetin ve
        favorilerin bu cihazda duruyor; kaybolmadı.
      </p>
      <OfflineRetry />
    </main>
  );
}
