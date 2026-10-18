import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info-page";
import { getSeller } from "@/lib/seller-source";
import { SaticiBilinmiyor } from "@/components/satici-bilinmiyor";
import { konagiAyarla } from "@/lib/konak";

export const metadata: Metadata = {
  title: "Hesap ve Veri Silme",
  description:
    "Hesabınızın ve kişisel verilerinizin silinmesini nasıl talep edeceğiniz, talebin nasıl sonuçlandırıldığı ve hangi kayıtların yasal olarak saklandığı.",
  alternates: { canonical: "/veri-silme" },
};

/**
 * Hesap ve veri silme talimatları.
 *
 * NEDEN AYRI BİR SAYFA: KVKK aydınlatma metninde silme hakkı
 * geçiyordu ama BAŞVURUNUN NASIL YAPILACAĞI hiçbir yerde
 * yazmıyordu — hak tanınıp yolu gösterilmemiş oluyordu.
 *
 * Ayrıca sosyal giriş sağlayıcıları (Meta, Google) uygulamayı
 * yayına almak için "kullanıcı verisi silme" adresi istiyor ve
 * bunu denetliyorlar; gösterilecek somut bir sayfa gerekiyordu.
 *
 * İletişim bilgileri SATICI KAYDINDAN geliyor: sayfaya e-posta ya
 * da telefon yazılmıyor, yoksa ikinci bir kiracının sayfasında
 * ArvoCulture'ın adresi görünürdü (AGENTS.md).
 */
export default async function VeriSilmePage({
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
      eyebrow="Yasal"
      title="Hesap ve Veri Silme"
      intro="Hesabınızın ve kişisel verilerinizin silinmesini talep edebilirsiniz. Bu sayfa talebi nasıl ileteceğinizi, ne kadar sürede sonuçlandığını ve hangi kayıtların yasal zorunlulukla saklandığını açıklar."
    >
      <SaticiBilinmiyor seller={SELLER} />

      <InfoSection title="Talebinizi nasıl iletirsiniz">
        <p>
          Silme talebinizi, hesabınızda kayıtlı e-posta adresinden
          aşağıdaki kanallardan birine iletmeniz yeterlidir. Talebin
          hesap sahibinden geldiğini doğrulayabilmemiz için kayıtlı
          e-posta adresinizi kullanmanızı rica ederiz.
        </p>
        <ul>
          {SELLER.email && (
            <li>
              <strong>E-posta:</strong>{" "}
              <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a>
            </li>
          )}
          {SELLER.phone && SELLER.phoneLink && (
            <li>
              <strong>Telefon / WhatsApp:</strong>{" "}
              <a href={SELLER.phoneLink} rel="noopener">
                {SELLER.phone}
              </a>
            </li>
          )}
          <li>
            <strong>İletişim formu:</strong>{" "}
            <Link href="/iletisim">iletişim sayfası</Link>
          </li>
        </ul>
        <p>
          Talebinizde “hesabımın ve kişisel verilerimin silinmesini
          talep ediyorum” ifadesinin bulunması yeterlidir; gerekçe
          belirtmek zorunda değilsiniz.
        </p>
      </InfoSection>

      <InfoSection title="Ne oluyor, ne kadar sürüyor">
        <p>
          Talebiniz en geç otuz gün içinde sonuçlandırılır ve sonucu
          size bildirilir. Hesabınız kapatıldığında şu veriler
          silinir:
        </p>
        <ul>
          <li>hesap kaydınız ve giriş bilgileriniz,</li>
          <li>adres defteriniz,</li>
          <li>favori ürün listeniz,</li>
          <li>
            varsa sosyal hesap bağlantınız (Google, Facebook) ve bu
            bağlantıdan gelen ad ile e-posta bilgisi.
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="Silinmeyen kayıtlar">
        <p>
          Tamamlanmış siparişlere ait fatura ve ödeme kayıtları
          silinemez: vergi ve ticaret mevzuatı bu belgelerin belirli
          süreyle saklanmasını zorunlu kılar. Bu kayıtlar yalnızca
          yasal saklama süresi boyunca, yalnızca bu amaçla tutulur ve
          pazarlama dahil başka hiçbir amaçla kullanılmaz; süre
          dolduğunda silinir.
        </p>
        <p>
          Haklarınızın tamamı için{" "}
          <Link href="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</Link>{" "}
          sayfasına bakabilirsiniz.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
