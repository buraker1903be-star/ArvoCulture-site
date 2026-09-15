import Link from "next/link";
import { BankDetails } from "@/components/bank-details";
import { OrderCleanup } from "@/components/order-cleanup";
import { SELLER } from "@/lib/seller";

export const metadata = {
  title: "Siparişiniz alındı",
  robots: { index: false, follow: false },
};

/**
 * PayTR başarılı ödeme sonrası buraya yönlendirir.
 *
 * Dikkat: bu sayfanın görünmesi ödemenin kesinleştiği anlamına
 * gelmez. Siparişi "ödendi" yapan tek şey PayTR’ın ARC’a
 * gönderdiği sunucudan sunucuya bildirimdir. Bu yüzden burada
 * "ödemeniz alındı" değil, "siparişiniz alındı" denir.
 */
export default async function OrderDone({
  searchParams,
}: {
  searchParams: Promise<{ no?: string; yontem?: string }>;
}) {
  const { no, yontem } = await searchParams;

  return (
    <main className="shell">
      <OrderCleanup orderNumber={no} />
      <section className="panel about-hero order-result">
        <p className="about-eyebrow">Teşekkür ederiz</p>
        <h1>Siparişiniz alındı.</h1>

        {/* Sipariş numarası künye etiketi ve başlık yazısıyla:
            müşterinin not alacağı tek bilgi bu. */}
        {no && (
          <p className="order-number">
            <small>Sipariş numarası</small>
            <b>{no}</b>
          </p>
        )}

        <p className="about-lede">
          Ödemeniz onaylandığında sipariş özetiniz e-posta adresinize
          gönderilecek. Siparişinizle ilgili sorularınız için sipariş
          numaranızla bize ulaşabilirsiniz.
        </p>

        {/*
          Havale siparişinde banka bilgileri onay sayfasında da
          gösteriliyor: müşteri e-postayı beklemeden ödeyebilsin.
        */}
        {yontem === "havale" && (
          <BankDetails seller={SELLER}>
            <p className="hint">
              Aşağıdaki hesaba havale veya EFT yaptığınızda siparişiniz
              hazırlanmaya başlanacak. Açıklama kısmına sipariş numaranızı
              yazın.
            </p>
          </BankDetails>
        )}

        <div className="order-actions">
          <Link className="btn" href="/koleksiyon/tumu">
            Alışverişe devam et
          </Link>
          <Link href="/iletisim">Bize ulaşın</Link>
        </div>
      </section>
    </main>
  );
}
