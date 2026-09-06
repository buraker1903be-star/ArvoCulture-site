import type { Metadata } from "next";
import { LiveSearch } from "@/components/live-search";
import { getSearchIndex } from "@/lib/search-index";

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
  const [{ q }, items] = await Promise.all([searchParams, getSearchIndex()]);

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
          items={items}
          initialQuery={q ?? ""}
          autoFocus
          limit={48}
          variant="grid"
        />
      </section>
    </main>
  );
}
