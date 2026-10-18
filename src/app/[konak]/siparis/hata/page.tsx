import Link from "next/link";
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
        <p className="about-eyebrow">Ödeme</p>
        <h1>Ödeme tamamlanamadı.</h1>
        <p className="about-lede">
          İşlem sırasında bir sorun oluştu ve ödemeniz alınamadı. Kartınızdan
          herhangi bir tutar çekilmediyse endişelenmeyin; provizyon alındıysa
          bankanız tarafından iade edilir.
        </p>
        {no && (
          <p className="order-number">
            <small>İlgili sipariş numarası</small>
            <b>{no}</b>
          </p>
        )}
        <p>
          Sepetiniz duruyor. Tekrar denemek isterseniz ödeme adımından devam
          edebilirsiniz.
        </p>
        <div className="order-actions">
          <Link className="btn" href="/odeme">
            Tekrar dene
          </Link>
          <Link href="/iletisim">Yardım alın</Link>
        </div>
      </section>
    </main>
  );
}
