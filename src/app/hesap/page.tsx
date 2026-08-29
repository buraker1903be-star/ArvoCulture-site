import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info-page";
export default function Account() {
  return (
    <InfoPage
      eyebrow="MÜŞTERİ ALANI"
      title="Siparişlerinize kolayca ulaşın."
      intro="Siparişinizle ilgili destek almak veya teslimat durumunu öğrenmek için güvenli müşteri destek kanalını kullanın."
    >
      <InfoSection title="Sipariş desteği">
        <p>
          Sipariş numaranızı ve alışverişte kullandığınız e-posta adresini
          belirterek{" "}
          <a href="mailto:info@arvoculture.com">info@arvoculture.com</a>{" "}
          üzerinden bize ulaşabilirsiniz.
        </p>
      </InfoSection>
      <InfoSection title="Yeni bir seçim">
        <p>
          <Link href="/koleksiyon/tumu">
            Tüm ArvoCulture seçkisini keşfedin →
          </Link>
        </p>
      </InfoSection>
    </InfoPage>
  );
}
