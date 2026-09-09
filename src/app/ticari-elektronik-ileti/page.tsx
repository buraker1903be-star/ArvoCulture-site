import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info-page";
import { getSeller } from "@/lib/seller-source";

export const metadata: Metadata = {
  title: "Ticari Elektronik İleti Aydınlatma Metni",
  description:
    "Kampanya ve duyuru iletileri hakkında bilgilendirme ve izin metni.",
  alternates: { canonical: "/ticari-elektronik-ileti" },
};

/**
 * Ticari Elektronik İleti metni.
 *
 * 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun
 * ve Ticari İletişim Yönetmeliği, onay alınmasını ve ret hakkının
 * her iletide belirtilmesini zorunlu kılar.
 */
/*
  Satıcı bilgileri veritabanından okunuyor: her mağaza
  kendi unvanı ve adresiyle görünmeli. Sabit dosya
  ArvoCulture'a özeldi.
*/
export default async function CommercialMessagesPage() {
  const SELLER = await getSeller();

  return (
    <InfoPage
      eyebrow="Yasal"
      title="Ticari Elektronik İleti"
      intro="Kampanya, indirim ve duyuru iletileri hakkında bilgilendirme."
    >
      <InfoSection title="Hizmet Sağlayıcı">
        <p>
          {SELLER.legalName}
          <br />
          {SELLER.address}
          <br />
          MERSİS No: {SELLER.mersis}
          <br />
          E-posta: {SELLER.email}
        </p>
      </InfoSection>

      <InfoSection title="İleti Gönderimi">
        <p>
          6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun
          uyarınca, kampanya ve duyuru içerikli ticari elektronik iletiler
          yalnızca onayınız olması hâlinde gönderilir.
        </p>
        <p>
          Onay vermeniz hâlinde e-posta ve SMS yoluyla; yeni ürünler,
          indirimler, kampanyalar ve size özel teklifler hakkında
          bilgilendirme alırsınız.
        </p>
      </InfoSection>

      <InfoSection title="Onay Gerektirmeyen İletiler">
        <p>
          Aşağıdaki iletiler ticari elektronik ileti kapsamında değildir ve
          onay gerektirmez:
        </p>
        <ul>
          <li>Sipariş onayı ve sipariş durumu bildirimleri</li>
          <li>Kargo takip bilgisi</li>
          <li>İade ve iptal süreçlerine ilişkin bilgilendirmeler</li>
          <li>Üyelik doğrulama ve şifre sıfırlama e-postaları</li>
          <li>Mevzuattan doğan zorunlu bilgilendirmeler</li>
        </ul>
        <p>
          Bu iletiler alışveriş sürecinin bir parçasıdır ve reddedilemez.
        </p>
      </InfoSection>

      <InfoSection title="Ret Hakkı">
        <p>
          Ticari elektronik ileti almayı dilediğiniz zaman, hiçbir gerekçe
          göstermeden reddedebilirsiniz.
        </p>
        <ul>
          <li>
            E-postaların alt kısmındaki bağlantıya tıklayarak
          </li>
          <li>
            {SELLER.email} adresine talebinizi ileterek
          </li>
          <li>
            <a href="https://iys.org.tr" rel="noopener">
              İleti Yönetim Sistemi (İYS)
            </a>{" "}
            üzerinden
          </li>
        </ul>
        <p>
          Ret talebiniz en geç üç iş günü içinde işleme alınır ve bu
          tarihten sonra size ticari elektronik ileti gönderilmez.
        </p>
      </InfoSection>

      <InfoSection title="İleti Yönetim Sistemi">
        <p>
          Onay ve ret kayıtları, mevzuat gereği İleti Yönetim Sistemi&apos;ne
          (İYS) bildirilir. İYS üzerinden tüm izinlerinizi tek bir yerden
          görüntüleyebilir ve yönetebilirsiniz.
        </p>
      </InfoSection>

      <InfoSection title="Kişisel Veriler">
        <p>
          İleti gönderimi kapsamında işlenen kişisel verileriniz hakkında
          ayrıntılı bilgi için{" "}
          <Link href="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</Link>{" "}
          sayfasını inceleyebilirsiniz.
        </p>
        <p>
          Onayınızı geri çektiğinizde iletişim bilgileriniz ileti gönderimi
          amacıyla kullanılmaz; ancak siparişlerinize ilişkin yasal saklama
          yükümlülükleri devam eder.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
