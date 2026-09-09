import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info-page";
import { getSeller } from "@/lib/seller-source";

export const metadata: Metadata = {
  title: "Gizlilik ve Çerez Politikası",
  description: "Verilerinizin korunması ve çerez kullanımı hakkında bilgi.",
  alternates: { canonical: "/gizlilik" },
};

/*
  Satıcı bilgileri veritabanından okunuyor: her mağaza
  kendi unvanı ve adresiyle görünmeli. Sabit dosya
  ArvoCulture'a özeldi.
*/
export default async function PrivacyPage() {
  const SELLER = await getSeller();

  return (
    <InfoPage
      eyebrow="Yasal"
      title="Gizlilik ve Çerez Politikası"
      intro="Sitemizi kullanırken verilerinizin nasıl korunduğu ve çerezlerin nasıl kullanıldığı."
    >
      <InfoSection title="Kapsam">
        <p>
          Bu politika, {SELLER.website} adresinde geçerlidir ve{" "}
          {SELLER.legalName} tarafından yürütülür.
        </p>
        <p>
          Kişisel verilerinizin işlenmesine ilişkin ayrıntılı bilgi için{" "}
          <Link href="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</Link>
          &apos;ni inceleyebilirsiniz.
        </p>
      </InfoSection>

      <InfoSection title="Ödeme Güvenliği">
        <p>
          Ödemeler PayTR altyapısı üzerinden 3D Secure doğrulamasıyla
          alınır. Kart numaranız, son kullanma tarihi ve güvenlik kodu
          doğrudan ödeme kuruluşuna iletilir; bu bilgiler tarafımıza
          ulaşmaz ve sunucularımızda saklanmaz.
        </p>
      </InfoSection>

      <InfoSection title="Veri Güvenliği">
        <p>
          Site trafiği SSL sertifikasıyla şifrelenir. Veritabanı erişimi
          satır düzeyinde yetkilendirilmiştir; müşteriler yalnızca kendi
          siparişlerine ve adreslerine erişebilir.
        </p>
        <p>
          Şifreler geri döndürülemez biçimde saklanır ve tarafımızca
          görülemez.
        </p>
      </InfoSection>

      <InfoSection title="Çerezler">
        <p>
          Çerez, ziyaret ettiğiniz sitenin cihazınıza yerleştirdiği küçük
          bir metin dosyasıdır. Sitemizde kullanılan çerezler:
        </p>
        <ul>
          <li>
            <strong>Zorunlu çerezler:</strong> oturum yönetimi, sepet
            içeriği ve güvenlik için gereklidir. Bunlar olmadan site
            çalışmaz; açık rıza gerektirmez.
          </li>
          <li>
            <strong>İşlevsel çerezler:</strong> dil ve görünüm tercihleri
            gibi seçimlerinizi hatırlar.
          </li>
        </ul>
        <p>
          Sepetiniz ve indirim kodunuz tarayıcınızın yerel depolamasında
          tutulur; sunucuya gönderilmez.
        </p>
      </InfoSection>

      <InfoSection title="Çerezleri Yönetme">
        <p>
          Tarayıcınızın ayarlarından çerezleri silebilir veya
          engelleyebilirsiniz. Zorunlu çerezleri engellemeniz hâlinde
          sepet ve oturum işlevleri çalışmayacaktır.
        </p>
      </InfoSection>

      <InfoSection title="Üçüncü Taraf Hizmetleri">
        <p>
          Ödeme (PayTR), barındırma ve kargo hizmetleri için üçüncü taraf
          sağlayıcılarla çalışıyoruz. Bu sağlayıcılara yalnızca hizmetin
          gerektirdiği veriler aktarılır.
        </p>
      </InfoSection>

      <InfoSection title="Değişiklikler">
        <p>
          Bu politika, hizmetlerimizdeki değişikliklere göre
          güncellenebilir. Güncel sürüm her zaman bu sayfada yayımlanır.
        </p>
        <p>
          Sorularınız için {SELLER.email} adresine yazabilirsiniz.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
