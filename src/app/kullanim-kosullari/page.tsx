import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info-page";
import { getSeller } from "@/lib/seller-source";

export const metadata: Metadata = {
  title: "Kullanım Koşulları",
  description: "ArvoCulture internet sitesinin kullanım koşulları.",
  alternates: { canonical: "/kullanim-kosullari" },
};

/*
  Satıcı bilgileri veritabanından okunuyor: her mağaza
  kendi unvanı ve adresiyle görünmeli. Sabit dosya
  ArvoCulture'a özeldi.
*/
export default async function TermsPage() {
  const SELLER = await getSeller();

  return (
    <InfoPage
      eyebrow="Yasal"
      title="Kullanım Koşulları"
      intro="Bu siteyi kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız."
    >
      <InfoSection title="Site Sahibi">
        <p>
          {SELLER.website} adresli internet sitesi {SELLER.legalName}{" "}
          tarafından işletilmektedir.
        </p>
        <p>
          Adres: {SELLER.address}
          <br />
          MERSİS No: {SELLER.mersis}
          <br />
          E-posta: {SELLER.email}
        </p>
      </InfoSection>

      <InfoSection title="Sitenin Kullanımı">
        <p>
          Siteyi yalnızca hukuka uygun amaçlarla kullanabilirsiniz. Sitenin
          işleyişini bozacak, güvenliğini tehdit edecek veya diğer
          kullanıcıların erişimini engelleyecek davranışlarda bulunmak
          yasaktır.
        </p>
        <p>
          Otomatik araçlarla toplu veri çekmek, içerikleri izinsiz
          kopyalamak veya siteyi tersine mühendislik amacıyla incelemek
          kabul edilmez.
        </p>
      </InfoSection>

      <InfoSection title="Üyelik">
        <p>
          Üyelik zorunlu değildir; misafir olarak da alışveriş
          yapabilirsiniz. Üye olmanız hâlinde hesap bilgilerinizin
          gizliliğinden siz sorumlusunuz.
        </p>
        <p>
          Hesabınızın yetkisiz kullanıldığını fark ederseniz derhal{" "}
          {SELLER.email} adresine bildirin.
        </p>
        <p>
          Site sahibi, kullanım koşullarını ihlal eden hesapları askıya
          alma veya kapatma hakkını saklı tutar.
        </p>
      </InfoSection>

      <InfoSection title="Ürün Bilgileri ve Fiyatlar">
        <p>
          Ürün açıklamaları, görseller ve fiyatlar özenle hazırlanır. Yine
          de baskı, sistem veya tedarik kaynaklı hatalar oluşabilir. Böyle
          bir durumda siparişi iptal etme ve ödemenizi iade etme hakkımız
          saklıdır.
        </p>
        <p>
          Fiyatlar önceden bildirilmeksizin değiştirilebilir. Sipariş
          anında geçerli olan fiyat esastır.
        </p>
        <p>
          Ürün görselleri temsilidir; ekran ayarlarına bağlı olarak renk
          farklılıkları olabilir.
        </p>
      </InfoSection>

      <InfoSection title="Fikri Mülkiyet">
        <p>
          Sitede yer alan marka, logo, tasarım, metin, görsel ve yazılım{" "}
          {SELLER.legalName}&apos;ne veya ilgili hak sahiplerine aittir.
          İzinsiz kullanımı, kopyalanması veya çoğaltılması hukuka
          aykırıdır.
        </p>
        <p>
          ArvoCulture, LR Health &amp; Beauty bağımsız iş ortağıdır. LR
          markası ve ürün adları ilgili hak sahibine aittir.
        </p>
      </InfoSection>

      <InfoSection title="Sorumluluğun Sınırı">
        <p>
          Site kesintisiz ve hatasız çalışacak şekilde tasarlanmıştır ancak
          teknik arıza, bakım veya üçüncü taraf hizmet sağlayıcılardan
          kaynaklanan kesintiler yaşanabilir.
        </p>
        <p>
          Ürünlerin kullanımına ilişkin bilgiler genel niteliktedir ve
          tıbbi tavsiye yerine geçmez. Sağlık sorunlarınız için hekiminize
          danışın.
        </p>
      </InfoSection>

      <InfoSection title="Kişisel Veriler">
        <p>
          Kişisel verilerinizin işlenmesine ilişkin ayrıntılar için{" "}
          <Link href="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</Link> ve{" "}
          <Link href="/gizlilik">Gizlilik ve Çerez Politikası</Link>{" "}
          sayfalarını inceleyin.
        </p>
      </InfoSection>

      <InfoSection title="Değişiklikler">
        <p>
          Bu koşullar önceden bildirilmeksizin güncellenebilir. Güncel
          sürüm her zaman bu sayfada yayımlanır. Siteyi kullanmaya devam
          etmeniz güncel koşulları kabul ettiğiniz anlamına gelir.
        </p>
      </InfoSection>

      <InfoSection title="Uygulanacak Hukuk">
        <p>
          Bu koşullara Türkiye Cumhuriyeti hukuku uygulanır.
          Uyuşmazlıklarda tüketici işlemleri bakımından parasal sınırlar
          dâhilinde Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri
          yetkilidir.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
