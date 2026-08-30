import { InfoPage, InfoSection } from "@/components/info-page";
import Link from "next/link";
export default function Delivery() {
  return (
    <InfoPage
      eyebrow="SİPARİŞ DESTEĞİ"
      title="Teslimat ve iade."
      intro="Siparişinizin hazırlanmasından olası iade sürecine kadar açık ve özenli bir deneyim."
    >
      <InfoSection title="Teslimat"><p>Hazırlık, kargo ücreti, takip ve hasarlı paket süreçleri için ayrıntılı <Link href="/teslimat">Teslimat Politikası</Link>nı inceleyin.</p></InfoSection>
      <InfoSection title="İptal ve iade"><p>14 günlük yasal cayma hakkı, ArvoCulture kolay iade koşulları ve istisnalar için <Link href="/iptal-iade">İptal ve İade Politikası</Link>nı inceleyin.</p></InfoSection>
      <InfoSection title="Satış belgeleri"><p>Sipariş öncesi <Link href="/on-bilgilendirme-formu">Ön Bilgilendirme Formu</Link> ile <Link href="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</Link> erişiminize sunulur.</p></InfoSection>
      <InfoSection title="Hasarlı teslimat">
        <p>
          Paket hasarlıysa teslim sırasında tutanak tutulmasını isteyin ve
          fotoğraflarla birlikte info@arvoculture.com adresine ulaşın.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
