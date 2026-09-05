import Link from "next/link";

export const metadata = {
  title: "Siparişiniz alındı",
  robots: { index: false, follow: false },
};

/**
 * PayTR başarılı ödeme sonrası buraya yönlendirir.
 *
 * Dikkat: bu sayfanın görünmesi ödemenin kesinleştiği anlamına
 * gelmez. Siparişi "ödendi" yapan tek şey PayTR'ın ARC'a
 * gönderdiği sunucudan sunucuya bildirimdir. Bu yüzden burada
 * "ödemeniz alındı" değil, "siparişiniz alındı" denir.
 */
export default async function OrderDone({
  searchParams,
}: {
  searchParams: Promise<{ no?: string }>;
}) {
  const { no } = await searchParams;

  return (
    <main className="band wrap order-result">
      <h1>Siparişiniz alındı</h1>
      {no && (
        <p className="order-number">
          Sipariş numaranız: <b>{no}</b>
        </p>
      )}
      <p>
        Ödemeniz onaylandığında sipariş özetiniz e-posta adresinize
        gönderilecek. Siparişinizle ilgili sorularınız için sipariş
        numaranızla bize ulaşabilirsiniz.
      </p>
      <div className="order-actions">
        <Link className="btn" href="/koleksiyon/tumu">
          Alışverişe devam et
        </Link>
        <Link href="/iletisim">Bize ulaşın</Link>
      </div>
    </main>
  );
}
