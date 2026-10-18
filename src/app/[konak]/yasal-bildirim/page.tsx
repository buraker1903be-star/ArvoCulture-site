import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/info-page";
import { getSeller } from "@/lib/seller-source";
import { SaticiBilinmiyor } from "@/components/satici-bilinmiyor";
import { konagiAyarla } from "@/lib/konak";

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
  ArvoCulture’a özeldi.
*/
export default async function LegalNoticePage({
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
      title="Yasal Bildirim"
      intro="Elektronik Ticaretin Düzenlenmesi Hakkında Kanun uyarınca hizmet sağlayıcı bilgileri."
    >
      <SaticiBilinmiyor seller={SELLER} />
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
          İşletmemiz ETBİS (Elektronik Ticaret Bilgi Sistemi)’ne
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

      <InfoSection title="ETBİS Kaydı">
        <p>
          Mağazamız Elektronik Ticaret Bilgi Sistemi’ne (ETBİS)
          kayıtlıdır. Kayıt doğrulaması için sitenin alt kısmındaki ETBİS
          bandını kullanabilirsiniz.
        </p>
      </InfoSection>

      <InfoSection title="Şikâyet Mercileri">
        <p>
          Tüketici uyuşmazlıklarında, parasal sınırlar dâhilinde
          bulunduğunuz yerdeki İl veya İlçe Tüketici Hakem Heyeti’ne,
          sınırın üzerindeki uyuşmazlıklarda Tüketici Mahkemeleri’ne
          başvurabilirsiniz.
        </p>
        <p>
          Elektronik ticarete ilişkin şikâyetlerinizi Ticaret
          Bakanlığı’na iletebilirsiniz.
        </p>
        <p>
          Bize doğrudan ulaşmak isterseniz {SELLER.email} adresini
          kullanabilirsiniz; başvurularınız en geç on beş gün içinde
          yanıtlanır.
        </p>
      </InfoSection>

      <InfoSection title="Fikri Mülkiyet">
        <p>
          Sitede yer alan marka, logo, tasarım, metin ve görseller{" "}
          {SELLER.legalName}’ne veya ilgili hak sahiplerine aittir.
          İzinsiz kopyalanması, çoğaltılması veya kullanılması hukuka
          aykırıdır.
        </p>
        {/*
          Üçüncü taraf marka atfı HER MAĞAZA için doğru, o yüzden
          kodda kalıyor. Mağazaya özel beyan (örneğin bir
          dağıtıcılık ilişkisinin bildirimi) ayarından geliyor;
          yoksa hiç basılmıyor. Önceden burada "ArvoCulture, LR
          Health & Beauty bağımsız iş ortağıdır" cümlesi sabitti ve
          ikinci bir kiracı olmayan bir ticari ilişkiyi beyan etmiş
          oluyordu.
        */}
        <p>
          Sitede adı geçen üçüncü taraf marka ve ürün adları ilgili hak
          sahiplerine aittir.
        </p>
        {SELLER.legalDisclosure && <p>{SELLER.legalDisclosure}</p>}
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
