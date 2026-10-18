import type { Metadata } from "next";
import { AccountPanel } from "@/components/account-panel";
import { env } from "@/lib/env";
import { konagiAyarla } from "@/lib/konak";

export const metadata: Metadata = {
  title: "Siparişlerim",
  description: "Geçmiş siparişleriniz.",
  alternates: { canonical: "/hesap/siparislerim" },
  robots: { index: false, follow: true },
};

/* Oturumu yalnızca tarayıcı biliyor; rota saklanmamalı. */
export const dynamic = "force-dynamic";

export default async function HesapSiparislerim({
  params,
}: {
  params: Promise<{ konak: string }>;
}) {
  konagiAyarla((await params).konak);

  return (
    <main className="shell">
      <AccountPanel
        supabaseUrl={env.supabaseUrl}
        supabaseKey={env.supabaseKey}
        bolum="siparislerim"
      />
    </main>
  );
}
