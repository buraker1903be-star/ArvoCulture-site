import { InfoPage, InfoSection } from "@/components/info-page";
export default function Privacy() {
  return (
    <InfoPage
      eyebrow="YASAL"
      title="Gizlilik ve kişisel veriler."
      intro="Kişisel verileriniz yalnızca alışveriş ve müşteri destek süreçlerinin yürütülmesi amacıyla, yürürlükteki mevzuata uygun şekilde işlenir."
    >
      <InfoSection title="İşlenen bilgiler">
        <p>
          Kimlik ve iletişim bilgileri, teslimat adresi, sipariş kayıtları ve
          müşteri destek yazışmaları hizmetin sunulması için işlenebilir.
        </p>
      </InfoSection>
      <InfoSection title="Ödeme güvenliği">
        <p>
          Kart bilgileri ArvoCulture veritabanında açık olarak saklanmaz; ödeme
          işlemleri yetkili ödeme kuruluşunun güvenli altyapısı üzerinden
          yürütülür.
        </p>
      </InfoSection>
      <InfoSection title="Haklarınız">
        <p>
          Verilerinize ilişkin bilgi, düzeltme ve silme taleplerinizi
          info@arvoculture.com adresine iletebilirsiniz. Yasal saklama
          yükümlülükleri saklıdır.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
