import type { Metadata } from "next";
import Link from "next/link";
import { AccountPanel } from "@/components/account-panel";
import { env } from "@/lib/env";
import { getSeller } from "@/lib/seller-source";
import { konagiAyarla } from "@/lib/konak";

export const metadata: Metadata = {
  title: "Hesabım",
  description:
    /* Marka adı çıkarıldı: sayfa indekslenmiyor (robots: index false)
       ve ortak dağıtımda her kiracıya ArvoCulture'ı yazardı. */
    "Sipariş takibi ve hesap işlemleri. Üye olmadan da sipariş verebilir, siparişinizi numarasıyla takip edebilirsiniz.",
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

export default async function Account({
  params,
}: {
  params: Promise<{ konak: string }>;
}) {
  /* Adres yoldan geliyor; her sayfa onu veri katmanına kendisi
     bırakıyor — düzen ile sayfa AYNI ANDA çiziliyor, sıraya
     güvenilemiyor (lib/konak). */
  konagiAyarla((await params).konak);

  const { phoneLink: whatsapp } = await getSeller();

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
              tanımlıydı ama listeye hiç eklenmemişti. Bağlantı satıcı
              kaydından: önceden ArvoCulture'ın hattı koda yazılıydı ve
              hattı olmayan mağazada çalışmayan bir bağlantı olurdu. */}
          {whatsapp && (
            <li>
              <a href={whatsapp} rel="noopener">
                WhatsApp
              </a>
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
