"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Hesap bölümlerinin yan menüsü.
 *
 * Her şey TEK SAYFADAYDI: profil formu, adres defteri ve bütün
 * sipariş listesi alt alta. Üç kusuru vardı:
 *
 * * SAYFA MÜŞTERİYLE BİRLİKTE BÜYÜYORDU. Sekiz siparişte bile
 *   uzun bir kaydırma; elli siparişte profil formu erişilemez
 *   hale geliyordu. Başlıktaki menü bu yüzden çapalara
 *   (#adreslerim) bağlanmıştı — çapa, sayfanın uzunluğuna
 *   konmuş bir yamadır.
 * * BÖLÜMLERİN ADRESİ YOKTU. "Adreslerimi düzelt" diye bir
 *   bağlantı gönderilemiyordu.
 * * TUTARSIZDI: kuponlar ve hediye çekleri zaten ayrı
 *   sayfalardı, ötekiler değil.
 *
 * SEKME DEĞİL SAYFA: sekme içeriği tıklamanın arkasına saklar
 * ama tek adreste bırakır — geri düğmesi ve paylaşılan bağlantı
 * çalışmaz. Ayrıca bu depoda sekmeler bir kez denenip bilerek
 * kaldırılmıştı; dönülen yer sekme değil, bölümün kendi sayfası.
 */

const BOLUMLER = [
  { href: "/hesap", ad: "Özet" },
  { href: "/hesap/bilgilerim", ad: "Hesap bilgilerim" },
  { href: "/hesap/adreslerim", ad: "Adreslerim" },
  { href: "/hesap/siparislerim", ad: "Siparişlerim" },
  { href: "/hesap/kuponlarim", ad: "Kuponlarım" },
  { href: "/hesap/hediye-ceklerim", ad: "Hediye çeklerim" },
];

export function HesapYanMenu() {
  const yol = usePathname();

  return (
    <nav className="hesap-yan" aria-label="Hesap bölümleri">
      {BOLUMLER.map((bolum) => {
        /*
          "/hesap" her bölümün önekine uyuyor; tam eşleşme
          aranmazsa Özet satırı her sayfada seçili görünürdü.
        */
        const secili = yol === bolum.href;
        return (
          <Link
            key={bolum.href}
            href={bolum.href}
            className="hesap-yan-link"
            aria-current={secili ? "page" : undefined}
          >
            {bolum.ad}
          </Link>
        );
      })}
    </nav>
  );
}
