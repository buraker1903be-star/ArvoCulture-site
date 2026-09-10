import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info-page";
import { getSeller } from "@/lib/seller-source";

export const metadata: Metadata = {
  title: "Üyelik Sözleşmesi",
  description:
    "ArvoCulture üyeliğinin koşulları, tarafların hak ve yükümlülükleri.",
  alternates: { canonical: "/uyelik-sozlesmesi" },
};

/**
 * Üyelik Sözleşmesi.
 *
 * Mesafeli Satış Sözleşmesi tek bir alışverişi düzenler; bu
 * sözleşme hesap ilişkisinin sürekli koşullarını belirler.
 * İkisi farklı konular: biri satın alma, diğeri üyelik.
 */
export default async function MembershipPage() {
  const SELLER = await getSeller();

  return (
    <InfoPage
      eyebrow="Yasal"
      title="Üyelik Sözleşmesi"
      intro="ArvoCulture hesabı oluşturan kullanıcılar ile mağaza arasındaki üyelik ilişkisinin koşulları."
    >
      <InfoSection title="1. Taraflar">
        <p>
          <strong>Site sahibi:</strong> {SELLER.legalName}
          <br />
          Adres: {SELLER.address}
          <br />
          MERSİS No: {SELLER.mersis}
          <br />
          E-posta: {SELLER.email}
        </p>
        <p>
          <strong>Üye:</strong> {SELLER.website} adresinde hesap oluşturan
          gerçek kişidir.
        </p>
      </InfoSection>

      <InfoSection title="2. Sözleşmenin Konusu">
        <p>
          Bu sözleşme, üyeliğin kapsamını, tarafların hak ve
          yükümlülüklerini ve hesabın kullanım koşullarını düzenler.
        </p>
        <p>
          Üyelik alışveriş için zorunlu değildir; misafir olarak da
          sipariş verilebilir. Üyelik, sipariş geçmişi, adres defteri ve
          favoriler gibi özelliklere erişim sağlar.
        </p>
        <p>
          Satın alma işlemleri{" "}
          <Link href="/mesafeli-satis-sozlesmesi">
            Mesafeli Satış Sözleşmesi
          </Link>{" "}
          kapsamındadır. Bu iki sözleşme birbirinden bağımsızdır.
        </p>
      </InfoSection>

      <InfoSection title="3. Üyelik Koşulları">
        <p>
          Üye olabilmek için on sekiz yaşını doldurmuş ve fiil ehliyetine
          sahip olmak gerekir. On sekiz yaşından küçükler ancak yasal
          temsilcilerinin izniyle işlem yapabilir.
        </p>
        <p>
          Üyelik, geçerli bir e-posta adresi ve şifre belirlenerek
          oluşturulur. E-posta adresinin doğrulanması gerekir.
        </p>
        <p>
          Bir kişi tek üyelik oluşturabilir. Aynı kişiye ait mükerrer
          hesaplar tespit edilirse birleştirilebilir veya kapatılabilir.
        </p>
        <p>
          Üye, kayıt sırasında verdiği bilgilerin doğru ve güncel
          olduğunu beyan eder. Bilgilerin yanlış olmasından doğan
          sonuçlardan Üye sorumludur.
        </p>
      </InfoSection>

      <InfoSection title="4. Hesap Güvenliği">
        <p>
          Şifrenin gizliliğinden ve hesabın güvenliğinden Üye
          sorumludur. Şifrenin üçüncü kişilerle paylaşılmaması gerekir.
        </p>
        <p>
          Hesap üzerinden yapılan tüm işlemler Üye tarafından yapılmış
          sayılır. Hesabınızın yetkisiz kullanıldığını fark ederseniz
          derhal {SELLER.email} adresine bildirin.
        </p>
        <p>
          Bildirimden önce gerçekleşen işlemlerden site sahibi sorumlu
          tutulamaz.
        </p>
        <p>
          Site sahibi, güvenlik gerekçesiyle şifre sıfırlama talep
          edebilir veya hesabı geçici olarak askıya alabilir.
        </p>
      </InfoSection>

      <InfoSection title="5. Üyenin Yükümlülükleri">
        <p>Üye, hesabını kullanırken şunları kabul eder:</p>
        <ul>
          <li>Siteyi yalnızca hukuka uygun amaçlarla kullanmak</li>
          <li>
            Başkalarının haklarını ihlal edecek, sitenin işleyişini
            bozacak veya güvenliğini tehdit edecek davranışlardan
            kaçınmak
          </li>
          <li>
            Otomatik araçlarla toplu veri çekmemek, içerikleri izinsiz
            kopyalamamak
          </li>
          <li>
            Yanıltıcı bilgi vermemek, başkasının kimliğini
            kullanmamak
          </li>
          <li>
            Perakende satış niteliği taşımayan, ticari amaçlı toplu
            siparişler vermemek
          </li>
        </ul>
        <p>
          Bu yükümlülüklerin ihlali hâlinde üyelik askıya alınabilir veya
          sonlandırılabilir.
        </p>
      </InfoSection>

      <InfoSection title="6. Site Sahibinin Yükümlülükleri">
        <p>
          Site sahibi, hizmetin kesintisiz ve güvenli sunulması için
          makul özeni gösterir.
        </p>
        <p>
          Teknik arıza, bakım, güncelleme veya üçüncü taraf hizmet
          sağlayıcılardan kaynaklanan kesintiler yaşanabilir. Planlı
          bakımlar mümkün olduğunca önceden duyurulur.
        </p>
        <p>
          Site sahibi, üyelik kapsamındaki özellikleri geliştirebilir,
          değiştirebilir veya kaldırabilir.
        </p>
      </InfoSection>

      <InfoSection title="7. Kişisel Veriler">
        <p>
          Üyelik kapsamında işlenen kişisel veriler hakkında ayrıntılı
          bilgi için{" "}
          <Link href="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</Link>{" "}
          ve{" "}
          <Link href="/gizlilik">Gizlilik ve Çerez Politikası</Link>{" "}
          sayfalarını inceleyin.
        </p>
        <p>
          Üyelik oluşturmak, ticari elektronik ileti almayı kabul etmek
          anlamına gelmez. Kampanya bildirimleri ayrıca onay
          gerektirir; bkz.{" "}
          <Link href="/ticari-elektronik-ileti">
            Ticari Elektronik İleti
          </Link>
          .
        </p>
      </InfoSection>

      <InfoSection title="8. Üyeliğin Sona Ermesi">
        <p>
          <strong>Üye tarafından:</strong> Hesabınızı dilediğiniz zaman
          kapatabilirsiniz. Talebinizi {SELLER.email} adresine
          iletmeniz yeterlidir.
        </p>
        <p>
          <strong>Site sahibi tarafından:</strong> Bu sözleşmenin ihlali
          hâlinde üyelik, bildirimde bulunularak sonlandırılabilir. Ağır
          ihlallerde bildirim önceden yapılmayabilir.
        </p>
        <p>
          Üyeliğin sona ermesi, tamamlanmış siparişlere ilişkin hak ve
          yükümlülükleri etkilemez. Devam eden siparişler teslim edilir.
        </p>
        <p>
          Hesap kapatıldığında kişisel verileriniz, mevzuattaki saklama
          yükümlülükleri saklı kalmak kaydıyla silinir veya anonim hâle
          getirilir. Fatura ve ticari kayıtlar yasal süre boyunca
          saklanır.
        </p>
      </InfoSection>

      <InfoSection title="9. Fikri Mülkiyet">
        <p>
          Sitede yer alan marka, logo, tasarım, metin, görsel ve yazılım{" "}
          {SELLER.legalName} veya ilgili hak sahiplerine aittir. İzinsiz
          kullanımı hukuka aykırıdır.
        </p>
        <p>
          Üyelik, bu unsurlar üzerinde herhangi bir hak veya lisans
          vermez.
        </p>
      </InfoSection>

      <InfoSection title="10. Sözleşme Değişiklikleri">
        <p>
          Bu sözleşme güncellenebilir. Güncel sürüm her zaman bu sayfada
          yayımlanır.
        </p>
        <p>
          Üyenin haklarını esaslı biçimde etkileyen değişiklikler
          e-postayla bildirilir. Bildirimden sonra siteyi kullanmaya
          devam etmek, değişikliklerin kabul edildiği anlamına gelir.
        </p>
      </InfoSection>

      <InfoSection title="11. Uyuşmazlık Çözümü">
        <p>
          Bu sözleşmeye Türkiye Cumhuriyeti hukuku uygulanır.
        </p>
        <p>
          Uyuşmazlıklarda, Ticaret Bakanlığı’nca her yıl ilan edilen
          parasal sınırlar dâhilinde Üye’nin yerleşim yerindeki veya
          işlemin yapıldığı yerdeki İl ya da İlçe Tüketici Hakem
          Heyetleri; bu sınırların üzerindeki uyuşmazlıklarda Tüketici
          Mahkemeleri yetkilidir.
        </p>
      </InfoSection>

      <InfoSection title="12. Yürürlük">
        <p>
          Bu sözleşme, Üye’nin kayıt sırasında elektronik ortamda
          onaylamasıyla yürürlüğe girer ve üyelik devam ettiği sürece
          geçerliliğini korur.
        </p>
        <p>
          Üye, sözleşmenin tamamını okuduğunu ve koşulları kabul ettiğini
          beyan eder.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
