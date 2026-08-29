import { InfoPage, InfoSection } from "@/components/info-page";
export default function Terms() {
  return (
    <InfoPage
      eyebrow="YASAL"
      title="Kullanım koşulları."
      intro="ArvoCulture mağazasını kullanırken geçerli temel satış ve kullanım esasları."
    >
      <InfoSection title="Ürün ve fiyat bilgileri">
        <p>
          Ürün özellikleri, stok ve fiyat bilgileri mağaza kayıtlarına göre
          sunulur. Açık teknik hata veya yetkisiz müdahale hâlinde sipariş
          doğrulama hakkı saklıdır.
        </p>
      </InfoSection>
      <InfoSection title="Siparişin kurulması">
        <p>
          Sipariş, ödeme ve stok kontrollerinin başarıyla tamamlanması ve
          müşteriye onay iletilmesiyle kesinleşir.
        </p>
      </InfoSection>
      <InfoSection title="Fikri haklar">
        <p>
          ArvoCulture markası, tasarım sistemi, metinleri ve görsel içerikleri
          ilgili hak sahiplerine aittir; izinsiz ticari kullanım yapılamaz.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
