"use client";

import Link from "next/link";
import { BankDetails } from "@/components/bank-details";
import { OrderCleanup } from "@/components/order-cleanup";
import { Metin, useParaBirimi } from "@/components/para-birimi";
import { dilOneki } from "@/lib/dil-onek";
import type { HavaleHesabi } from "@/lib/seller-source";

/*
  SİPARİŞ ONAY GÖVDESİ — İKİ ROTA, TEK UYGULAMA.

  Türkçe (`/siparis/tamam`) ve İngilizce (`/en/siparis/tamam`)
  rotaları bu bileşeni çağırıyor. KOPYALANMADI: havale talimatını ve
  sipariş numarasını gösteren tek yer burası ve iki kopya kaçınılmaz
  olarak ayrışır.

  Metinler zaten iki dilli (`<Metin>` çeviriyi tarayıcıda yapıyor);
  dile bağlı olan tek şey BAĞLANTI ÖNEKİ ve `lang`. Önek olmayınca
  İngilizce ödeme yapan müşteri onay sayfasından Türkçe katalog ve
  Türkçe iletişim sayfasına düşüyordu.

  DİKKAT — bu sayfanın görünmesi ödemenin kesinleştiği anlamına
  GELMEZ. Siparişi "ödendi" yapan tek şey PayTR'ın ArvoARC'a
  gönderdiği sunucudan sunucuya bildirimdir; bu yüzden burada
  "ödemeniz alındı" değil "siparişiniz alındı" deniyor.
*/
export function SiparisTamam({
  no,
  yontem,
  havale,
}: {
  no?: string;
  yontem?: string;
  havale: HavaleHesabi | null;
}) {
  /*
    DİL PARA BİRİMİNDEN, ROTADAN DEĞİL — ve bu bilinçli.

    Kart ödemesinde dönüş adresini ArvoARC kuruyor
    (`api/storefront/odeme` → `merchant_ok_url`) ve dili BİLMİYOR;
    yani İngilizce ödeme yapan müşteri Türkçe rotaya düşüyor.
    Depolar arası bir sözleşme değiştirmek yerine karar buraya
    alındı: bileşen istemci tarafında çalışıyor ve dili müşterinin
    kendi seçiminden okuyor, hangi adrese düşerse düşsün.

    `<Metin>` zaten böyle çalışıyordu — metinler İngilizceyken
    bağlantıların Türkçe kalması tutarsızlığın ta kendisiydi.
  */
  const { dil } = useParaBirimi();
  const onek = dilOneki(dil);

  return (
    <main className="shell" lang={dil}>
      <OrderCleanup orderNumber={no} />
      <section className="panel about-hero order-result">
        {/* Metinler <Metin> ile: sunucu Türkçe basıyor, İngilizce
            vitrinde tarayıcı çeviriyor (components/para-birimi). */}
        <p className="about-eyebrow"><Metin anahtar="tesekkurler" /></p>
        <h1><Metin anahtar="siparisAlindiBaslik" /></h1>

        {/* Sipariş numarası künye etiketi ve başlık yazısıyla:
            müşterinin not alacağı tek bilgi bu. */}
        {no && (
          <p className="order-number">
            <small><Metin anahtar="siparisNumarasi" /></small>
            <b>{no}</b>
          </p>
        )}

        <p className="about-lede">
          <Metin anahtar="siparisAlindiAciklama" />
        </p>

        {/*
          Havale siparişinde banka bilgileri onay sayfasında da
          gösteriliyor: müşteri e-postayı beklemeden ödeyebilsin.
        */}
        {yontem === "havale" && havale && (
          <BankDetails seller={havale}>
            <p className="hint">
              <Metin anahtar="havaleTalimati" />
            </p>
          </BankDetails>
        )}

        <div className="order-actions">
          <Link className="btn" href={`${onek}/koleksiyon/tumu`}>
            <Metin anahtar="alisverisiSurdur" />
          </Link>
          <Link href={`${onek}/iletisim`}><Metin anahtar="bizeUlasin" /></Link>
        </div>
      </section>
    </main>
  );

}
