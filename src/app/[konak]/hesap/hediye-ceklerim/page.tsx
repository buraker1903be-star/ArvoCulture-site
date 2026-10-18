import type { Metadata } from "next";
import { HesapYanMenu } from "@/components/hesap-yan-menu";
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
      <div className="hesap-duzen">
        <HesapYanMenu />
        <div className="hesap-icerik">
          <section className="panel about-hero detail-hero">
            <p className="about-eyebrow">Hediye çeklerim</p>
            <h1>Bakiyeniz burada.</h1>
            <p className="about-lede">
              Hesabınıza tanımlı hediye çekleri ve kalan tutarları.
            </p>
          </section>

          <HediyeCekleri
            supabaseUrl={env.supabaseUrl}
            supabaseKey={env.supabaseKey}
          />

        </div>
      </div>
    </main>
  );
}
