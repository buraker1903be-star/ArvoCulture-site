import type { Metadata } from "next";
import { LiveSearch } from "@/components/live-search";

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
  const { q } = await searchParams;

  /*
    Dizin artık burada çekilmiyor. 3.100 ürünlük liste sayfaya
    gömülüyordu (1,3 MB) ve arama yapmayacak ziyaretçi de bunu
    indiriyordu. Sorgu yazıldıkça /api/arama'ya gidiyor.
  */

  return (
    <main className="shell">
      <section className="panel about-hero">
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
        />
      </section>
    </main>
  );
}
