import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/info-page";
import { getSeller } from "@/lib/seller-source";

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
/*
  Satıcı bilgileri veritabanından okunuyor: her mağaza
  kendi unvanı ve adresiyle görünmeli. Sabit dosya
  ArvoCulture'a özeldi.
*/
export default async function DistanceSalesPage() {
  const SELLER = await getSeller();

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

      <InfoSection title="1.a. İade Bilgileri">
        <p>
          <strong>İade adresi:</strong> {SELLER.address}
        </p>
        <p>
          <strong>Anlaşmalı kargo firması:</strong> İade gönderileriniz
          için mağazamızın anlaşmalı olduğu kargo firmasını
          kullanabilirsiniz. Firma bilgisi iade talebiniz onaylandığında
          size bildirilir.
        </p>
        <p>
          Anlaşmalı kargo firmasıyla yapılan iadelerde sizden ücret tahsil
          edilmez. Farklı bir taşıyıcı tercih ederseniz gönderi masrafı
          size ait olur.
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

      <InfoSection title="6. Cayma Hakkının Kullanılamayacağı Hâller">
        <p>
          Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesi uyarınca
          aşağıdaki sözleşmelerde cayma hakkı kullanılamaz:
        </p>
        <ul>
          <li>
            Fiyatı finansal piyasalardaki dalgalanmalara bağlı olarak
            değişen ve satıcının kontrolünde olmayan mal veya hizmetler.
          </li>
          <li>
            Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda
            hazırlanan mallar.
          </li>
          <li>
            Çabuk bozulabilen veya son kullanma tarihi geçebilecek mallar.
          </li>
          <li>
            Tesliminden sonra ambalaj, bant, mühür veya paket gibi
            koruyucu unsurları açılmış olan mallardan iadesi sağlık ve
            hijyen açısından uygun olmayanlar.
          </li>
          <li>
            Tesliminden sonra başka ürünlerle karışan ve doğası gereği
            ayrıştırılması mümkün olmayan mallar.
          </li>
          <li>
            Koruyucu unsurları açılmış kitap, dijital içerik ve bilgisayar
            sarf malzemeleri.
          </li>
          <li>
            Abonelik kapsamı dışındaki gazete, dergi gibi süreli yayınlar.
          </li>
          <li>
            Belirli bir tarihte yapılması gereken konaklama, taşıma, araç
            kiralama, yiyecek-içecek tedariki ve eğlence hizmetleri.
          </li>
          <li>
            Elektronik ortamda anında ifa edilen hizmetler ve anında
            teslim edilen gayrimaddi mallar.
          </li>
          <li>
            Cayma süresi dolmadan, tüketicinin onayıyla ifasına başlanan
            hizmetler.
          </li>
          <li>
            Tescili zorunlu taşınırlar ve insansız hava araçları.
          </li>
          <li>
            Teslim edilmiş cep telefonu, akıllı saat, tablet ve
            bilgisayarlar.
          </li>
          <li>Canlı müzayede yoluyla akdedilen sözleşmeler.</li>
          <li>
            Kurulum veya montajı satıcı tarafından yapılan mallardan
            kurulumu tamamlananlar.
          </li>
        </ul>
        <p>
          <strong>
            Kozmetik ve kişisel bakım ürünlerinde cayma hakkı, ürünün
            ambalajı açılmamış, bozulmamış ve kullanılmamış olması
            şartına bağlıdır.
          </strong>{" "}
          Bu ürünler hijyen gereği açıldıktan sonra iade alınamaz.
        </p>
        <p>
          İç giyim, mayo ve çorap gibi hijyenik ürünler de aynı kapsamda
          değerlendirilir.
        </p>
      </InfoSection>

      <InfoSection title="7. Sipariş Sınırları">
        <p>
          Mağazamız yalnızca nihai tüketiciye perakende satış yapar.
          Alıcı, siparişini kişisel kullanım amacıyla ve tüketici
          sıfatıyla verdiğini kabul eder.
        </p>
        <p>
          Kötüye kullanımı önlemek amacıyla aşağıdaki sınırlar
          uygulanabilir:
        </p>
        <ul>
          <li>Aynı gün içinde aynı karttan verilebilecek sipariş sayısı</li>
          <li>Aynı üründen tek siparişte alınabilecek adet</li>
          <li>Aynı gün içinde ulaşılabilecek toplam sipariş tutarı</li>
        </ul>
        <p>
          Perakende satış niteliği taşımadığı açık olan siparişler ile
          hileli olduğu tespit edilen işlemler Satıcı tarafından iptal
          edilebilir. Bu durumda tahsil edilmiş tutar Alıcı&apos;ya iade
          edilir.
        </p>
      </InfoSection>

      <InfoSection title="8. Ayıplı veya Hasarlı Teslimat">
        <p>
          Alıcı ya da teslimatı alan üçüncü kişi, kargoyu teslim alırken
          paketin dış görünümünü kontrol etmelidir.
        </p>
        <p>
          Kutunun açılmış, ezilmiş veya ıslanmış olması, üründe kırık ya
          da eksik bulunması veya yanlış ürün gönderilmiş olması hâlinde:
        </p>
        <ul>
          <li>
            Mümkünse paketi açmadan kargo görevlisine tutanak tutturun.
          </li>
          <li>
            Teslimattan itibaren 14 gün içinde {SELLER.email} adresine
            sipariş numaranızla başvurun.
          </li>
          <li>Ürünün ve paketin fotoğraflarını ekleyin.</li>
        </ul>
        <p>
          Talebiniz incelenir ve haklı bulunması hâlinde kargo masrafları
          dâhil tüm ödemeleriniz, satın alırken kullandığınız ödeme
          aracına iade edilir.
        </p>
      </InfoSection>

      <InfoSection title="9. İade Masrafı">
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

      <InfoSection title="10. Temerrüt Hâli">
        <p>
          Alıcı, kredi kartı ile yapmış olduğu işlemlerde temerrüde
          düşmesi hâlinde kart sahibi bankanın kendisi ile yapmış olduğu
          kredi kartı sözleşmesi çerçevesinde faiz ödeyeceğini ve bankaya
          karşı sorumlu olacağını kabul eder. Bu durumda ilgili banka
          hukuki yollara başvurabilir.
        </p>
      </InfoSection>

      <InfoSection title="11. Yetkili Mahkeme">
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

      <InfoSection title="12. Sözleşmenin Saklanması">
        <p>
          Bu sözleşme ve Ön Bilgilendirme Formu, siparişiniz onaylandıktan
          sonra bildirdiğiniz e-posta adresine gönderilir. Belgeleri
          saklamanızı öneririz.
        </p>
        <p>
          Sözleşmenin bir örneği hesabınızdaki sipariş detayından da
          görüntülenebilir. E-postanıza ulaşamamanız hâlinde{" "}
          {SELLER.email} adresinden talep edebilirsiniz.
        </p>
        <p>
          Sipariş anında yürürlükte olan sözleşme hükümleri o sipariş için
          geçerlidir. Satıcı sözleşmeyi ileriye dönük olarak
          değiştirebilir; değişiklik önceki siparişleri etkilemez.
        </p>
      </InfoSection>

      <InfoSection title="13. Yürürlük">
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
