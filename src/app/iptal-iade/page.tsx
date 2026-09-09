import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info-page";
import { getSeller } from "@/lib/seller-source";

export const metadata: Metadata = {
  title: "İptal ve İade",
  description:
    "ArvoCulture sipariş iptali, cayma hakkı ve iade süreçleri.",
  alternates: { canonical: "/iptal-iade" },
};

/*
  Satıcı bilgileri veritabanından okunuyor: her mağaza
  kendi unvanı ve adresiyle görünmeli. Sabit dosya
  ArvoCulture'a özeldi.
*/
export default async function ReturnsPage() {
  const SELLER = await getSeller();

  return (
    <InfoPage
      eyebrow="Müşteri Hizmetleri"
      title="İptal ve İade"
      intro="Siparişinizi iptal etmek ya da ürünü iade etmek istediğinizde izleyeceğiniz adımlar."
    >
      <InfoSection title="Sipariş İptali">
        <p>
          Siparişiniz kargoya verilmeden önce {SELLER.email} adresine
          sipariş numaranızla yazarak iptal talebinde bulunabilirsiniz.
          Ödemeniz alınmışsa tutar, iptalin onaylanmasından itibaren en geç
          on dört gün içinde ödeme yaptığınız yönteme iade edilir.
        </p>
        <p>
          Sipariş kargoya verildiyse iptal yerine cayma hakkı hükümleri
          uygulanır.
        </p>
      </InfoSection>

      <InfoSection title="Cayma Hakkı">
        <p>
          Ürünü teslim aldığınız tarihten itibaren{" "}
          <strong>{SELLER.withdrawalDays} gün</strong> içinde hiçbir gerekçe
          göstermeden ve cezai şart ödemeden cayma hakkınızı
          kullanabilirsiniz.
        </p>
        <p>
          Bildirimi bu süre içinde {SELLER.email} adresine göndermeniz
          yeterlidir; ürünün aynı süre içinde ulaşması gerekmez.
        </p>
      </InfoSection>

      <InfoSection title="İade Koşulları">
        <ul>
          <li>Ürün kullanılmamış ve yeniden satılabilir durumda olmalı</li>
          <li>Orijinal ambalajı, etiketi ve varsa aksesuarları eksiksiz olmalı</li>
          <li>Fatura ile birlikte gönderilmeli</li>
        </ul>
      </InfoSection>

      <InfoSection title="Cayma Hakkı Kapsamı Dışındaki Ürünler">
        <p>
          Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesi uyarınca
          aşağıdaki ürünlerde cayma hakkı kullanılamaz:
        </p>
        <ul>
          <li>
            Ambalajı, bandı veya mührü açılmış kozmetik, kişisel bakım ve
            gıda takviyesi ürünleri (hijyen gerekçesiyle)
          </li>
          <li>Kişiye özel hazırlanan ürünler</li>
          <li>Çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünler</li>
        </ul>
        <p>
          Giyim ürünlerinde iade mümkündür; ürünün kullanılmamış ve etiketi
          sökülmemiş olması gerekir.
        </p>
        <p>
          Bu istisnalar ürünün niteliğine göre uygulanır. Ambalajı açılmamış
          kozmetik ürünler iade edilebilir.
        </p>
      </InfoSection>

      <InfoSection title="İade Süreci">
        <ol>
          <li>
            {SELLER.email} adresine sipariş numaranız ve iade nedeninizle
            yazın
          </li>
          <li>
            Size iade kodu ve kargo yönlendirmesi iletilir
          </li>
          <li>Ürünü faturasıyla birlikte kargoya verin</li>
          <li>
            Ürün tarafımıza ulaşıp incelendikten sonra iade onaylanır
          </li>
          <li>
            Tutar, en geç on dört gün içinde ödeme yaptığınız yönteme iade
            edilir
          </li>
        </ol>
        <p>
          Kredi kartına yapılan iadelerin karta yansıma süresi bankanıza
          bağlıdır ve bu süre Satıcı&apos;nın kontrolünde değildir.
        </p>
      </InfoSection>

      <InfoSection title="İade Kargo Ücreti">
        <p>
          Anlaşmalı kargo firmamızla gönderilen iadelerde kargo ücreti
          tarafımıza aittir. Farklı bir firma tercih ederseniz masraf size
          ait olur.
        </p>
        <p>
          Ayıplı, yanlış ya da eksik gönderilen ürünlerde tüm gönderim
          masrafları tarafımıza aittir.
        </p>
      </InfoSection>

      <InfoSection title="Ayıplı Ürün">
        <p>
          Teslim aldığınız ürün hasarlı, kusurlu veya siparişinizden farklı
          ise fotoğraflarıyla birlikte {SELLER.email} adresine bildirin.
          Bu durumda ürünün değişimi, bedelin iadesi ya da onarım
          seçeneklerinden dilediğinizi talep edebilirsiniz.
        </p>
        <p>
          Kargo paketinin hasarlı olduğunu teslim sırasında fark ederseniz
          kargo görevlisine tutanak tutturmanız sürecin hızlanmasını
          sağlar.
        </p>
      </InfoSection>

      <InfoSection title="Şikâyet ve İtiraz">
        <p>
          Talebinizin karşılanmadığını düşünüyorsanız, parasal sınırlar
          dâhilinde yerleşim yerinizdeki Tüketici Hakem Heyetine veya
          Tüketici Mahkemesine başvurabilirsiniz. Ticaret
          Bakanlığı&apos;nın{" "}
          <a href="https://tuketicisikayeti.ticaret.gov.tr" rel="noopener">
            Tüketici Bilgi Sistemi
          </a>{" "}
          üzerinden de başvuru yapılabilir.
        </p>
        <p>
          Ayrıntılı sözleşme hükümleri için{" "}
          <Link href="/mesafeli-satis-sozlesmesi">
            Mesafeli Satış Sözleşmesi
          </Link>{" "}
          sayfasına bakabilirsiniz.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
