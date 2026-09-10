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
 * Mesafeli Sözleşmeler Yönetmeliği’nin aradığı başlıklara göre
 * düzenlenmiştir. Yayına almadan önce hukuki inceleme
 * yaptırılması gerekir; özellikle iade masrafı, teslimat süresi
 * ve kayıtlı kargo firması bilgileri işletmenin fiili
 * uygulamasıyla örtüşmelidir.
 */
/*
  Satıcı bilgileri veritabanından okunuyor: her mağaza
  kendi unvanı ve adresiyle görünmeli. Sabit dosya
  ArvoCulture’a özeldi.
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
          İşbu sözleşmenin konusu, Alıcı’nın Satıcı’ya ait{" "}
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
          Kargo ücreti {SELLER.shippingFee}’dir.{" "}
          {SELLER.freeShippingThreshold} ve üzeri siparişlerde kargo ücreti
          Satıcı tarafından karşılanır.
        </p>
      </InfoSection>

      <InfoSection title="4. Ürün Fiyatı ve Ödeme">
        <p>
          Sitede yer alan ürünlere, siparişin verildiği anda geçerli olan
          ve Türk Lirası cinsinden belirtilen satış fiyatları uygulanır.
          Fiyatlar zaman zaman değiştirilebilir; değişiklik önceden
          verilmiş siparişleri etkilemez.
        </p>
        <p>
          <strong>Belirtilen fiyatlara KDV dâhildir.</strong> Kargo ücreti
          dâhil değildir ve sipariş onaylanmadan önce ayrıca gösterilir.
          {SELLER.freeShippingThreshold
            ? " Belirlenen tutarın üzerindeki siparişlerde kargo ücretsizdir."
            : ""}
        </p>
        <p>
          Ödeme, 3D Secure korumalı sanal POS altyapısı üzerinden kredi
          kartı veya banka kartıyla yapılır. Kart bilgileriniz
          sunucularımıza hiçbir aşamada ulaşmaz; doğrudan ödeme
          kuruluşuna iletilir.
        </p>
        <p>
          Herhangi bir nedenle ürün bedelinin tamamı ya da bir kısmı
          ödenmez veya banka kayıtlarında iptal edilirse, Satıcı siparişi
          ifa etme yükümlülüğünden kurtulmuş sayılır.
        </p>
        <p>
          Ürünün tesliminden sonra Alıcı’ya ait kartın Alıcı’nın
          kusuru olmaksızın yetkisiz kişilerce kullanılması nedeniyle
          banka ya da finans kuruluşunun bedeli Satıcı’ya ödememesi
          hâlinde, ürün teslim edilmiş olmak kaydıyla Satıcı’ya iade
          edilir.
        </p>
      </InfoSection>

      <InfoSection title="5. Ürün Bilgileri ve Stok">
        <p>
          Ürünlerin temel nitelikleri, satış fiyatı ve içeriği ürün
          sayfasında yer alır. Bilgiler özenle hazırlanır; yine de baskı,
          sistem ya da tedarik kaynaklı hata oluşabilir.
        </p>
        <p>
          Ürün görselleri tanıtım amaçlıdır. Ekran ayarlarına bağlı olarak
          renklerde farklılık görülebilir.
        </p>
        <p>
          Stok bilgisi sipariş anında gösterilir. Teknik nedenlerle
          istisnai olarak hata oluşabilir. Ürünün bir kısmının ya da
          tamamının stokta bulunmadığının sonradan anlaşılması hâlinde
          durum Alıcı’ya bildirilir; siparişin ilgili kısmı iptal
          edilir ve tahsil edilmiş tutar iade edilir.
        </p>
        <p>
          Kampanya, indirim ve özel teklifler belirtilen tarihlerde
          ve/veya stoklar tükenene kadar geçerlidir.
        </p>
        <p>
          Satıcı, fiyat ya da stok bilgisinde açık maddi hata bulunması
          hâlinde siparişi iptal etme hakkını saklı tutar. Bu durumda
          tahsil edilmiş tutar iade edilir.
        </p>
      </InfoSection>

      <InfoSection title="6. Siparişin Kurulması">
        <p>
          Alıcı, siparişini onaylamadan önce sepetindeki ürünleri, adet
          ve tutarları ile teslimat bilgilerini kontrol edebilir ve
          düzeltebilir.
        </p>
        <p>
          Sözleşme, Alıcı’nın ödeme adımını onaylamasıyla kurulur.
          Alıcı bu onayla birlikte ödeme yükümlülüğü altına girdiğini
          kabul eder.
        </p>
        <p>
          Sipariş onayının ardından Ön Bilgilendirme Formu ve bu sözleşme,
          Alıcı’nın bildirdiği e-posta adresine gönderilir.
          Belgelerin saklanması önerilir.
        </p>
        <p>
          E-posta adresinin hatalı bildirilmesi veya erişim sorunları
          nedeniyle bildirimlerin ulaşmamasından Satıcı sorumlu değildir.
          Bu durumda da onaylanmış sipariş geçerli sayılır.
        </p>
      </InfoSection>

      <InfoSection title="7. Teslimat">
        <p>
          Sipariş, ödemenin onaylanmasından sonra hazırlanır ve yasal
          süreyi aşmamak kaydıyla, her hâlükârda siparişin Satıcı’ya
          ulaştığı tarihten itibaren en geç {SELLER.deliveryDaysMax} gün
          içinde Alıcı’nın bildirdiği adrese teslim edilir.
        </p>
        <p>
          Satıcı ürünün sağlam, eksiksiz, siparişte belirtilen niteliklere
          uygun ve varsa garanti belgeleriyle birlikte teslim
          edilmesinden sorumludur.
        </p>
        <p>
          Teslimatın Alıcı’dan başka bir kişiye yapılacak olması
          hâlinde, teslim alacak kişinin kabul etmemesinden Satıcı
          sorumlu tutulamaz.
        </p>
        <p>
          Mücbir sebep hâllerinde Satıcı durumu Alıcı’ya bildirir.
          Alıcı bu durumda siparişi iptal edip bedelin iadesini isteyebilir
          ya da engel ortadan kalkana kadar teslimatın ertelenmesini kabul
          edebilir.
        </p>
        <p>
          Ürünün tedarikinin imkânsızlaştığı hâllerde Satıcı bu durumu
          öğrendiği tarihten itibaren üç gün içinde Alıcı’ya bildirir
          ve tahsil edilen tutarı en geç on dört gün içinde iade eder.
        </p>
      </InfoSection>

      <InfoSection title="8. Cayma Hakkı">
        <p>
          Alıcı, ürünü teslim aldığı ya da ürünün gönderildiği üçüncü
          kişiye teslim edildiği tarihten itibaren{" "}
          <strong>{SELLER.withdrawalDays} gün</strong> içinde, hiçbir gerekçe
          göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayabilir.
        </p>
        <p>
          Cayma hakkı, sözleşmenin kurulmasından ürünün teslimine kadar
          olan süre içinde de kullanılabilir.
        </p>
        <p>
          <strong>Nasıl kullanılır:</strong> Hesabınızdaki sipariş
          detayından iade talebi oluşturabilir ya da {SELLER.email}{" "}
          adresine sipariş numaranızla yazabilirsiniz. Cayma bildiriminin
          süre içinde yapılmış olması yeterlidir.
        </p>
        <p>
          Ürünü, cayma bildiriminden itibaren on gün içinde Satıcı’ya
          göndermeniz gerekir. Ürünün kutusu, ambalajı, varsa standart
          aksesuarları ve faturasıyla birlikte, satılabilirliğini
          yitirmemiş olarak iade edilmesi gerekir.
        </p>
        <p>
          <strong>İade süresi:</strong> Cayma bildirimi Satıcı’ya
          ulaştıktan sonra en geç on dört gün içinde, teslimat masrafları
          dâhil tüm ödemeleriniz, satın alırken kullandığınız ödeme
          aracına iade edilir.
        </p>
        <p>
          İade tutarının kartınıza yansıma süresi bankanıza bağlıdır;
          bu süredeki gecikmelerden Satıcı sorumlu tutulamaz.
        </p>
        <p>
          Ürünün kullanımdan doğan değer kaybı olması hâlinde, kaybın
          bedeli iade tutarından düşülebilir. Ürünün niteliği, özellikleri
          ve işleyişini anlamak için yapılan olağan kullanım bu kapsamda
          değildir.
        </p>
      </InfoSection>

      <InfoSection title="9. Cayma Hakkının Kullanılamayacağı Hâller">
        <p>
          Mesafeli Sözleşmeler Yönetmeliği’nin 15. maddesi uyarınca
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

      <InfoSection title="10. Sipariş Sınırları">
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
          edilebilir. Bu durumda tahsil edilmiş tutar Alıcı’ya iade
          edilir.
        </p>
      </InfoSection>

      <InfoSection title="11. Ayıplı veya Hasarlı Teslimat">
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

      <InfoSection title="12. İade Masrafı">
        <p>
          Cayma hakkının kullanılması hâlinde iade gönderim masrafı,
          Satıcı’nın anlaşmalı kargo firması ile gönderilmesi
          koşuluyla Satıcı’ya aittir. Alıcı’nın farklı bir kargo
          firmasını tercih etmesi hâlinde masraf Alıcı tarafından
          karşılanır.
        </p>
        <p>
          Ayıplı ürün, yanlış ürün veya eksik gönderim hâllerinde tüm
          gönderim masrafları Satıcı’ya aittir.
        </p>
      </InfoSection>

      <InfoSection title="13. Temerrüt Hâli">
        <p>
          Alıcı, kredi kartı ile yapmış olduğu işlemlerde temerrüde
          düşmesi hâlinde kart sahibi bankanın kendisi ile yapmış olduğu
          kredi kartı sözleşmesi çerçevesinde faiz ödeyeceğini ve bankaya
          karşı sorumlu olacağını kabul eder. Bu durumda ilgili banka
          hukuki yollara başvurabilir.
        </p>
      </InfoSection>

      <InfoSection title="14. Yetkili Mahkeme">
        <p>
          İşbu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığı
          tarafından her yıl Aralık ayında ilan edilen parasal sınırlar
          dâhilinde Alıcı’nın veya Satıcı’nın yerleşim yerindeki
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

      <InfoSection title="15. Sözleşmenin Saklanması">
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

      <InfoSection title="16. Yürürlük">
        <p>
          Alıcı, site üzerinden verdiği siparişe ait ödemeyi
          gerçekleştirdiğinde işbu sözleşmenin tüm koşullarını kabul etmiş
          sayılır. Sözleşme, sipariş onayı ile yürürlüğe girer ve tarafların
          yükümlülüklerini yerine getirmesiyle sona erer.
        </p>
        <p>
          Bu sözleşmenin bir örneği Alıcı’nın e-posta adresine
          gönderilir ve hesabı üzerinden erişilebilir durumda tutulur.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
