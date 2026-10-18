import type { Metadata } from "next";
import Link from "next/link";
import { AccountPanel } from "@/components/account-panel";
import { env } from "@/lib/env";
import { getSeller } from "@/lib/seller-source";
import { konagiAyarla } from "@/lib/konak";
import { getStorefrontDiscounts } from "@/lib/discounts";

export const metadata: Metadata = {
  title: "Hesabım",
  description:
    /* Marka adı çıkarıldı: sayfa indekslenmiyor (robots: index false)
       ve ortak dağıtımda her kiracıya ArvoCulture'ı yazardı.
       "Numarasıyla takip" de yazmıyor: vitrinde numarayla
       sorgulanan bir ekran YOK, takip sipariş onayı
       e-postasındaki kişiye özel bağlantıyla yapılıyor. */
    "Sipariş takibi ve hesap işlemleri. Üye olmadan da sipariş verebilir, onay e-postanızdaki bağlantıdan siparişinizi izleyebilirsiniz.",
  alternates: { canonical: "/hesap" },
  robots: { index: false, follow: true },
};

/**
 * Hesap sayfası.
 *
 * Sayfanın gövdesi tek bileşen: `AccountPanel`. Karşılama, giriş
 * formu, özet, profil, adresler ve siparişler orada — çünkü
 * hepsinin yanıtı "kim bakıyor" sorusuna bağlı ve bunu yalnızca
 * tarayıcıdaki oturum biliyor.
 *
 * Üyelik zorunlu değil: misafir alışveriş açık kalır, hesap
 * yalnızca sipariş geçmişi ve hızlı ödeme için bir kolaylıktır.
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

  /* Özet şeridindeki "Kuponlarım" sayacı. Kuponlar müşteriden
     bağımsız; tarayıcıda ikinci kez istemek aynı veriyi iki kez
     çekmek olurdu. */
  const [{ phoneLink: whatsapp }, indirimler] = await Promise.all([
    getSeller(),
    getStorefrontDiscounts(),
  ]);
  const kuponSayisi = indirimler.filter((indirim) => indirim.code).length;

  return (
    <main className="shell">
      {/*
        BAŞLIK PANELİN İÇİNDE.

        Sayfa "Hoş geldiniz." diye başlıyordu ama kime dediği
        belirsizdi: oturumu yalnızca tarayıcı biliyor, sunucu
        bilmiyor. Giriş yapmış müşteri kendi adını göremiyor, misafir
        ise hiç tanımadığı bir yerde karşılanıyordu. Karşılama artık
        panelin işi; o, kimin baktığını biliyor.

        Bağlantı bilgileri sunucudan aktarılır; NEXT_PUBLIC_
        değişkenine bağımlılık yok.
      */}
      <AccountPanel
        supabaseUrl={env.supabaseUrl}
        supabaseKey={env.supabaseKey}
        kuponSayisi={kuponSayisi}
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
