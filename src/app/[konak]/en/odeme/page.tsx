import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { env } from "@/lib/env";
import { getSellerBank } from "@/lib/seller-source";
import { getShippingZones } from "@/lib/kargo-bolgeleri";
import { konagiAyarla } from "@/lib/konak";

/*
  İNGİLİZCE ÖDEME — GÖVDE AYNI BİLEŞEN, TÜRKÇESİYLE AYNI VERİ.

  `CheckoutForm` kopyalanmadı ve bu en çok burada önemli: tutarı,
  kargoyu ve havale indirimini hesaplayan yer burası. İki kopya,
  müşterinin gördüğü tutarla tahsil edilenin ayrılması demek olurdu.

  Havale hesabı ve bölge tarifesi SUNUCUDAN geliyor, Türkçesindeki
  gerekçelerle aynen: hesap bilgisi okunamazsa havale seçeneği hiç
  gösterilmiyor (yanlış IBAN, IBAN göstermemekten kötü) ve tarife
  okunamazsa ülke seçeneği açılmıyor (uydurma kargo ücreti,
  ödemede başka tutar demek).

  `force-dynamic`: sayfa önbelleksiz okuma yapıyor ve `[konak]`
  düzeninde saklanmaya çalışılırsa "page changed from static to
  dynamic at runtime" ile 500 veriyor.
*/
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPageEn({
  params,
}: {
  params: Promise<{ konak: string }>;
}) {
  konagiAyarla((await params).konak);

  const [havale, bolgeler] = await Promise.all([
    getSellerBank(),
    getShippingZones(),
  ]);

  return (
    <CheckoutForm
      supabaseUrl={env.supabaseUrl}
      supabaseKey={env.supabaseKey}
      havale={havale}
      bolgeler={bolgeler}
    />
  );
}
