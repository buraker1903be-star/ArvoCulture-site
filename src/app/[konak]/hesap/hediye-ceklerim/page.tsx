import type { Metadata } from "next";
import { AccountPanel } from "@/components/account-panel";
import { HediyeCekleri } from "@/components/hediye-cekleri";
import { env } from "@/lib/env";
import { konagiAyarla } from "@/lib/konak";

export const metadata: Metadata = {
  title: "Hediye çeklerim",
  description: "Hesabınıza tanımlı hediye çekleri ve bakiyeleri.",
  alternates: { canonical: "/hesap/hediye-ceklerim" },
  robots: { index: false, follow: true },
};

/*
  Çekler müşteriye bağlı ve oturum yalnızca tarayıcıda; sayfa bu
  yüzden kendi verisini sunucuda okumuyor. Rota önbelleğine de
  girmiyor: `force-dynamic` olmadan [konak] düzeninin altındaki her
  sayfa saklanıyor.
*/
export const dynamic = "force-dynamic";

export default async function HediyeCeklerim({
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
        bolum="icerik"
      >
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
      </AccountPanel>
    </main>
  );
}
