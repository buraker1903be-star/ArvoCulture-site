import { SiparisHata } from "@/components/siparis-hata";
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
  title: "Payment could not be completed",
  robots: { index: false, follow: false },
};

export default async function OrderFailedEn({
  params,
  searchParams,
}: {
  params: Promise<{ konak: string }>;
  searchParams: Promise<{ no?: string }>;
}) {
  /* Adres yoldan geliyor; her sayfa onu veri katmanına kendisi
     bırakıyor — düzen ile sayfa AYNI ANDA çiziliyor, sıraya
     güvenilemiyor (lib/konak). */
  konagiAyarla((await params).konak);

  const { no } = await searchParams;

  return <SiparisHata no={no} />;
}
