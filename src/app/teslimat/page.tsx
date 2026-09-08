import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info-page";
import { SELLER } from "@/lib/seller";

export const metadata: Metadata = {
  title: "Teslimat Politikası",
  description: "Kargo süreleri, ücretler ve teslimat koşulları.",
  alternates: { canonical: "/teslimat" },
};

export default function DeliveryPage() {
  return (
    <InfoPage
      eyebrow="Müşteri Hizmetleri"
      title="Teslimat"
      intro="Siparişinizin hazırlanmasından kapınıza ulaşmasına kadar geçen süreç."
    >
      <InfoSection title="Kargo Ücreti">
        <p>
          Kargo ücreti {SELLER.shippingFee}&apos;dir.{" "}
          {SELLER.freeShippingThreshold} ve üzeri siparişlerde kargo ücreti
          tarafımızca karşılanır.
        </p>
        <p>
          Ücret, ödeme adımında toplam tutara ayrı satır olarak eklenir;
          sürpriz bir masrafla karşılaşmazsınız.
        </p>
      </InfoSection>

      <InfoSection title="Hazırlık ve Gönderim">
        <p>
          Siparişiniz, ödemenizin onaylanmasının ardından hazırlanır.
          Kargoya teslim edildiğinde e-posta ile bilgilendirilirsiniz.
        </p>
        <p>
          Yasal teslimat süresi azami {SELLER.deliveryDaysMax} gündür. Bu
          süre içinde teslim edilememesi hâlinde siparişinizi iptal edip
          ödemenizin iadesini talep edebilirsiniz.
        </p>
      </InfoSection>

      <InfoSection title="Teslimat Bölgesi">
        <p>
          Şu anda yalnızca Türkiye içine gönderim yapılmaktadır. Yurt dışı
          gönderim talepleriniz için {SELLER.email} adresinden bize
          ulaşabilirsiniz.
        </p>
      </InfoSection>

      <InfoSection title="Teslim Alırken">
        <p>
          Kargoyu teslim alırken paketin dış görünümünü kontrol edin.
          Ezilme, yırtılma ya da ıslanma varsa kargo görevlisine tutanak
          tutturun ve paketi açtırarak içeriği kontrol edin.
        </p>
        <p>
          Tutanaksız teslim alınan hasarlı gönderilerde süreç uzayabilir;
          yine de {SELLER.email} adresine fotoğraflarla bildirin,
          çözüm üretmeye çalışırız.
        </p>
      </InfoSection>

      <InfoSection title="Adres Değişikliği">
        <p>
          Sipariş kargoya verilmeden önce {SELLER.email} adresine
          yazarak adres değişikliği talep edebilirsiniz. Kargoya
          verildikten sonra adres değişikliği kargo firmasının
          inisiyatifindedir.
        </p>
      </InfoSection>

      <InfoSection title="Teslim Edilemeyen Gönderiler">
        <p>
          Adreste bulunamama nedeniyle iade edilen gönderilerde, kargo
          firmasının tahsil ettiği iade masrafı sipariş tutarından
          düşülerek kalan tutar iade edilir.
        </p>
        <p>
          Bu durumu önlemek için sipariş sırasında ulaşılabilir bir telefon
          numarası bırakmanızı öneririz.
        </p>
      </InfoSection>

      <InfoSection title="İade">
        <p>
          Teslim aldığınız ürünü iade etmek isterseniz{" "}
          <Link href="/iptal-iade">İptal ve İade</Link> sayfasındaki
          adımları izleyebilirsiniz. Cayma hakkı süresi{" "}
          {SELLER.withdrawalDays} gündür.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
