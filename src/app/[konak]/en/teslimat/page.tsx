import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, InfoSection } from "@/components/info-page";
import { getSeller } from "@/lib/seller-source";
import { getShippingZones } from "@/lib/kargo-bolgeleri";
import { getSalesRules } from "@/lib/store-settings";
import { konagiAyarla } from "@/lib/konak";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Delivery",
  description: "Shipping zones, fees and delivery terms for international orders.",
  alternates: { canonical: "/en/teslimat" },
};

/*
  İNGİLİZCE TESLİMAT SAYFASI — TÜRKÇESİNİN ÇEVİRİSİ DEĞİL.

  Türkçe sayfa YURT İÇİ gönderimi anlatıyor: tek kargo ücreti, tek
  eşik, "yalnızca Türkiye içine gönderim". Yurtdışı müşterisinin
  soruları başka — hangi ülkeye gidiyor, kaça gidiyor, ağırlık ücreti
  nasıl işliyor, para hangi birimden tahsil ediliyor.

  RAKAM YAZILMIYOR, OKUNUYOR. Bölge tarifesi ArvoARC'tan geliyor
  (`arc_storefront_shipping_zones`); sayfaya "22 $" yazmak, panelden
  tarife değişince sayfanın yalan söylemesi olurdu. Bu deponun
  değişmezi: sayfaya "120 TL" yazılmaz.

  `force-dynamic`: mod kapalıyken sayfa 404 veriyor ve bu karar
  AYARA bağlı. Statik üretilse 404 sayfaya GÖMÜLÜRDÜ ve mod
  açıldığında `revalidate` onu kurtarmıyor — 18.10.2026'da /en'de
  tam bu yaşandı.
*/
export const dynamic = "force-dynamic";

export default async function DeliveryPageEn({
  params,
}: {
  params: Promise<{ konak: string }>;
}) {
  konagiAyarla((await params).konak);

  const [SELLER, bolgeler, rules] = await Promise.all([
    getSeller(),
    getShippingZones(),
    getSalesRules(),
  ]);

  if (!rules.internationalEnabled) notFound();

  const dolar = (sent: number) => `$${(sent / 100).toFixed(2)}`;

  return (
    <InfoPage
      eyebrow="Customer service"
      title="Delivery"
      intro="How your order is prepared, what shipping costs and when it arrives."
    >
      <InfoSection title="Where we ship">
        <p>
          We ship worldwide. Your country decides which zone your order
          falls into, and the zone sets the starting fee. Heavier orders
          cost more: above a weight included in that starting fee, each
          further kilo is added.
        </p>
        <p>
          {/*
            TEK RAKAM VERİLMİYOR ve bu bilinçli: ücret ülkeye VE
            sepetin ağırlığına bağlı. Sayfaya tek bir tutar yazmak,
            ödemede başka tutar görmek demekti — bu depoda bir kez
            yaşandı (17.09.2026).
          */}
          The exact amount is calculated at checkout from your country and
          the weight of your basket. Nothing is estimated and nothing is
          added afterwards.
        </p>
        {bolgeler.length > 0 && (
          <ul>
            {bolgeler.map((bolge) => (
              <li key={bolge.label}>
                <strong>{bolge.label}</strong>: from {dolar(bolge.fee_cents)}
                {bolge.free_over_cents > 0 && (
                  <>
                    , free over {dolar(bolge.free_over_cents)} of goods
                  </>
                )}
                .
              </li>
            ))}
          </ul>
        )}
        <p>
          A part of the catalogue cannot be sent abroad and is not listed
          on the English pages at all, so you will not reach checkout with
          an item we cannot ship.
        </p>
      </InfoSection>

      <InfoSection title="Prices and currency">
        <p>
          Prices are shown in US dollars, but the payment is taken in
          Turkish lira. Your bank statement will show a ₺ amount and your
          card issuer applies its own conversion to your currency. The
          dollar figure you see is the lira amount at our current rate —
          the two never drift apart.
        </p>
      </InfoSection>

      <InfoSection title="Preparation and dispatch">
        <p>
          Your order is prepared once payment is confirmed. You are
          notified by e-mail when it is handed to the carrier.
        </p>
        <p>
          The maximum legal delivery time is {SELLER.deliveryDaysMax} days.
          If it is not delivered within that time you may cancel the order
          and ask for a refund.
        </p>
      </InfoSection>

      <InfoSection title="Customs and import duties">
        <p>
          Shipments leave from Türkiye. Any customs duty, import VAT or
          handling fee charged by your own country is not included in the
          price and is payable by you. Limits and rates differ from country
          to country; your local customs authority is the only reliable
          source.
        </p>
      </InfoSection>

      <InfoSection title="When the parcel arrives">
        <p>
          Check the outside of the box before you sign. If it is crushed,
          torn or wet, ask the courier to record it and open the parcel in
          front of them.
        </p>
        <p>
          If you accepted a damaged parcel without a record, still write to{" "}
          {SELLER.email} with photographs and we will try to find a
          solution.
        </p>
      </InfoSection>

      <InfoSection title="Address changes and failed deliveries">
        <p>
          Write to {SELLER.email} before the order is handed to the carrier
          and we can change the address. Afterwards it is up to the carrier.
        </p>
        <p>
          If a parcel comes back because nobody could be reached, the
          carrier&rsquo;s return cost is deducted from the refund. Leaving a
          phone number you actually answer prevents this.
        </p>
      </InfoSection>

      <InfoSection title="Returns">
        <p>
          You have {SELLER.withdrawalDays} days to withdraw from the
          purchase. The steps are on the{" "}
          <Link href="/en/iptal-iade">Cancellation &amp; returns</Link> page.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
