import type { Metadata } from "next";
import { LegalPage, Clause } from "@/components/legal-page";
import { organization } from "@/lib/site";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description:
    "ArvoCulture Group kişisel verilerin işlenmesine ilişkin aydınlatma metni.",
  alternates: { canonical: "/kvkk-aydinlatma-metni" },
  robots: { index: true, follow: false },
};

export default function Page() {
  const { address } = organization;

  return (
    <LegalPage title="KVKK Aydınlatma Metni" updated="—">
      <Clause heading="Veri sorumlusu">
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;)
          uyarınca veri sorumlusu {organization.legalName}&apos;dir.
        </p>
        <p>
          Adres: {address.street}, {address.postalCode} {address.district} /{" "}
          {address.city}. E-posta: {organization.email}.
        </p>
        {/* TODO: MERSİS ve ticaret sicil numarasını ekleyin. */}
      </Clause>

      <Clause heading="İşlenen kişisel veriler">
        <p>
          Bu web sitesi üzerinden yalnızca sizin ilettiğiniz verileri işleriz:
        </p>
        <ul>
          <li>Kimlik verisi: iletişim formuna yazdığınız ad ve soyad</li>
          <li>İletişim verisi: e-posta adresiniz</li>
          <li>
            İşlem güvenliği verisi: form gönderiminde kötüye kullanımı önlemek
            amacıyla geçici olarak tutulan IP adresi
          </li>
          <li>Mesaj içeriğinde tarafınızca paylaşılan diğer bilgiler</li>
        </ul>
        <p>
          Sitede reklam veya profilleme amaçlı çerez kullanılmaz. Ayrıntı için
          Gizlilik ve Çerez Politikası&apos;na bakınız.
        </p>
      </Clause>

      <Clause heading="İşleme amaçları ve hukuki sebepler">
        <ul>
          <li>
            Talebinizi yanıtlamak ve iletişimi yürütmek — KVKK m.5/2-c ve
            m.5/2-f
          </li>
          <li>
            Form kötüye kullanımını ve otomatik gönderimleri engellemek —
            KVKK m.5/2-f (meşru menfaat)
          </li>
          <li>Hukuki yükümlülüklerin yerine getirilmesi — KVKK m.5/2-ç</li>
        </ul>
      </Clause>

      <Clause heading="Toplama yöntemi">
        <p>
          Kişisel verileriniz, bu web sitesindeki iletişim formu ve tarafınızca
          gönderilen e-postalar aracılığıyla elektronik ortamda otomatik ve
          kısmen otomatik yollarla toplanır.
        </p>
      </Clause>

      <Clause heading="Aktarım">
        <p>
          Verileriniz, hizmet aldığımız barındırma ve e-posta altyapısı
          sağlayıcılarına, yalnızca bu hizmetlerin sunulması amacıyla ve sınırlı
          olarak aktarılabilir. Bu sağlayıcıların bir kısmı yurt dışında
          bulunmaktadır; aktarım KVKK m.9 çerçevesinde yapılır.
        </p>
        {/* TODO: Kullanilan saglayicilari (Vercel, Resend vb.) ve bulunduklari
            ulkeleri acikca listeleyin. Yurt disi aktarim icin uygun mekanizmayi
            (acik riza / standart sozlesme / yeterlilik karari) belirtin. */}
        <p>
          Verileriniz pazarlama amacıyla üçüncü taraflarla paylaşılmaz ve
          satılmaz.
        </p>
      </Clause>

      <Clause heading="Saklama süresi">
        <p>
          İletişim talepleri, talebin sonuçlanmasını takiben makul bir süre
          boyunca saklanır ve ardından silinir veya anonim hâle getirilir.
          Mevzuatın daha uzun bir saklama süresi öngördüğü hâllerde ilgili süre
          uygulanır.
        </p>
        {/* TODO: Somut saklama sureleri belirleyip yaziniz. */}
      </Clause>

      <Clause heading="Haklarınız">
        <p>KVKK m.11 uyarınca şu haklara sahipsiniz:</p>
        <ul>
          <li>Kişisel verinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme</li>
          <li>
            İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme
          </li>
          <li>Yurt içinde veya yurt dışında aktarıldığı tarafları bilme</li>
          <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
          <li>
            Silinmesini veya yok edilmesini isteme ve bu işlemin aktarıldığı
            üçüncü kişilere bildirilmesini isteme
          </li>
          <li>
            Otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonuç
            doğmasına itiraz etme
          </li>
          <li>
            Kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde zararın
            giderilmesini talep etme
          </li>
        </ul>
      </Clause>

      <Clause heading="Başvuru">
        <p>
          Taleplerinizi{" "}
          <a href={`mailto:${organization.email}`}>{organization.email}</a>{" "}
          adresine veya yukarıdaki posta adresine iletebilirsiniz. Başvurular,
          Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ&apos;e uygun
          şekilde en geç otuz gün içinde sonuçlandırılır.
        </p>
      </Clause>
    </LegalPage>
  );
}
