import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Clause } from "@/components/legal-page";
import { organization } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gizlilik ve Çerez Politikası",
  description:
    "ArvoCulture Group web sitesinde gizlilik ve çerez kullanımına ilişkin politika.",
  alternates: { canonical: "/gizlilik-ve-cerez-politikasi" },
  robots: { index: true, follow: false },
};

export default function Page() {
  return (
    <LegalPage title="Gizlilik ve Çerez Politikası" updated="—">
      <Clause heading="Kapsam">
        <p>
          Bu politika, {organization.legalName} tarafından işletilen bu kurumsal
          web sitesi için geçerlidir. Grup markalarının kendi web siteleri ve
          uygulamaları kendi politikalarına tabidir.
        </p>
      </Clause>

      <Clause heading="Çerezler">
        <p>
          Bu sitede reklam, izleme veya profilleme amaçlı çerez kullanılmaz.
          Analitik araç çalıştırılmaz. Site tamamen statik olarak sunulur ve
          ziyaretiniz için oturum açmanız gerekmez.
        </p>
        <p>
          Barındırma sağlayıcısı, hizmetin sunulması ve güvenliğin sağlanması
          için teknik nitelikte kayıtlar (sunucu günlükleri) tutabilir. Bunlar
          zorunlu nitelikte olup pazarlama amacıyla kullanılmaz.
        </p>
        {/* TODO: Ilerideki bir asamada analitik veya reklam araci eklenirse
            bu bolum guncellenmeli ve KVKK ile e-Gizlilik gereklerine uygun bir
            cerez onay mekanizmasi (banner) eklenmelidir. Onay alinmadan
            zorunlu olmayan cerez calistirilmamalidir. */}
      </Clause>

      <Clause heading="İletişim formu">
        <p>
          Formu gönderdiğinizde adınız, e-posta adresiniz ve mesajınız
          tarafımıza e-posta olarak iletilir. Bu veriler yalnızca talebinizi
          yanıtlamak için kullanılır. Otomatik gönderimleri engellemek amacıyla
          IP adresiniz kısa süreli olarak bellekte tutulur ve kalıcı
          kaydedilmez.
        </p>
      </Clause>

      <Clause heading="Dış bağlantılar">
        <p>
          Site, grup markalarının ve üçüncü tarafların web sitelerine bağlantı
          içerir. Bu sitelerin içeriğinden ve gizlilik uygulamalarından sorumlu
          değiliz.
        </p>
      </Clause>

      <Clause heading="Veri güvenliği">
        <p>
          Aktarım sırasında veriler TLS ile şifrelenir. Erişim, talebi
          yanıtlaması gereken kişilerle sınırlıdır.
        </p>
      </Clause>

      <Clause heading="Haklarınız ve iletişim">
        <p>
          Kişisel verilerinize ilişkin haklarınız ve başvuru yöntemi{" "}
          <Link href="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</Link>
          &apos;nde açıklanmıştır. Sorularınız için{" "}
          <a href={`mailto:${organization.email}`}>{organization.email}</a>.
        </p>
      </Clause>

      <Clause heading="Değişiklikler">
        <p>
          Bu politika güncellenebilir. Güncel sürüm her zaman bu sayfada
          yayımlanır ve sayfa başındaki tarih değiştirilir.
        </p>
      </Clause>
    </LegalPage>
  );
}
