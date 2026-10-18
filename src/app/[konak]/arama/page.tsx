import type { Metadata } from "next";
import { LiveSearch } from "@/components/live-search";
import { getPopularSearches } from "@/lib/popular-searches";
import { konagiAyarla } from "@/lib/konak";

/*
  BU SAYFA DİNAMİK KALMALI.

  `[konak]` düzenine `generateStaticParams` eklenince altındaki her
  sayfa istendiğinde üretilip SAKLANIR hâle geldi. Burada bu yanlış:
  sayfa önbelleksiz okuma yapıyor (havale hesabı / arama sonucu) ve
  Next saklanacak bir sayfanın içinde `revalidate: 0` bir fetch
  görünce "page changed from static to dynamic at runtime" ile
  patlıyor — canlıda 500 demek.

  Bu dört sayfa zaten taşınmadan önce de dinamikti; burada yapılan
  tek şey o davranışı açıkça yazmak.
*/
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Arama",
  /* Marka adı çıkarıldı; her kiracının arama sonucunda görünüyor. */
  description: "Katalogda ürün, marka ve kategori araması.",
  alternates: { canonical: "/arama" },
  // Arama sonuç sayfalarının dizine girmesi kalitesiz sonuç üretir.
  robots: { index: false, follow: true },
};

export default async function Search({
  params,
  searchParams,
}: {
  params: Promise<{ konak: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  /* Adres yoldan geliyor; her sayfa onu veri katmanına kendisi
     bırakıyor — düzen ile sayfa AYNI ANDA çiziliyor, sıraya
     güvenilemiyor (lib/konak). */
  konagiAyarla((await params).konak);

  /*
    Dizin sayfaya gömülmüyor: 3.100 ürünlük liste 1,3 MB tutuyordu
    ve arama yapmayacak ziyaretçi de bunu indiriyordu. Sorgu
    yazıldıkça /api/arama'ya gidiyor; buraya yalnızca sık arananlar
    geliyor. Sayfa boşken ve sonuç çıkmadığında müşteriye nereden
    başlayacağını gösteriyorlar.
  */
  const [{ q }, suggestions] = await Promise.all([
    searchParams,
    getPopularSearches(),
  ]);

  return (
    <main className="shell search-page">
      <section className="panel about-hero detail-hero">
        <p className="about-eyebrow">Arama</p>
        <h1>Ne aramıştınız?</h1>
        <p className="about-lede">
          Yazmaya başlayın; sonuçlar ilk harften itibaren görünür.
        </p>
      </section>

      <section className="panel">
        <LiveSearch
          initialQuery={q ?? ""}
          autoFocus
          limit={48}
          variant="grid"
          suggestions={suggestions}
        />
      </section>
    </main>
  );
}
