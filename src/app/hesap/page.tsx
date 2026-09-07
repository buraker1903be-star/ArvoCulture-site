import type { Metadata } from "next";
import Link from "next/link";
import { AccountPanel } from "@/components/account-panel";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Hesabım",
  description:
    "ArvoCulture sipariş takibi ve hesap işlemleri. Üye olmadan da sipariş verebilir, siparişinizi numarasıyla takip edebilirsiniz.",
  alternates: { canonical: "/hesap" },
  robots: { index: false, follow: true },
};

/**
 * Hesap sayfası.
 *
 * Solda misafir sipariş takibi, sağda hesap paneli. Üyelik
 * zorunlu değil: misafir alışveriş açık kalır, hesap yalnızca
 * sipariş geçmişi ve hızlı ödeme için bir kolaylıktır.
 */

const WHATSAPP_LINK = "https://wa.me/905074370507";

export default function Account() {
  return (
    <main className="shell">
      <section className="panel about-hero">
        <p className="about-eyebrow">Hesabım</p>
        <h1>Hesabım</h1>
        <p className="about-lede">
          Siparişleriniz, adres defteriniz ve hesap bilgileriniz tek yerde.
          Üyelik zorunlu değil; misafir olarak da alışveriş yapabilirsiniz.
        </p>
      </section>

      {/* Bağlantı bilgileri sunucudan aktarılır; NEXT_PUBLIC_
          değişkenine bağımlılık yok. */}
      <AccountPanel
        supabaseUrl={env.supabaseUrl}
        supabaseKey={env.supabaseKey}
      />

      <section className="panel panel-tight help">
        <strong>Başka bir konuda yardım mı lazım?</strong>
        <ul>
          <li>
            <Link href="/teslimat">Teslimat</Link>
          </li>
          <li>
            <Link href="/iptal-iade">İade</Link>
          </li>
          <li>
            <Link href="/sss">Sıkça sorulanlar</Link>
          </li>
          <li>
            <Link href="/iletisim">İletişim</Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
