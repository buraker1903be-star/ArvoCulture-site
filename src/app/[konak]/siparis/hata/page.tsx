import Link from "next/link";
import { konagiAyarla } from "@/lib/konak";
import { Metin } from "@/components/para-birimi";

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
  title: "Ödeme tamamlanamadı",
  robots: { index: false, follow: false },
};

export default async function OrderFailed({
  params,
  searchParams,
}: {
  params: Promise<{ konak: string }>;
  searchParams: Promise<{ no?: string }>;
}) {
  /* Adres yoldan geliyor; her sayfa onu veri katmanına kendisi
     bırakıyor — düzen ile sayfa AYNI ANDA çiziliyor, sıraya
     güvenilemiyor (lib/konak). */
  konagiAyarla((await params).konak);

  const { no } = await searchParams;

  return (
    <main className="shell">
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
          <Link className="btn" href="/odeme">
            <Metin anahtar="tekrarDene" />
          </Link>
          <Link href="/iletisim"><Metin anahtar="yardimAlin" /></Link>
        </div>
      </section>
    </main>
  );
}
