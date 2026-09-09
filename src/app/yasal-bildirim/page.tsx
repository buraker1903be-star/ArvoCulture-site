import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/info-page";
import { getSeller } from "@/lib/seller-source";

export const metadata: Metadata = {
  title: "Yasal Bildirim",
  description: "Satıcı kimlik ve iletişim bilgileri.",
  alternates: { canonical: "/yasal-bildirim" },
};

/**
 * Yasal Bildirim (künye).
 *
 * Elektronik Ticaretin Düzenlenmesi Hakkında Kanun, hizmet
 * sağlayıcının tanıtıcı bilgilerini sitede güncel olarak
 * bulundurmasını zorunlu kılar.
 */
/*
  Satıcı bilgileri veritabanından okunuyor: her mağaza
  kendi unvanı ve adresiyle görünmeli. Sabit dosya
  ArvoCulture'a özeldi.
*/
export default async function LegalNoticePage() {
  const SELLER = await getSeller();

  return (
    <InfoPage
      eyebrow="Yasal"
      title="Yasal Bildirim"
      intro="Elektronik Ticaretin Düzenlenmesi Hakkında Kanun uyarınca hizmet sağlayıcı bilgileri."
    >
      <InfoSection title="Hizmet Sağlayıcı">
        <p>
          <strong>Ticaret Unvanı:</strong> {SELLER.legalName}
          <br />
          <strong>Marka:</strong> {SELLER.brand}
          <br />
          <strong>Adres:</strong> {SELLER.address}
        </p>
      </InfoSection>

      <InfoSection title="Tescil Bilgileri">
        <p>
          <strong>MERSİS No:</strong> {SELLER.mersis}
          <br />
          <strong>Ticaret Sicil No:</strong> {SELLER.tradeRegistry}
          <br />
          <strong>Vergi Dairesi:</strong> {SELLER.taxOffice}
          <br />
          <strong>Vergi No:</strong> {SELLER.taxNumber}
        </p>
        <p>
          İşletmemiz ETBİS (Elektronik Ticaret Bilgi Sistemi)&apos;ne
          kayıtlıdır.
        </p>
      </InfoSection>

      <InfoSection title="İletişim">
        <p>
          <strong>E-posta:</strong>{" "}
          <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a>
          <br />
          <strong>Telefon / WhatsApp:</strong>{" "}
          <a href={SELLER.phoneLink} rel="noopener">
            {SELLER.phone}
          </a>
          <br />
          <strong>İnternet Sitesi:</strong> {SELLER.website}
        </p>
      </InfoSection>

      <InfoSection title="Fikri Mülkiyet">
        <p>
          Sitede yer alan marka, logo, tasarım, metin ve görseller{" "}
          {SELLER.legalName}&apos;ne veya ilgili hak sahiplerine aittir.
          İzinsiz kopyalanması, çoğaltılması veya kullanılması hukuka
          aykırıdır.
        </p>
        <p>
          ArvoCulture, LR Health &amp; Beauty bağımsız iş ortağıdır. LR
          markası ve ürün adları ilgili hak sahibine aittir.
        </p>
      </InfoSection>

      <InfoSection title="Sorumluluk">
        <p>
          Sitedeki ürün açıklamaları ve görseller özenle hazırlanır; yine
          de baskı ve sistem kaynaklı hatalar olabilir. Bu tür bir hata
          fark edildiğinde düzeltme hakkımız saklıdır.
        </p>
        <p>
          Ürünlerin kullanımına ilişkin bilgiler genel niteliktedir ve
          tıbbi tavsiye yerine geçmez. Sağlık sorunlarınız için hekiminize
          danışınız.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
