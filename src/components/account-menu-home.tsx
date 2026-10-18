"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Başlıktaki hesap menüsünün GİRİŞ SONRASI yüzü.
 *
 * Önceden menü, hesap sayfasının tamamını basıyordu (profil formu,
 * adres defteri, sipariş listesi); 27rem'lik bir açılır menüde
 * sütunlar üst üste biniyordu. Sonra düz bir bağlantı listesi
 * geldi — çalışıyordu ama mağazanın geri kalanıyla aynı dilde
 * konuşmuyordu: isimsiz bir selam, altı çizgisiz dört satır.
 *
 * Buradaki iki parça o yüzden var:
 *
 * * SELAM MÜŞTERİNİN ADIYLA. Giriş yapmış birine e-posta adresini
 *   göstermek, tanımadığını söylemektir. Ad profilden geliyor;
 *   yoksa e-postanın baş kısmı kullanılıyor — "burakerdogann"
 *   bile "burakerdogann@outlook.com.tr"den sıcaktır.
 * * BAĞLANTILAR KART. Simge + başlık + tek kelimelik alt metin,
 *   müşterinin satırları okumadan ayırt etmesini sağlıyor; menü
 *   altı maddeye çıkınca düz liste tarandığında hepsi aynı
 *   görünüyordu.
 */

/** Selamda kullanılacak ad: profildeki ilk ad, yoksa e-postanın baş kısmı. */
export function selamAdi(profilAdi: string, eposta: string | undefined): string {
  const ad = profilAdi.trim().split(/\s+/)[0] ?? "";
  if (ad) return ad;

  /*
    E-postanın baş kısmı. Nokta ve alt çizgi ayırıcı sayılıyor
    ("ayse.yilmaz" → "Ayse"), rakamlar atılmıyor: "burak1903"
    müşterinin kendi yazdığı addır, kırpmak onu yabancılaştırır.
  */
  const bas = (eposta ?? "").split("@")[0]?.split(/[._-]/)[0] ?? "";
  if (!bas) return "";
  return bas.charAt(0).toLocaleUpperCase("tr") + bas.slice(1);
}

/** Yuvarlaktaki tek harf. Türkçe'de "ilhan" → "İ" olmalı. */
function basHarf(ad: string, eposta: string | undefined): string {
  const kaynak = ad || eposta || "";
  return kaynak.charAt(0).toLocaleUpperCase("tr") || "•";
}

type Satir = {
  href: string;
  baslik: string;
  alt: string;
  simge: ReactNode;
};

/* Simgeler satır içinde: altı küçük çizim için ayrı bir istek
   yapmak, menünün açılmasını yavaşlatırdı. */
const CIZGI = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const SATIRLAR: Satir[] = [
  {
    href: "/hesap/bilgilerim",
    baslik: "Profilim",
    alt: "Bilgileriniz",
    simge: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3.4" {...CIZGI} />
        <path d="M4.8 19.6a7.2 7.2 0 0 1 14.4 0" {...CIZGI} />
      </svg>
    ),
  },
  {
    href: "/hesap/adreslerim",
    baslik: "Adreslerim",
    alt: "Teslimat",
    simge: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21s6.4-5.3 6.4-10.2A6.4 6.4 0 0 0 5.6 10.8C5.6 15.7 12 21 12 21Z" {...CIZGI} />
        <circle cx="12" cy="10.4" r="2.3" {...CIZGI} />
      </svg>
    ),
  },
  {
    href: "/hesap/siparislerim",
    baslik: "Siparişlerim",
    alt: "Takip",
    simge: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.6 7.6 12 3.4l8.4 4.2v8.8L12 20.6l-8.4-4.2Z" {...CIZGI} />
        <path d="M3.6 7.6 12 11.8l8.4-4.2M12 11.8v8.8" {...CIZGI} />
      </svg>
    ),
  },
  {
    href: "/favoriler",
    baslik: "Favorilerim",
    alt: "Beğendikleriniz",
    simge: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 20s-7.3-4.4-7.3-9.4A3.9 3.9 0 0 1 12 8.4a3.9 3.9 0 0 1 7.3 2.2c0 5-7.3 9.4-7.3 9.4Z"
          {...CIZGI}
        />
      </svg>
    ),
  },
  {
    href: "/hesap/kuponlarim",
    baslik: "Kuponlarım",
    alt: "İndirim kodları",
    simge: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M3.4 9.3V6.8h17.2v2.5a2.7 2.7 0 0 0 0 5.4v2.5H3.4v-2.5a2.7 2.7 0 0 0 0-5.4Z"
          {...CIZGI}
        />
        <path d="M9.6 9.6v4.8" {...CIZGI} strokeDasharray="1.6 2.4" />
      </svg>
    ),
  },
  {
    href: "/hesap/hediye-ceklerim",
    baslik: "Hediye çeklerim",
    alt: "Bakiye",
    simge: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.9 10.6h16.2v9.1H3.9zM3 7.2h18v3.4H3zM12 7.2v12.5" {...CIZGI} />
        <path
          d="M12 7.2S10.6 3.6 8.5 3.6a2 2 0 0 0 0 3.6ZM12 7.2s1.4-3.6 3.5-3.6a2 2 0 0 1 0 3.6Z"
          {...CIZGI}
        />
      </svg>
    ),
  },
];

export function AccountMenuHome({
  ad,
  eposta,
  cikisYap,
  cikisDurumu,
}: {
  ad: string;
  eposta: string | undefined;
  cikisYap: () => void;
  /**
   * Çıkış isteğinin durumu.
   *
   * Düğme önceden tek tıkla isteği gönderip hiçbir şey
   * söylemiyordu: ağ yavaşsa menü birkaç saniye aynı kalıyor,
   * müşteri "çalışmadı" sanıp tekrar basıyordu.
   */
  cikisDurumu: "bos" | "cikiliyor" | "cikildi" | "hata";
}) {
  return (
    <div className="account-home">
      <div className="account-hello">
        <span className="account-monogram" aria-hidden="true">
          {basHarf(ad, eposta)}
        </span>
        <div className="account-hello-text">
          <p className="account-hello-eyebrow">Hoş geldiniz</p>
          {/*
            Ad okunamadıysa selam yine de kurulur: "Hoş geldiniz"
            tek başına, adresi göstermekten iyi. Hitap sitenin geri
            kalanıyla aynı: her yerde "siz".
          */}
          {ad && <strong>{ad}</strong>}
          <small>{eposta}</small>
        </div>
      </div>

      <nav className="account-tiles" aria-label="Hesap menüsü">
        {SATIRLAR.map((satir) => (
          <Link key={satir.href} href={satir.href} className="account-tile">
            <span className="account-tile-icon">{satir.simge}</span>
            <span className="account-tile-text">
              <strong>{satir.baslik}</strong>
              <small>{satir.alt}</small>
            </span>
          </Link>
        ))}
      </nav>

      <button
        type="button"
        className="account-signout"
        disabled={cikisDurumu === "cikiliyor"}
        onClick={cikisYap}
      >
        {cikisDurumu === "cikiliyor" ? "Çıkılıyor…" : "Çıkış yap"}
      </button>

      {/*
        Hata görünmek ZORUNDA: istek düşerse oturum yerinde kalıyor
        ve müşteri çıktığını sanıp ortak bilgisayardan kalkıyordu.
      */}
      {cikisDurumu === "hata" && (
        <p className="form-error" role="alert">
          Çıkış yapılamadı; hâlâ giriş yapmış durumdasınız. Tekrar
          deneyin.
        </p>
      )}
    </div>
  );
}
