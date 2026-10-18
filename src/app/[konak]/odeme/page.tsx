import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { env } from "@/lib/env";
import { getSellerBank } from "@/lib/seller-source";
import { konagiAyarla } from "@/lib/konak";

/*
  BU SAYFA DİNAMİK KALMALI.

  `[konak]` düzenine `generateStaticParams` eklenince altındaki her
  sayfa istendiğinde üretilip SAKLANIR hâle geldi. Burada bu yanlış:
  sayfa önbelleksiz okuma yapıyor (havale hesabı / arama sonucu) ve
  Next saklanacak bir sayfanın içinde `revalidate: 0` bir fetch
  görünce "page changed from static to dynamic at runtime" ile
  patlıyor — canlıda 500 demek.

  Bu dört sayfa zaten taşınmadan önce de dinamikti; burada yapılan
  tek şey o davranışı açıkça yazmak.
*/
export const dynamic = "force-dynamic";

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
export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ konak: string }>;
}) {
  /* Adres yoldan geliyor; her sayfa onu veri katmanına kendisi
     bırakıyor — düzen ile sayfa AYNI ANDA çiziliyor, sıraya
     güvenilemiyor (lib/konak). */
  konagiAyarla((await params).konak);

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
