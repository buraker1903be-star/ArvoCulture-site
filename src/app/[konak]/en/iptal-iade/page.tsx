import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info-page";
import { getSeller } from "@/lib/seller-source";
import { getSalesRules } from "@/lib/store-settings";
import { konagiAyarla } from "@/lib/konak";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Cancellation & returns",
  description: "Your right to withdraw, return conditions and how a refund is paid.",
  alternates: { canonical: "/en/iptal-iade" },
};

/*
  İNGİLİZCE İADE SAYFASI.

  Türkçesinin birebir çevirisi DEĞİL, çünkü iki yerde ayrılıyor:

  - İade kargosu. Türkçe sayfa "anlaşmalı kargo firmamızla
    gönderirseniz ücret bize ait" diyor; yurtdışında anlaşmalı
    firmamız YOK. Olmayan bir imkânı vaat etmek, iadeyi başlatan
    müşterinin parasını kaybetmesi demek.
  - Gümrük. Yurt içinde yok, yurtdışında iadenin maliyetini
    değiştiren asıl kalem.

  Süreler ve haklar SATICI KAYDINDAN geliyor (cayma süresi, iade
  süresi); sayfaya sayı yazılmıyor.

  `force-dynamic`: 404 kararı AYARA bağlı ve statik üretilse sayfaya
  gömülürdü (18.10.2026'da /en'de yaşandı).
*/
export const dynamic = "force-dynamic";

export default async function ReturnsPageEn({
  params,
}: {
  params: Promise<{ konak: string }>;
}) {
  konagiAyarla((await params).konak);

  const [SELLER, rules] = await Promise.all([getSeller(), getSalesRules()]);
  if (!rules.internationalEnabled) notFound();

  return (
    <InfoPage
      eyebrow="Customer service"
      title="Cancellation & returns"
      intro="How to cancel an order, how to return an item and when the money comes back."
    >
      <InfoSection title="Cancelling before dispatch">
        <p>
          Write to {SELLER.email} with your order number before the order
          is handed to the carrier and we will cancel it. If payment has
          already been taken, it is refunded to the same method within
          fourteen days of the cancellation being confirmed.
        </p>
        <p>
          Once the order has been dispatched, the right of withdrawal
          below applies instead.
        </p>
      </InfoSection>

      <InfoSection title="Right of withdrawal">
        <p>
          You may withdraw from the purchase within{" "}
          <strong>{SELLER.withdrawalDays} days</strong> of receiving the
          item, without giving a reason and without any penalty.
        </p>
        <p>
          Sending the notice to {SELLER.email} within that period is
          enough — the item itself does not have to reach us within it.
        </p>
      </InfoSection>

      <InfoSection title="Condition of returned items">
        <ul>
          <li>Unused and in a resaleable condition</li>
          <li>Original packaging, labels and any accessories complete</li>
          <li>Sent back together with the invoice</li>
        </ul>
        <p>
          Clothing can be returned as long as it is unworn and the labels
          have not been removed.
        </p>
      </InfoSection>

      <InfoSection title="Items that cannot be returned">
        <p>
          Under article 15 of the Turkish Distance Contracts Regulation,
          the right of withdrawal does not apply to:
        </p>
        <ul>
          <li>
            Cosmetics and personal care products whose packaging, tape or
            seal has been opened (for hygiene reasons)
          </li>
          <li>Items made to your personal specification</li>
          <li>Perishable items or items that may pass their use-by date</li>
        </ul>
        <p>
          Unopened cosmetics can be returned. These exceptions follow the
          nature of the item, not the category it is listed under.
        </p>
      </InfoSection>

      <InfoSection title="How a return works">
        <ol>
          <li>Write to {SELLER.email} with your order number and the reason</li>
          <li>We send you a return code and tell you where to send the parcel</li>
          <li>Send the item back with its invoice</li>
          <li>We check the item when it reaches us and approve the return</li>
          <li>
            The amount is refunded to the method you paid with, within
            fourteen days at the latest
          </li>
        </ol>
        <p>
          How long a card refund then takes to appear depends on your bank
          and is outside our control.
        </p>
      </InfoSection>

      <InfoSection title="Who pays the return shipping">
        <p>
          {/*
            YURT İÇİNDEN AYRILAN NOKTA. Türkçe sayfadaki "anlaşmalı
            kargomuzla ücretsiz" imkânı yurtdışında yok; olmayan bir
            imkânı vaat etmek, müşterinin parasını kaybetmesi olurdu.
          */}
          For international orders the return shipping is arranged and
          paid by you. We do not have a contracted carrier outside
          Türkiye, so we cannot send you a prepaid label.
        </p>
        <p>
          If the item is faulty, wrong or incomplete, we pay every
          shipping cost — in both directions.
        </p>
      </InfoSection>

      <InfoSection title="Refunds, customs and duties">
        <p>
          The refund is the amount we charged you, in Turkish lira. Your
          card issuer converts it back to your currency at its own rate on
          the day, so the figure that lands may differ slightly from the
          one that left.
        </p>
        <p>
          Customs duty or import VAT that your own country charged is paid
          to that authority, not to us, so we cannot refund it. Most
          countries let you reclaim it directly once the goods are
          re-exported; your customs authority can tell you how.
        </p>
      </InfoSection>

      <InfoSection title="Faulty or wrong items">
        <p>
          If what arrives is damaged, defective or not what you ordered,
          write to {SELLER.email} with photographs. You can then ask for a
          replacement, a refund or a repair, whichever you prefer.
        </p>
        <p>
          If you notice the outer packaging is damaged while the courier
          is still there, having them record it makes the process much
          faster.
        </p>
      </InfoSection>

      <InfoSection title="Complaints">
        <p>
          If you believe your request has not been met, you may apply to a
          Turkish Consumer Arbitration Committee or Consumer Court within
          the applicable monetary limits, or through the Ministry of
          Trade&rsquo;s{" "}
          <a href="https://tuketicisikayeti.ticaret.gov.tr" rel="noopener">
            consumer information system
          </a>
          .
        </p>
        <p>
          Delivery terms are on the{" "}
          <Link href="/en/teslimat">Delivery</Link> page. The binding
          contract texts are linked in the footer and are in Turkish.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
