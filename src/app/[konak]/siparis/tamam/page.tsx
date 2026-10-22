import { SiparisTamam } from "@/components/siparis-tamam";
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

export const metadata = {
  title: "Siparişiniz alındı",
  robots: { index: false, follow: false },
};

/**
 * PayTR başarılı ödeme sonrası buraya yönlendirir.
 *
 * Dikkat: bu sayfanın görünmesi ödemenin kesinleştiği anlamına
 * gelmez. Siparişi "ödendi" yapan tek şey PayTR’ın ArvoARC’a
 * gönderdiği sunucudan sunucuya bildirimdir. Bu yüzden burada
 * "ödemeniz alındı" değil, "siparişiniz alındı" denir.
 */
export default async function OrderDone({
  params,
  searchParams,
}: {
  params: Promise<{ konak: string }>;
  searchParams: Promise<{ no?: string; yontem?: string }>;
}) {
  /* Adres yoldan geliyor; her sayfa onu veri katmanına kendisi
     bırakıyor — düzen ile sayfa AYNI ANDA çiziliyor, sıraya
     güvenilemiyor (lib/konak). */
  konagiAyarla((await params).konak);

  const { no, yontem } = await searchParams;

  /*
    Havale bilgisi satıcı kaydından. Önceden `lib/seller.ts`
    sabitinden geliyordu ve ortak dağıtımda her kiracının onay
    sayfası ArvoCulture'ın IBAN'ını gösterirdi.
  */
  const havale = await getSellerBank();

  return <SiparisTamam no={no} yontem={yontem} havale={havale} />;
}
