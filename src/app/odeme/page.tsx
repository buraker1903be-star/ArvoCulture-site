import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Ödeme",
  robots: { index: false, follow: false },
};

/**
 * Ödeme sayfası. Supabase bağlantı bilgileri sunucudan aktarılır;
 * giriş yapmış müşterinin kayıtlı adresleri bu sayede okunur.
 */
export default function CheckoutPage() {
  return (
    <CheckoutForm
      supabaseUrl={env.supabaseUrl}
      supabaseKey={env.supabaseKey}
    />
  );
}
