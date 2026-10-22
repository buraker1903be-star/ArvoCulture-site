import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info-page";
import { getSeller } from "@/lib/seller-source";
import { konagiAyarla } from "@/lib/konak";

export const metadata: Metadata = {
  title: "Teslimat Politikası",
  description: "Kargo süreleri, ücretler ve teslimat koşulları.",
  alternates: { canonical: "/teslimat" },
};

/*
  Satıcı bilgileri veritabanından okunuyor: her mağaza
  kendi unvanı ve adresiyle görünmeli. Sabit dosya
  ArvoCulture’a özeldi.
*/
export default async function DeliveryPage({
  params,
}: {
  params: Promise<{ konak: string }>;
}) {
  /* Adres yoldan geliyor; her sayfa onu veri katmanına kendisi
     bırakıyor — düzen ile sayfa AYNI ANDA çiziliyor, sıraya
     güvenilemiyor (lib/konak). */
  konagiAyarla((await params).konak);

  const SELLER = await getSeller();

  return (
    <InfoPage
      eyebrow="Müşteri Hizmetleri"
      title="Teslimat"
      intro="Siparişinizin hazırlanmasından kapınıza ulaşmasına kadar geçen süreç."
    >
      <InfoSection title="Kargo Ücreti">
        <p>
          {SELLER.shippingAlwaysFree ? (
            "Kargo ücreti tarafımızca karşılanır."
          ) : (
            <>
              Kargo ücreti {SELLER.shippingFee}’dir.{" "}
              {SELLER.freeShippingThreshold} ve üzeri siparişlerde kargo
              ücreti tarafımızca karşılanır.
            </>
          )}
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
        {/*
          ÖNCEDEN "yalnızca Türkiye içine gönderim yapılmaktadır"
          yazıyordu ve yurtdışı satışı açıldıktan sonra bu YANLIŞ
          oldu: İngilizce ana sayfa "ships worldwide" derken Türkçe
          sayfa gönderim yapılmadığını söylüyordu. İki sayfa
          çelişince hangisinin doğru olduğu müşteriye kalıyor.
        */}
        <p>
          Türkiye içine gönderim yapılmaktadır. Yurt dışı siparişleri
          de kabul edilmektedir; ülkenize göre kargo ücreti ödeme
          adımında hesaplanır. Ayrıntılar için{" "}
          <Link href="/en/teslimat">İngilizce teslimat sayfasına</Link>{" "}
          bakabilir ya da {SELLER.email} adresinden bize
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
