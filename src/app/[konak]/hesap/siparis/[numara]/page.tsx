import type { Metadata } from "next";
import { OrderDetail } from "@/components/order-detail";
import { env } from "@/lib/env";
import { konagiAyarla } from "@/lib/konak";
import { getSellerBank } from "@/lib/seller-source";

export const metadata: Metadata = {
  title: "Sipariş detayı",
  robots: { index: false, follow: false },
};

/**
 * Sipariş detay sayfası.
 *
 * Oturum tarayıcıda tutulduğu için veri istemcide çekilir.
 * Sunucu yalnızca bağlantı bilgilerini aktarır; siparişi kimin
 * görebileceğine veritabanı karar verir (RPC `auth.uid()`
 * üzerinden çalışır).
 */
export default async function OrderPage({
  params,
}: {
  params: Promise<{ numara: string; konak: string }>;
}) {
  /* Adres yoldan geliyor; her sayfa onu veri katmanına kendisi
     bırakıyor — düzen ile sayfa AYNI ANDA çiziliyor, sıraya
     güvenilemiyor (lib/konak). */
  konagiAyarla((await params).konak);

  const { numara } = await params;

  /*
    HAVALE HESABI SUNUCUDAN.

    Ödenmemiş havale siparişinde müşterinin parayı NEREYE
    göndereceğini söylemek zorundayız; "ödeme bekleniyor" tek
    başına hiçbir şey yaptırmıyor ve müşteri onay e-postasını
    aramaya gidiyordu. Sipariş istemcide çekildiği için hesabı
    orada okuyamayız (anon anahtar, üstelik önbelleksiz okuma
    sunucuya ait); buradan geçiyor ve yalnızca gerekince
    basılıyor.

    Hesap yoksa null geliyor ve havale kutusu hiç çizilmiyor —
    yanlış IBAN göstermektense hiç göstermemek (lib/seller-source).
  */
  const banka = await getSellerBank();

  /*
    <main> YOK: bu sayfa /hesap altında, yani hesap düzeninin
    (layout.tsx) içinde çiziliyor ve `main` orada. İkisi birden
    olunca iç içe iki `main` çıkıyordu — geçersiz HTML ve ekran
    okuyucuda iki "ana içerik".
  */
  return (
    <>
      <OrderDetail
        orderNumber={decodeURIComponent(numara)}
        supabaseUrl={env.supabaseUrl}
        supabaseKey={env.supabaseKey}
        banka={banka}
      />
    </>
  );
}
