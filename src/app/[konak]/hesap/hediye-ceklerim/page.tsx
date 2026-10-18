import type { Metadata } from "next";
import { HediyeCekleri } from "@/components/hediye-cekleri";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Hediye çeklerim",
  description: "Hesabınıza tanımlı hediye çekleri ve bakiyeleri.",
  alternates: { canonical: "/hesap/hediye-ceklerim" },
  robots: { index: false, follow: true },
};

/* Çekler müşteriye bağlı ve oturum yalnızca tarayıcıda; rota
   saklanmamalı. */
export const dynamic = "force-dynamic";

export default function HediyeCeklerim() {
  return (
    <section className="panel">
      <div className="head">
        <div>
          <h1>Hediye çeklerim</h1>
          <p>Hesabınıza tanımlı çekler ve kalan tutarları.</p>
        </div>
      </div>

      <HediyeCekleri
        supabaseUrl={env.supabaseUrl}
        supabaseKey={env.supabaseKey}
      />
    </section>
  );
}
