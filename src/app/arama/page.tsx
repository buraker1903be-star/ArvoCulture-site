import type { Metadata } from "next";
import Link from "next/link";
import { LiveSearch } from "@/components/live-search";
import { getSearchIndex, type SearchItem } from "@/lib/search-index";

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
    Dizin çekilemezse arama boş sonuç göstermemeli.

    Eskiden hata yutulup boş liste dönüyordu ve müşteri "sonuç
    bulunamadı" görüyordu — kataloğun 3.100 ürünü yerinde dururken.
    Bu, aramanın bozuk olduğunu gizleyen en kötü davranış: ne
    müşteri anlıyor ne de biz fark ediyoruz.
  */
  let items: SearchItem[] = [];
  let indexFailed = false;
  try {
    items = await getSearchIndex();
  } catch (error) {
    console.error("Arama dizini getirilemedi:", error);
    indexFailed = true;
  }

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
        {indexFailed ? (
          <p className="hint">
            Arama şu anda kullanılamıyor. Kataloğa{" "}
            <Link href="/koleksiyon/tumu">tüm ürünler</Link> sayfasından göz
            atabilirsiniz.
          </p>
        ) : (
          <LiveSearch
            items={items}
            initialQuery={q ?? ""}
            autoFocus
            limit={48}
            variant="grid"
          />
        )}
      </section>
    </main>
  );
}
