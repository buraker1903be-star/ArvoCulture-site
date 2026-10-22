"use client";

import Link from "next/link";
import { Metin, useParaBirimi } from "@/components/para-birimi";
import { dilOneki } from "@/lib/dil-onek";

/*
  ÖDEME HATASI GÖVDESİ — İKİ ROTA, TEK UYGULAMA.

  Metinler zaten iki dilli (`<Metin>`); dile bağlı olan tek şey
  BAĞLANTI ÖNEKİ ve `lang`. Önek olmayınca ödemesi başarısız olan
  İngilizce müşteri "tekrar dene" düğmesinden TÜRKÇE ödeme sayfasına
  düşüyordu — en kötü anda dil değiştirmek.
*/
export function SiparisHata({ no }: { no?: string }) {
  /* Dil para biriminden: kart ödemesinde dönüş adresini ArvoARC
     kuruyor ve dili bilmiyor (bkz. siparis-tamam). */
  const { dil } = useParaBirimi();
  const onek = dilOneki(dil);

  return (
    <main className="shell" lang={dil}>
      <section className="panel about-hero order-result">
        {/* Metinler <Metin> ile: sunucu Türkçe basıyor, İngilizce
            vitrinde tarayıcı çeviriyor (components/para-birimi). */}
        <p className="about-eyebrow"><Metin anahtar="odeme" /></p>
        <h1><Metin anahtar="odemeTamamlanamadi" /></h1>
        <p className="about-lede">
          <Metin anahtar="odemeHataAciklama" />
        </p>
        {no && (
          <p className="order-number">
            <small><Metin anahtar="ilgiliSiparisNo" /></small>
            <b>{no}</b>
          </p>
        )}
        <p>
          <Metin anahtar="sepetDuruyor" />
        </p>
        <div className="order-actions">
          <Link className="btn" href={`${onek}/odeme`}>
            <Metin anahtar="tekrarDene" />
          </Link>
          <Link href={`${onek}/iletisim`}><Metin anahtar="yardimAlin" /></Link>
        </div>
      </section>
    </main>
  );

}
