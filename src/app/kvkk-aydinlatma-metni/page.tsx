import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/info-page";
import { getSeller } from "@/lib/seller-source";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description:
    "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.",
  alternates: { canonical: "/kvkk-aydinlatma-metni" },
};

/**
 * KVKK Aydınlatma Metni.
 *
 * Bu metin işletmenin fiili veri işleme süreçlerini yansıtmalıdır.
 * Yeni bir hizmet sağlayıcı eklendiğinde (analitik, e-posta,
 * kargo) aktarım bölümü güncellenmelidir.
 */
/*
  Satıcı bilgileri veritabanından okunuyor: her mağaza
  kendi unvanı ve adresiyle görünmeli. Sabit dosya
  ArvoCulture'a özeldi.
*/
export default async function KvkkPage() {
  const SELLER = await getSeller();

  return (
    <InfoPage
      eyebrow="Yasal"
      title="KVKK Aydınlatma Metni"
      intro="6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, kişisel verilerinizin nasıl işlendiğine dair bilgilendirme."
    >
      <InfoSection title="Veri Sorumlusu">
        <p>
          Kişisel verileriniz, veri sorumlusu sıfatıyla{" "}
          {SELLER.legalName} tarafından aşağıda açıklanan kapsamda
          işlenmektedir.
        </p>
        <p>
          Adres: {SELLER.address}
          <br />
          MERSİS No: {SELLER.mersis}
          <br />
          E-posta: {SELLER.email}
        </p>
      </InfoSection>

      <InfoSection title="İşlenen Kişisel Veriler">
        <ul>
          <li>
            <strong>Kimlik:</strong> ad, soyad
          </li>
          <li>
            <strong>İletişim:</strong> e-posta adresi, telefon numarası,
            teslimat ve fatura adresi
          </li>
          <li>
            <strong>Müşteri işlem:</strong> sipariş bilgileri, sipariş
            geçmişi, iade ve iptal kayıtları, sipariş notları
          </li>
          <li>
            <strong>Finansal:</strong> ödeme tutarı, ödeme yöntemi, işlem
            referansı. <em>Kart numarası ve güvenlik kodu tarafımızca
            işlenmez ve saklanmaz.</em>
          </li>
          <li>
            <strong>Fatura bilgileri:</strong> kurumsal fatura talebinde
            firma unvanı, vergi dairesi ve vergi numarası
          </li>
          <li>
            <strong>İşlem güvenliği:</strong> IP adresi, oturum ve giriş
            kayıtları
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="İşleme Amaçları">
        <ul>
          <li>Sipariş sürecinin yürütülmesi ve ürün teslimi</li>
          <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
          <li>Fatura düzenlenmesi ve yasal saklama yükümlülükleri</li>
          <li>İade, iptal ve müşteri destek taleplerinin karşılanması</li>
          <li>Üyelik hesabının oluşturulması ve yönetilmesi</li>
          <li>Hukuki yükümlülüklerin yerine getirilmesi</li>
          <li>Açık rızanız hâlinde ticari elektronik ileti gönderimi</li>
        </ul>
      </InfoSection>

      <InfoSection title="Hukuki Sebepler">
        <p>
          Kişisel verileriniz KVKK madde 5 uyarınca şu hukuki sebeplere
          dayanılarak işlenmektedir:
        </p>
        <ul>
          <li>
            Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili
            olması (sipariş ve teslimat)
          </li>
          <li>
            Veri sorumlusunun hukuki yükümlülüğünü yerine getirmesi
            (fatura, vergi ve tüketici mevzuatı)
          </li>
          <li>
            İlgili kişinin temel hak ve özgürlüklerine zarar vermemek
            kaydıyla meşru menfaat (güvenlik ve dolandırıcılık önleme)
          </li>
          <li>
            Açık rıza (ticari elektronik ileti ve zorunlu olmayan çerezler)
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="Aktarım">
        <p>Kişisel verileriniz aşağıdaki taraflara aktarılmaktadır:</p>
        <ul>
          <li>
            <strong>Ödeme kuruluşu (PayTR):</strong> ödeme işleminin
            gerçekleştirilmesi amacıyla
          </li>
          <li>
            <strong>Kargo firmaları:</strong> teslimat amacıyla ad, adres
            ve telefon bilgileri
          </li>
          <li>
            <strong>Tedarikçiler:</strong> siparişin tedarikçi
            deposundan gönderildiği durumlarda teslimat bilgileri
          </li>
          <li>
            <strong>Barındırma ve altyapı sağlayıcıları:</strong> sitenin
            ve verilerin barındırılması amacıyla
          </li>
          <li>
            <strong>Yetkili kamu kurumları:</strong> mevzuattan doğan
            talepler hâlinde
          </li>
        </ul>
        <p>
          Barındırma altyapımızın bir kısmı yurt dışında bulunduğundan,
          verileriniz KVKK madde 9 kapsamında yurt dışına aktarılabilir.
        </p>
      </InfoSection>

      <InfoSection title="Saklama Süresi">
        <p>
          Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca
          ve ilgili mevzuatta öngörülen zamanaşımı süreleri kadar saklanır.
          Ticari defter ve belgelere ilişkin veriler Vergi Usul Kanunu ve
          Türk Ticaret Kanunu uyarınca on yıl süreyle muhafaza edilir.
        </p>
        <p>
          Sürenin dolmasının ardından verileriniz silinir, yok edilir veya
          anonim hâle getirilir.
        </p>
      </InfoSection>

      <InfoSection title="Haklarınız">
        <p>KVKK madde 11 uyarınca şu haklara sahipsiniz:</p>
        <ul>
          <li>Kişisel verinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme</li>
          <li>
            İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını
            öğrenme
          </li>
          <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
          <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
          <li>Silinmesini veya yok edilmesini isteme</li>
          <li>
            Düzeltme, silme ve yok etme işlemlerinin aktarıldığı üçüncü
            kişilere bildirilmesini isteme
          </li>
          <li>
            Münhasıran otomatik sistemlerle analiz edilmesi suretiyle
            aleyhinize bir sonuç ortaya çıkmasına itiraz etme
          </li>
          <li>
            Kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde
            zararın giderilmesini talep etme
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="Otomatik Karar ve Profilleme">
        <p>
          Alışveriş geçmişinize göre ürün önerisi gösterebiliriz. Bu
          öneriler yalnızca site içi deneyimi kişiselleştirmek içindir.
        </p>
        <p>
          Hakkınızda hukuki sonuç doğuran ya da sizi önemli ölçüde
          etkileyen otomatik bir karar verilmez. Sipariş iptali gibi
          kararlar insan incelemesiyle alınır.
        </p>
      </InfoSection>

      <InfoSection title="Yurt Dışına Aktarım">
        <p>
          Sitemizin altyapısı ve e-posta gönderimi için kullandığımız
          hizmet sağlayıcıların sunucuları yurt dışında bulunabilir. Bu
          kapsamda kişisel verileriniz KVKK&apos;nın 9. maddesindeki
          şartlara uygun olarak yurt dışına aktarılabilir.
        </p>
        <p>
          Aktarım, hizmetin sunulabilmesi için gereken asgari veriyle
          sınırlıdır ve sağlayıcılarla veri işleme sözleşmeleri
          yapılmıştır.
        </p>
      </InfoSection>

      <InfoSection title="Veri Güvenliği İhlali">
        <p>
          Kişisel verilerinizin hukuka aykırı olarak başkaları tarafından
          elde edilmesi hâlinde, durum en kısa sürede size ve Kişisel
          Verileri Koruma Kurulu&apos;na bildirilir.
        </p>
      </InfoSection>

      <InfoSection title="Başvuru">
        <p>
          Haklarınıza ilişkin taleplerinizi {SELLER.email} adresine
          iletebilir veya {SELLER.address} adresine yazılı olarak
          gönderebilirsiniz.
        </p>
        <p>
          Başvurunuz en geç otuz gün içinde sonuçlandırılır. İşlemin ayrıca
          bir maliyet gerektirmesi hâlinde Kişisel Verileri Koruma Kurulu
          tarafından belirlenen tarifedeki ücret alınabilir.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
