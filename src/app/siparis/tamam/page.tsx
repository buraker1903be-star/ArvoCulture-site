import Link from "next/link";
import { SELLER } from "@/lib/seller";

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
  searchParams: Promise<{ no?: string; yontem?: string }>;
}) {
  const { no, yontem } = await searchParams;

  return (
    <main className="shell">
      <div className="panel order-result">
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
      {/*

        Havale siparişinde banka bilgileri onay sayfasında da

        gösteriliyor: müşteri e-postayı beklemeden ödeyebilsin.

      */}

      {yontem === "havale" && (

        <div className="pay-bank" style={{ marginTop: "var(--s4)" }}>

          <p className="hint">

            Siparişiniz oluşturuldu. Aşağıdaki hesaba havale veya EFT

            yaptığınızda hazırlanmaya başlanacak. Açıklama kısmına

            sipariş numaranızı yazın.

          </p>

          <div className="pay-bank-row">

            <div>

              <small>ALICI UNVANI</small>

              <b>{SELLER.legalName}</b>

            </div>

          </div>

          <div className="pay-bank-row">

            <div>

              <small>BANKA</small>

              <b>{SELLER.bankName}</b>

            </div>

          </div>

          <div className="pay-bank-row">

            <div>

              <small>IBAN</small>

              <b className="pay-iban">{SELLER.iban}</b>

            </div>

          </div>

        </div>

      )}

      <div className="order-actions">
        <Link className="btn" href="/koleksiyon/tumu">
          Alışverişe devam et
        </Link>
        <Link href="/iletisim">Bize ulaşın</Link>
      </div>
      </div>
    </main>
  );
}
