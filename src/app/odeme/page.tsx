import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { env } from "@/lib/env";
import { getSellerBank } from "@/lib/seller-source";

export const metadata: Metadata = {
  title: "Ödeme",
  robots: { index: false, follow: false },
};

/**
 * Ödeme sayfası. Supabase bağlantı bilgileri sunucudan aktarılır;
 * giriş yapmış müşterinin kayıtlı adresleri bu sayede okunur.
 *
 * HAVALE BİLGİSİ DE SUNUCUDAN. Önceden ödeme formu banka adını ve
 * IBAN'ı `lib/seller.ts` sabitinden okuyordu — bir istemci
 * bileşeninin içinde, yani değer tarayıcı paketindeydi. Ortak
 * dağıtımda ikinci bir kiracının müşterisi ArvoCulture'ın IBAN'ını
 * görür ve parayı oraya gönderirdi.
 */
export default async function CheckoutPage() {
  /* Hesap bilgisi yoksa null geliyor ve havale seçeneği hiç
     gösterilmiyor; yanlış hesap göstermektense seçeneği kapatmak. */
  const havale = await getSellerBank();

  return (
    <CheckoutForm
      supabaseUrl={env.supabaseUrl}
      supabaseKey={env.supabaseKey}
      havale={havale}
    />
  );
}
