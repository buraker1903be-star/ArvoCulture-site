import type { Metadata } from "next";
import { LiveSearch } from "@/components/live-search";
import { getPopularSearches } from "@/lib/popular-searches";

export const metadata: Metadata = {
  title: "Arama",
  description: "ArvoCulture kataloğunda ürün, marka ve kategori araması.",
  alternates: { canonical: "/arama" },
  // Arama sonuç sayfalarının dizine girmesi kalitesiz sonuç üretir.
  robots: { index: false, follow: true },
};

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
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
