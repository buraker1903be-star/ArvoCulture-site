import type { Metadata } from "next";
import Link from "next/link";
import { AccountPanel } from "@/components/account-panel";

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
        <h1>Siparişinizi takip edin.</h1>
        <p className="about-lede">
          ArvoCulture&apos;da üye olmadan alışveriş yapabilirsiniz. Siparişiniz
          e-posta adresinize gönderilen numarayla takip edilir.
        </p>
      </section>

      <div className="account-grid">
        {/* Bugün çalışan yol: sipariş numarasıyla takip. */}
        <section className="panel account-track">
          <div className="head">
            <div>
              <h2>Sipariş takibi</h2>
              <p>Sipariş numaranız e-posta ile gönderildi.</p>
            </div>
          </div>

          <ol className="track-steps">
            <li>
              <span>1</span>
              <div>
                <strong>Sipariş numaranızı bulun</strong>
                <small>Onay e-postanızda AC ile başlayan numara</small>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <strong>Bize yazın</strong>
                <small>WhatsApp ya da e-posta, ikisi de olur</small>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <strong>Durumunu öğrenin</strong>
                <small>Hazırlık, kargo ve teslimat bilgisi</small>
              </div>
            </li>
          </ol>

          <div className="account-actions">
            <a className="btn" href={WHATSAPP_LINK} rel="noopener">
              WhatsApp&apos;tan sor
            </a>
            <a href="mailto:info@arvoculture.com?subject=Sipari%C5%9F%20takibi">
              E-posta gönder
            </a>
          </div>
        </section>

        <AccountPanel />
      </div>

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
