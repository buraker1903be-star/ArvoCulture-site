"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLinkStatus } from "next/link";

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
  /*
    Sipariş DETAYI da (/hesap/siparis/<numara>) bu bölüme ait.
    Önce yalnızca tam eşleşme aranıyordu ve detaya girince menüde
    hiçbir satır seçili kalmıyordu: müşteri hesabın neresinde
    olduğunu kaybediyordu.
  */
  { href: "/hesap/siparislerim", ad: "Siparişlerim", onek: "/hesap/siparis" },
  { href: "/hesap/kuponlarim", ad: "Kuponlarım" },
  { href: "/hesap/hediye-ceklerim", ad: "Hediye çeklerim" },
];

/**
 * Tıklanan satırın bekleme hâli.
 *
 * Bölümler sunucuda çiziliyor (`force-dynamic`), yani tıklama ile
 * yeni içerik arasında bir boşluk var. Önce o boşlukta HİÇBİR ŞEY
 * olmuyordu: müşteri tıklıyor, menü aynı kalıyor, "çalışmadı" sanıp
 * tekrar tıklıyordu. `useLinkStatus` o anı bildiriyor.
 */
function BeklemeNoktasi() {
  const { pending } = useLinkStatus();
  return pending ? <span className="hesap-yan-bekleme" aria-hidden="true" /> : null;
}

export function HesapYanMenu() {
  const yol = usePathname();

  return (
    <nav className="hesap-yan" aria-label="Hesap bölümleri">
      {BOLUMLER.map((bolum) => {
        /*
          "/hesap" her bölümün önekine uyuyor; tam eşleşme
          aranmazsa Özet satırı her sayfada seçili görünürdü. Bu
          yüzden önek YALNIZCA açıkça yazan bölümde kullanılıyor.
        */
        const secili =
          yol === bolum.href ||
          (bolum.onek !== undefined && yol.startsWith(`${bolum.onek}/`));
        return (
          <Link
            key={bolum.href}
            href={bolum.href}
            className="hesap-yan-link"
            aria-current={secili ? "page" : undefined}
          >
            {bolum.ad}
            <BeklemeNoktasi />
          </Link>
        );
      })}
    </nav>
  );
}
