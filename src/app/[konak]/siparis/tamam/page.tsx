import Link from "next/link";
import { BankDetails } from "@/components/bank-details";
import { OrderCleanup } from "@/components/order-cleanup";
import { Metin } from "@/components/para-birimi";
import { getSellerBank } from "@/lib/seller-source";
import { konagiAyarla } from "@/lib/konak";

/*
  BU SAYFA DİNAMİK KALMALI.

  `[konak]` düzenine `generateStaticParams` eklenince altındaki her
  sayfa istendiğinde üretilip SAKLANIR hâle geldi. Burada bu yanlış:
  sayfa önbelleksiz okuma yapıyor (havale hesabı / arama sonucu) ve
  Next saklanacak bir sayfanın içinde `revalidate: 0` bir fetch
  görünce "page changed from static to dynamic at runtime" ile
  patlıyor — canlıda 500 demek.

  Bu dört sayfa zaten taşınmadan önce de dinamikti; burada yapılan
  tek şey o davranışı açıkça yazmak.
*/
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Siparişiniz alındı",
  robots: { index: false, follow: false },
};

/**
 * PayTR başarılı ödeme sonrası buraya yönlendirir.
 *
 * Dikkat: bu sayfanın görünmesi ödemenin kesinleştiği anlamına
 * gelmez. Siparişi "ödendi" yapan tek şey PayTR’ın ArvoARC’a
 * gönderdiği sunucudan sunucuya bildirimdir. Bu yüzden burada
 * "ödemeniz alındı" değil, "siparişiniz alındı" denir.
 */
export default async function OrderDone({
  params,
  searchParams,
}: {
  params: Promise<{ konak: string }>;
  searchParams: Promise<{ no?: string; yontem?: string }>;
}) {
  /* Adres yoldan geliyor; her sayfa onu veri katmanına kendisi
     bırakıyor — düzen ile sayfa AYNI ANDA çiziliyor, sıraya
     güvenilemiyor (lib/konak). */
  konagiAyarla((await params).konak);

  const { no, yontem } = await searchParams;

  /*
    Havale bilgisi satıcı kaydından. Önceden `lib/seller.ts`
    sabitinden geliyordu ve ortak dağıtımda her kiracının onay
    sayfası ArvoCulture'ın IBAN'ını gösterirdi.
  */
  const havale = await getSellerBank();

  return (
    <main className="shell">
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
          <Link className="btn" href="/koleksiyon/tumu">
            <Metin anahtar="alisverisiSurdur" />
          </Link>
          <Link href="/iletisim"><Metin anahtar="bizeUlasin" /></Link>
        </div>
      </section>
    </main>
  );
}
