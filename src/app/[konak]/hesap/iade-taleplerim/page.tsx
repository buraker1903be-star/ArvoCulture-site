import type { Metadata } from "next";
import { IadeTalepleri } from "@/components/iade-talepleri";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "İade taleplerim",
  description: "Açtığınız iade talepleri ve durumları.",
  alternates: { canonical: "/hesap/iade-taleplerim" },
  robots: { index: false, follow: true },
};

/* Talepler müşteriye bağlı; rota saklanmamalı. */
export const dynamic = "force-dynamic";

export default function IadeTaleplerim() {
  return (
    <section className="panel">
      <div className="head">
        <div>
          <h1>İade taleplerim</h1>
          <p>Açtığınız talepler ve hangi aşamada oldukları.</p>
        </div>
      </div>

      <IadeTalepleri
        supabaseUrl={env.supabaseUrl}
        supabaseKey={env.supabaseKey}
      />
    </section>
  );
}
