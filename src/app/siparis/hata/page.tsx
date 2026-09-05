import Link from "next/link";

export const metadata = {
  title: "Ödeme tamamlanamadı",
  robots: { index: false, follow: false },
};

export default async function OrderFailed({
  searchParams,
}: {
  searchParams: Promise<{ no?: string }>;
}) {
  const { no } = await searchParams;

  return (
    <main className="band wrap order-result">
      <h1>Ödeme tamamlanamadı</h1>
      <p>
        İşlem sırasında bir sorun oluştu ve ödemeniz alınamadı. Kartınızdan
        herhangi bir tutar çekilmediyse endişelenmeyin; provizyon alındıysa
        bankanız tarafından iade edilir.
      </p>
      {no && (
        <p className="order-number">
          İlgili sipariş numarası: <b>{no}</b>
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
    </main>
  );
}
