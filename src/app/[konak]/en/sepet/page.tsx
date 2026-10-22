import type { Metadata } from "next";
import { CartPageView } from "@/components/cart-page";
import { konagiAyarla } from "@/lib/konak";

export const metadata: Metadata = {
  title: "Basket",
  robots: { index: false, follow: true },
};

/*
  İNGİLİZCE SEPET — GÖVDE AYNI BİLEŞEN.

  `CartPageView` kopyalanmadı: sepet tutarı hesaplayan bir yer ve iki
  kopya kaçınılmaz olarak ayrışır. Bu depoda aynı kalıp (vitrin ile
  ArvoARC'ın hesabı) bir kez müşteriye ödemede başka tutar gösterdi
  (17.09.2026).

  AYRI ADRES NEDEN GEREKLİ: bileşenin metinleri dili para birimi
  seçiminden alıyor, ama BAĞLANTILAR adres önekine bakıyor. İngilizce
  gezen müşteri /sepet'e düşseydi, oradan çıkan her bağlantı onu
  Türkçe tarafa götürürdü — akışın ortasında dil değişmesi.

  `force-dynamic`: sepet müşteriye özel; `[konak]` düzeninde
  `generateStaticParams` olduğu için altındaki sayfalar saklanıyor ve
  saklanan bir sepet, BAŞKASININ sepetini göstermek demekti.
*/
export const dynamic = "force-dynamic";

export default async function CartPageEn({
  params,
}: {
  params: Promise<{ konak: string }>;
}) {
  konagiAyarla((await params).konak);

  return (
    <main className="shell" lang="en">
      <CartPageView />
    </main>
  );
}
