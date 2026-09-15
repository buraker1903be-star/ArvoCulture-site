import type { Metadata } from "next";
import Link from "next/link";
import { AccountPanel } from "@/components/account-panel";
import { env } from "@/lib/env";
import { SELLER } from "@/lib/seller";

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

export default function Account() {
  return (
    <main className="shell">
      {/* Künye ile başlık aynı kelimeyi tekrarlıyordu; başlık artık
          karşılıyor. Sepet ve favorilerle aynı kısa başlık boyu. */}
      <section className="panel about-hero detail-hero">
        <p className="about-eyebrow">Hesabım</p>
        <h1>Hoş geldiniz.</h1>
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
          {/* Sipariş sorusu olan müşteri için en hızlı yol. Numara
              tanımlıydı ama listeye hiç eklenmemişti. */}
          <li>
            <a href={SELLER.phoneLink} rel="noopener">
              WhatsApp
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
