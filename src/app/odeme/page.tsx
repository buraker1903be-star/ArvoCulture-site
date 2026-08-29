import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info-page";
export default function Checkout() {
  return (
    <InfoPage
      eyebrow="GÜVENLİ ÖDEME"
      title="Ödeme bağlantısı hazırlanıyor."
      intro="Eksik veya doğrulanmamış ödeme yapılandırmasıyla işlem başlatmıyoruz; böylece ödeme bilgileriniz ve siparişiniz korunur."
    >
      <InfoSection title="Sepetiniz korunuyor">
        <p>
          Seçimleriniz bu tarayıcıda saklanır. PayTR güvenli ödeme ve havale
          hesapları canlı mağaza için doğrulandığında ödeme adımı
          etkinleşecektir.
        </p>
        <p>
          <Link className="button button-dark" href="/sepet">
            Sepete dön
          </Link>
        </p>
      </InfoSection>
    </InfoPage>
  );
}
