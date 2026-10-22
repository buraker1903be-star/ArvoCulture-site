import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info-page";
import { getSeller } from "@/lib/seller-source";
import { getSalesRules } from "@/lib/store-settings";
import { konagiAyarla } from "@/lib/konak";
import { SaticiBilinmiyor } from "@/components/satici-bilinmiyor";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach us about an international order.",
  alternates: { canonical: "/en/iletisim" },
};

/*
  İNGİLİZCE İLETİŞİM SAYFASI.

  Türkçesi kiracının kendi metnini `arc_store_pages`'ten okuyor; o
  metin Türkçe ve İNGİLİZCE KARŞILIĞI YOK. Burada kiracı metni
  BİLEREK çizilmiyor: Türkçe bir paragrafı İngilizce sayfaya koymak,
  çevirinin yarıda kaldığını göstermekten başka bir şey yapmazdı.

  Çizilen şey VERİ: satıcı kaydındaki telefon, e-posta ve unvan.
  Kodda yedeği yok — okunamazsa sayfa eksik olduğunu SÖYLÜYOR
  (components/satici-bilinmiyor). Bu deponun değişmezi: yanlış bilgi
  göstermek, hiç göstermemekten kötüdür.
*/
export const dynamic = "force-dynamic";

export default async function ContactPageEn({
  params,
}: {
  params: Promise<{ konak: string }>;
}) {
  konagiAyarla((await params).konak);

  const [SELLER, rules] = await Promise.all([getSeller(), getSalesRules()]);
  if (!rules.internationalEnabled) notFound();

  const ulasilabilir = Boolean(SELLER.email || SELLER.phone);

  return (
    <InfoPage
      eyebrow="Customer service"
      title="Contact"
      intro="Write with your order number and we can answer in one reply."
    >
      {!ulasilabilir && <SaticiBilinmiyor seller={SELLER} />}

      <InfoSection title="How to reach us">
        <p>
          {/* SİPARİŞ NUMARASI İSTENİYOR: numarasız bir mesaj, hangi
              siparişin sorulduğunu bulmak için ikinci bir tura yol
              açıyor ve yurtdışında saat farkıyla bu bir gün demek. */}
          We answer in English. Please include your order number — without
          it we have to write back and ask, and across time zones that
          costs a day.
        </p>
        <ul>
          {SELLER.email && (
            <li>
              E-mail: <a href={`mailto:${SELLER.email}`}>{SELLER.email}</a>
            </li>
          )}
          {SELLER.phone && SELLER.phoneLink && (
            <li>
              WhatsApp:{" "}
              <a
                href={SELLER.phoneLink}
                {...(SELLER.phoneLink.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {SELLER.phone}
              </a>
            </li>
          )}
        </ul>
      </InfoSection>

      <InfoSection title="Before you write">
        <p>
          Shipping fees, delivery times and customs are explained on the{" "}
          <Link href="/en/teslimat">Delivery</Link> page. Returns, refunds
          and who pays return postage are on the{" "}
          <Link href="/en/iptal-iade">Cancellation &amp; returns</Link>{" "}
          page. Most questions are answered there in more detail than we
          could fit in a reply.
        </p>
      </InfoSection>

      {SELLER.legalName && (
        <InfoSection title="Company">
          <p>
            {SELLER.legalName}
            {SELLER.address && (
              <>
                <br />
                {SELLER.address}
              </>
            )}
          </p>
          <p>
            We are based in Türkiye and ship from there. Contract documents
            are governed by Turkish law and are published in Turkish; they
            are linked in the footer.
          </p>
        </InfoSection>
      )}
    </InfoPage>
  );
}
