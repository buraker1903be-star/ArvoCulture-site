import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info-page";
import { getSeller } from "@/lib/seller-source";

export const metadata: Metadata = {
  title: "Ön Bilgilendirme Formu",
  description:
    "Mesafeli Sözleşmeler Yönetmeliği uyarınca sipariş öncesi bilgilendirme.",
  alternates: { canonical: "/on-bilgilendirme-formu" },
};

/**
 * Ön Bilgilendirme Formu.
 *
 * Yönetmelik, sözleşme kurulmadan ÖNCE tüketiciye belirli
 * bilgilerin verilmesini zorunlu kılar. Bu sayfa o bilgileri
 * içerir ve ödeme adımında onaylanır.
 */
/*
  Satıcı bilgileri veritabanından okunuyor: her mağaza
  kendi unvanı ve adresiyle görünmeli. Sabit dosya
  ArvoCulture’a özeldi.
*/
export default async function PreInfoPage() {
  const SELLER = await getSeller();

  return (
    <InfoPage
      eyebrow="Yasal"
      title="Ön Bilgilendirme Formu"
      intro="Mesafeli Sözleşmeler Yönetmeliği uyarınca, siparişinizi tamamlamadan önce bilmeniz gerekenler."
    >
      <InfoSection title="Satıcı Bilgileri">
        <p>
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
      </InfoSection>

      <InfoSection title="Ürün ve Fiyat Bilgileri">
        <p>
          Sipariş ettiğiniz ürünün temel nitelikleri, adedi, birim ve
          toplam fiyatı sipariş özeti ekranında gösterilir. Tüm fiyatlar
          Türk Lirası cinsinden ve KDV dâhildir.
        </p>
        <p>
          Kargo ücreti {SELLER.shippingFee}’dir.{" "}
          {SELLER.freeShippingThreshold} ve üzeri siparişlerde kargo
          ücretsizdir. Toplam tutar, ödeme adımında kargo ücreti ve varsa
          indirim düşülerek gösterilir.
        </p>
      </InfoSection>

      <InfoSection title="Ödeme">
        <p>
          Ödemeler PayTR altyapısı üzerinden 3D Secure ile alınır. Kredi
          kartı, banka kartı ve ilgili kartların desteklediği taksit
          seçenekleri kullanılabilir.
        </p>
        <p>
          Kart bilgileriniz Satıcı’ya iletilmez ve Satıcı
          sunucularında saklanmaz.
        </p>
      </InfoSection>

      <InfoSection title="Teslimat">
        <p>
          Siparişiniz, ödemenizin onaylanmasının ardından hazırlanır ve
          anlaşmalı kargo firmasıyla bildirdiğiniz adrese gönderilir.
          Teslimat süresi yasal azami {SELLER.deliveryDaysMax} günü
          geçmez.
        </p>
        <p>
          Teslimat masrafı, aksi belirtilmedikçe Alıcı’ya aittir.
          Kargo teslim alınırken paketin hasarlı olup olmadığı kontrol
          edilmeli, hasar varsa tutanak tutturulmalıdır.
        </p>
      </InfoSection>

      <InfoSection title="Cayma Hakkı">
        <p>
          Teslim tarihinden itibaren {SELLER.withdrawalDays} gün içinde
          gerekçe göstermeksizin cayma hakkınız vardır. Cayma bildirimini{" "}
          {SELLER.email} adresine iletebilirsiniz.
        </p>
        <p>
          Ambalajı açılmış kozmetik, kişisel bakım ve gıda takviyesi
          ürünleri hijyen gerekçesiyle cayma hakkı kapsamı dışındadır.
          Ayrıntılar için{" "}
          <Link href="/iptal-iade">İptal ve İade</Link> sayfasına bakınız.
        </p>
      </InfoSection>

      <InfoSection title="Cayma Hakkının Kullanılamayacağı Hâller">
        <p>
          Mesafeli Sözleşmeler Yönetmeliği’nin 15. maddesi uyarınca
          bazı ürünlerde cayma hakkı kullanılamaz. Katalogumuzda bu
          kapsama girenler:
        </p>
        <ul>
          <li>
            Ambalajı, bandı veya mührü açılmış kozmetik ve kişisel bakım
            ürünleri
          </li>
          <li>İç giyim, mayo, çorap gibi hijyenik ürünler</li>
          <li>Gıda takviyeleri</li>
          <li>Kişiye özel hazırlanan ürünler</li>
        </ul>
        <p>
          Tam liste{" "}
          <Link href="/mesafeli-satis-sozlesmesi">
            Mesafeli Satış Sözleşmesi
          </Link>{" "}
          sayfasındadır.
        </p>
      </InfoSection>

      <InfoSection title="Sözleşmenin Saklanması">
        <p>
          Bu form ve Mesafeli Satış Sözleşmesi, siparişiniz onaylandıktan
          sonra e-posta adresinize gönderilir. Hesabınızdaki sipariş
          detayından da görüntüleyebilirsiniz.
        </p>
      </InfoSection>

      <InfoSection title="Şikâyet ve İtiraz">
        <p>
          Uyuşmazlık hâlinde, parasal sınırlar dâhilinde yerleşim
          yerinizdeki Tüketici Hakem Heyetine veya Tüketici Mahkemesine
          başvurabilirsiniz.
        </p>
        <p>
          Ticaret Bakanlığı’nın{" "}
          <a href="https://tuketicisikayeti.ticaret.gov.tr" rel="noopener">
            Tüketici Bilgi Sistemi
          </a>{" "}
          üzerinden de başvuru yapabilirsiniz.
        </p>
      </InfoSection>

      <InfoSection title="Onay">
        <p>
          Siparişinizi tamamladığınızda bu formu ve{" "}
          <Link href="/mesafeli-satis-sozlesmesi">
            Mesafeli Satış Sözleşmesi
          </Link>
          ’ni okuduğunuzu ve kabul ettiğinizi beyan etmiş olursunuz.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
