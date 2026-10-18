import type { Metadata } from "next";
import { CartPageView } from "@/components/cart-page";
import { konagiAyarla } from "@/lib/konak";

export const metadata: Metadata = {
  title: "Sepetim",
  robots: { index: false, follow: true },
};

export default async function CartPage({
  params,
}: {
  params: Promise<{ konak: string }>;
}) {
  /* Adres yoldan geliyor; her sayfa onu veri katmanına kendisi
     bırakıyor — düzen ile sayfa AYNI ANDA çiziliyor, sıraya
     güvenilemiyor (lib/konak). */
  konagiAyarla((await params).konak);

  return (
    <main className="shell">
      <CartPageView />
    </main>
  );
}
