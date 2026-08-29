import { InfoPage, InfoSection } from "@/components/info-page";
export default function Delivery() {
  return (
    <InfoPage
      eyebrow="SİPARİŞ DESTEĞİ"
      title="Teslimat ve iade."
      intro="Siparişinizin hazırlanmasından olası iade sürecine kadar açık ve özenli bir deneyim."
    >
      <InfoSection title="Sipariş hazırlığı">
        <p>
          Ödeme onayı alınan siparişler stok ve adres kontrolünün ardından
          hazırlanır. Kargoya teslim edildiğinde müşteriye takip bilgisi
          iletilir.
        </p>
      </InfoSection>
      <InfoSection title="Kargo">
        <p>
          2.000 TL ve üzerindeki siparişlerde standart kargo ücretsizdir.
          Teslimat süresi adres, yoğunluk ve taşıyıcı koşullarına göre
          değişebilir.
        </p>
      </InfoSection>
      <InfoSection title="İade koşulları">
        <p>
          Kullanılmamış ve yeniden satılabilir durumdaki ürünler, teslimden
          itibaren yasal süre içinde iade talebine konu olabilir. Ambalajı
          açılmış hijyen ürünleri ile kişiye özel ürünlerde mevzuattaki
          istisnalar uygulanır.
        </p>
      </InfoSection>
      <InfoSection title="Hasarlı teslimat">
        <p>
          Paket hasarlıysa teslim sırasında tutanak tutulmasını isteyin ve
          fotoğraflarla birlikte info@arvoculture.com adresine ulaşın.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
