import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { env } from "@/lib/env";
import { getSeller } from "@/lib/seller-source";

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
  const seller = await getSeller();

  return (
    <CheckoutForm
      supabaseUrl={env.supabaseUrl}
      supabaseKey={env.supabaseKey}
      seller={{
        legalName: seller.legalName,
        bankName: seller.bankName,
        iban: seller.iban,
        accountHolder: seller.bankAccountHolder,
        transferInstructions: seller.bankTransferInstructions,
      }}
    />
  );
}
