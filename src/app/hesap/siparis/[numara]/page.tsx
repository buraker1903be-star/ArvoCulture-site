import type { Metadata } from "next";
import { OrderDetail } from "@/components/order-detail";
import { env } from "@/lib/env";

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
  params: Promise<{ numara: string }>;
}) {
  const { numara } = await params;

  return (
    <main className="shell">
      <OrderDetail
        orderNumber={decodeURIComponent(numara)}
        supabaseUrl={env.supabaseUrl}
        supabaseKey={env.supabaseKey}
      />
    </main>
  );
}
