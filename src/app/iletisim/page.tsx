import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info-page";
export default function Contact() {
  return (
    <InfoPage
      eyebrow="BİZE ULAŞIN"
      title="Nasıl yardımcı olabiliriz?"
      intro="Ürün, sipariş, teslimat ve iade sorularınız için ArvoCulture ekibi yanınızda."
    >
      <InfoSection title="Müşteri desteği">
        <p>
          E-posta:{" "}
          <a href="mailto:info@arvoculture.com">info@arvoculture.com</a>
        </p>
        <p>
          Mesajınıza sipariş numaranızı eklerseniz size daha hızlı yardımcı
          olabiliriz.
        </p>
      </InfoSection>
      <InfoSection title="Hızlı bağlantılar">
        <p>
          <Link href="/sss">Sıkça sorulan sorular</Link>
          <br />
          <Link href="/teslimat-iade">Teslimat ve iade koşulları</Link>
          <br />
          <Link href="/koleksiyon/tumu">Tüm ürünler</Link>
        </p>
      </InfoSection>
      <InfoSection title="Çalışma düzeni">
        <p>
          Talepler iş günlerinde sırayla değerlendirilir. Size yalnızca
          doğrulanmış sipariş ve ürün bilgileri üzerinden dönüş yapılır.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
