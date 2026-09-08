import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/info-page";
import { SELLER } from "@/lib/seller";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi",
  description:
    "ArvoCulture üzerinden yapılan alışverişlere ilişkin mesafeli satış sözleşmesi.",
  alternates: { canonical: "/mesafeli-satis-sozlesmesi" },
};

/**
 * Mesafeli Satış Sözleşmesi.
 *
 * İçerik, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve
 * Mesafeli Sözleşmeler Yönetmeliği'nin aradığı başlıklara göre
 * düzenlenmiştir. Yayına almadan önce hukuki inceleme
 * yaptırılması gerekir; özellikle iade masrafı, teslimat süresi
 * ve kayıtlı kargo firması bilgileri işletmenin fiili
 * uygulamasıyla örtüşmelidir.
 */
export default function DistanceSalesPage() {
  return (
    <InfoPage
      eyebrow="Yasal"
      title="Mesafeli Satış Sözleşmesi"
      intro="Bu sözleşme, ArvoCulture internet sitesi üzerinden yapılan alışverişlerde tarafların hak ve yükümlülüklerini düzenler."
    >
      <InfoSection title="1. Taraflar">
        <p>
          <strong>SATICI</strong>
          <br />
          Unvan: {SELLER.legalName}
          <br />
          Adres: {SELLER.address}
          <br />
          MERSİS No: {SELLER.mersis}
          <br />
          Ticaret Sicil No: {SELLER.tradeRegistry}
          <br />
          Vergi Dairesi / No: {SELLER.taxOffice} / {SELLER.taxNumber}
          <br />
          E-posta: {SELLER.email}
          <br />
          Telefon: {SELLER.phone}
        </p>
        <p>
          <strong>ALICI</strong>
          <br />
          Sipariş sırasında bildirilen ad, soyad, teslimat adresi,
          e-posta adresi ve telefon numarası ile tanımlanan tüketicidir.
          Alıcı, bu bilgilerin doğruluğundan sorumludur.
        </p>
      </InfoSection>

      <InfoSection title="2. Sözleşmenin Konusu">
        <p>
          İşbu sözleşmenin konusu, Alıcı&apos;nın Satıcı&apos;ya ait{" "}
          {SELLER.website} adresli internet sitesinden elektronik ortamda
          sipariş verdiği, aşağıda nitelikleri ve satış fiyatı belirtilen
          ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı
          Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
          Yönetmeliği hükümleri gereğince tarafların hak ve
          yükümlülüklerinin belirlenmesidir.
        </p>
      </InfoSection>

      <InfoSection title="3. Sözleşme Konusu Ürün ve Ödeme Bilgileri">
        <p>
          Ürünün cinsi, türü, miktarı, marka/modeli, rengi, adedi, satış
          bedeli ve ödeme şekli, sipariş özeti ekranında ve sipariş onay
          e-postasında yer alır. Bu bilgiler işbu sözleşmenin ayrılmaz
          parçasıdır.
        </p>
        <p>
          Listelenen ve sitede ilan edilen fiyatlar satış fiyatıdır.
          İlan edilen fiyatlar ve vaatler güncelleme yapılana ve
          değiştirilene kadar geçerlidir. Süreli olarak ilan edilen
          fiyatlar ise belirtilen süre sonuna kadar geçerlidir.
        </p>
        <p>
          Kargo ücreti {SELLER.shippingFee}&apos;dir.{" "}
          {SELLER.freeShippingThreshold} ve üzeri siparişlerde kargo ücreti
          Satıcı tarafından karşılanır.
        </p>
      </InfoSection>

      <InfoSection title="4. Genel Hükümler">
        <p>
          Alıcı, sözleşme konusu ürünün temel nitelikleri, satış fiyatı,
          ödeme şekli ve teslimata ilişkin ön bilgileri okuyup bilgi
          sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini
          beyan eder.
        </p>
        <p>
          Sözleşme konusu ürün, yasal {SELLER.deliveryDaysMax} günlük süreyi
          aşmamak koşuluyla Alıcı&apos;nın belirttiği adrese teslim edilir.
          Bu süre içinde teslim edilememesi hâlinde Alıcı sözleşmeyi
          feshedebilir ve ödediği tutarın iadesini talep edebilir.
        </p>
        <p>
          Ürünün tesliminden sonra Alıcı&apos;ya ait kredi kartının
          Alıcı&apos;nın kusurundan kaynaklanmayan bir şekilde yetkisiz
          kişilerce haksız veya hukuka aykırı olarak kullanılması nedeniyle
          ilgili banka veya finans kuruluşunun ürün bedelini Satıcı&apos;ya
          ödememesi hâlinde, ürünün Alıcı&apos;ya teslim edilmiş olması
          kaydıyla ürün Satıcı&apos;ya iade edilir.
        </p>
        <p>
          Sözleşme konusu ürünün Alıcı&apos;dan başka bir kişiye teslim
          edilecek olması hâlinde, teslim edilecek kişinin teslimatı kabul
          etmemesinden Satıcı sorumlu tutulamaz.
        </p>
        <p>
          Satıcı, sipariş konusu ürünün tedarikinin imkânsızlaştığı
          durumlarda bu durumu öğrendiği tarihten itibaren üç gün içinde
          Alıcı&apos;ya yazılı olarak bildirir ve varsa teslimat masrafları
          da dâhil olmak üzere tahsil edilen tüm ödemeleri en geç on dört
          gün içinde iade eder.
        </p>
      </InfoSection>

      <InfoSection title="5. Cayma Hakkı">
        <p>
          Alıcı, sözleşme konusu ürünün kendisine veya gösterdiği adresteki
          kişiye tesliminden itibaren {SELLER.withdrawalDays} gün içinde
          hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin cayma
          hakkına sahiptir.
        </p>
        <p>
          Cayma hakkının kullanıldığına dair bildirimin bu süre içinde{" "}
          {SELLER.email} adresine yazılı olarak veya kalıcı veri
          saklayıcısı ile iletilmesi yeterlidir.
        </p>
        <p>
          Cayma hakkının kullanılması hâlinde ürünün Satıcı&apos;ya iade
          edilmesi zorunludur. Ürünün kutusu, ambalajı, varsa standart
          aksesuarları ile birlikte eksiksiz ve hasarsız olarak teslim
          edilmesi gerekir.
        </p>
        <p>
          Satıcı, cayma bildiriminin kendisine ulaşmasından itibaren on
          dört gün içinde ürün bedelini ve varsa teslimat masraflarını
          Alıcı&apos;ya iade eder. İade, ödemenin yapıldığı yöntemle
          gerçekleştirilir. Kredi kartıyla yapılan ödemelerde tutarın
          karta yansıma süresi bankaya bağlıdır.
        </p>
      </InfoSection>

      <InfoSection title="6. Cayma Hakkının Kullanılamayacağı Ürünler">
        <p>
          Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesi uyarınca
          aşağıdaki ürünlerde cayma hakkı kullanılamaz:
        </p>
        <ul>
          <li>
            Tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu
            unsurları açılmış olan ürünlerden iadesi sağlık ve hijyen
            açısından uygun olmayanlar (kozmetik, kişisel bakım ve gıda
            takviyesi ürünleri dâhil)
          </li>
          <li>
            Alıcı&apos;nın istekleri veya kişisel ihtiyaçları doğrultusunda
            hazırlanan ürünler
          </li>
          <li>
            Çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünler
          </li>
          <li>
            Tesliminden sonra başka ürünlerle karışan ve doğası gereği
            ayrıştırılması mümkün olmayan ürünler
          </li>
          <li>
            Elektronik ortamda anında ifa edilen hizmetler ve tüketiciye
            anında teslim edilen gayrimaddi mallar
          </li>
        </ul>
        <p>
          Giyim ürünlerinde cayma hakkı; ürünün kullanılmamış, etiketi
          sökülmemiş ve yeniden satılabilir durumda olması koşuluyla
          kullanılabilir.
        </p>
      </InfoSection>

      <InfoSection title="7. İade Masrafı">
        <p>
          Cayma hakkının kullanılması hâlinde iade gönderim masrafı,
          Satıcı&apos;nın anlaşmalı kargo firması ile gönderilmesi
          koşuluyla Satıcı&apos;ya aittir. Alıcı&apos;nın farklı bir kargo
          firmasını tercih etmesi hâlinde masraf Alıcı tarafından
          karşılanır.
        </p>
        <p>
          Ayıplı ürün, yanlış ürün veya eksik gönderim hâllerinde tüm
          gönderim masrafları Satıcı&apos;ya aittir.
        </p>
      </InfoSection>

      <InfoSection title="8. Temerrüt Hâli">
        <p>
          Alıcı, kredi kartı ile yapmış olduğu işlemlerde temerrüde
          düşmesi hâlinde kart sahibi bankanın kendisi ile yapmış olduğu
          kredi kartı sözleşmesi çerçevesinde faiz ödeyeceğini ve bankaya
          karşı sorumlu olacağını kabul eder. Bu durumda ilgili banka
          hukuki yollara başvurabilir.
        </p>
      </InfoSection>

      <InfoSection title="9. Yetkili Mahkeme">
        <p>
          İşbu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığı
          tarafından her yıl Aralık ayında ilan edilen parasal sınırlar
          dâhilinde Alıcı&apos;nın veya Satıcı&apos;nın yerleşim yerindeki
          Tüketici Hakem Heyetleri, bu sınırların üzerindeki
          uyuşmazlıklarda Tüketici Mahkemeleri yetkilidir.
        </p>
        <p>
          Alıcı, şikâyet ve itirazları için{" "}
          <a href="https://tuketicisikayeti.ticaret.gov.tr" rel="noopener">
            Tüketici Bilgi Sistemi (TÜBİS)
          </a>{" "}
          üzerinden de başvuruda bulunabilir.
        </p>
      </InfoSection>

      <InfoSection title="10. Yürürlük">
        <p>
          Alıcı, site üzerinden verdiği siparişe ait ödemeyi
          gerçekleştirdiğinde işbu sözleşmenin tüm koşullarını kabul etmiş
          sayılır. Sözleşme, sipariş onayı ile yürürlüğe girer ve tarafların
          yükümlülüklerini yerine getirmesiyle sona erer.
        </p>
        <p>
          Bu sözleşmenin bir örneği Alıcı&apos;nın e-posta adresine
          gönderilir ve hesabı üzerinden erişilebilir durumda tutulur.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
