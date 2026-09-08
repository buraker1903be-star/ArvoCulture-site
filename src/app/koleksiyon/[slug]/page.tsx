import { ProductCard, discountOf } from "@/components/product-card";
import { CollectionFilters } from "@/components/collection-filters";
import { getStorefrontCollections } from "@/lib/collections";
import {
  getStorefrontCollectionProducts,
  getStorefrontProducts,
} from "@/lib/products";
import Link from "next/link";
import type { Metadata } from "next";

const labels: Record<string, string> = {
  giyim: "Giyim",
  bakim: "Kişisel Bakım",
  kozmetik: "Kozmetik",
  parfum: "Parfüm",
  takviyeler: "Takviyeler",
  tumu: "Tüm Ürünler",
};

const menuGroups: Record<string, string[]> = {
  giyim: ["Giyim"],
  bakim: [
    "Kişisel Bakım",
    "Cilt Bakımı",
    "Saç Bakımı",
    "Vücut Bakımı",
    "Diğer Bakımlar",
    "Sorununa Göre",
  ],
  kozmetik: ["Kozmetik"],
  parfum: ["Parfüm"],
  takviyeler: ["Takviyeler"],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const label = labels[slug] ?? "Koleksiyon";

  return {
    title: label,
    description: `ArvoCulture ${label} seçkisi. Güncel ürünler, fiyatlar ve stok durumu.`,
    // Sayfalama parametresi (?sayfa=2) kanonik adresi bölmesin.
    alternates: { canonical: `/koleksiyon/${slug}` },
    openGraph: { url: `/koleksiyon/${slug}`, title: label },
  };
}

export default async function Collection({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sayfa?: string;
    sirala?: string;
    beden?: string;
    marka?: string;
    ust?: string;
    indirimli?: string;
    stokta?: string;
  }>;
}) {
  const { slug } = await params;
  // `params` yol parametresi; filtreler ayrı bir nesnede.
  const query = await searchParams;
  const requestedPage = Number(query.sayfa ?? "1");
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const collections = await getStorefrontCollections();
  const exactCollection = collections.find(
    (collection) => collection.slug === slug,
  );
  const label = exactCollection?.title ?? labels[slug] ?? "Tüm Ürünler";
  const list =
    slug === "tumu"
      ? await getStorefrontProducts(3000)
      : await getStorefrontCollectionProducts({
          collectionSlug: exactCollection?.slug,
          menuGroups: exactCollection ? undefined : menuGroups[slug],
        });
  /*
    Filtreleme ve sıralama sunucuda yapılıyor. Seçimler adres
    çubuğundan okunuyor: müşteri filtreli sayfayı paylaşabiliyor,
    geri tuşu çalışıyor ve arama motorları da sayfayı görebiliyor.
  */
  const beden = (query.beden ?? "").toString();
  const marka = (query.marka ?? "").toString();
  const ust = Number(query.ust ?? 0);
  const indirimli = query.indirimli === "1";
  const stokta = query.stokta === "1";
  const sirala = (query.sirala ?? "onerilen").toString();

  /* Filtre seçenekleri katalogdan türetilir; sabit liste
     tutulmuyor çünkü katalog sürekli değişiyor. */
  /* Bedenler varyantlardan gelir; ürün etiketlerinde yok. */
  const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "2XL", "XXL", "3XL", "4XL"];

  const sizes = [...new Set(list.flatMap((product) => product.sizes))].sort(
    (a, b) => {
      const ia = SIZE_ORDER.indexOf(a);
      const ib = SIZE_ORDER.indexOf(b);
      // Listede olmayan bedenler (tek beden, numara) sona.
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    },
  );

  const brands = [...new Set(list.map((product) => product.eyebrow))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "tr"))
    .slice(0, 12);

  const maxPrice = list.reduce(
    (top, product) => Math.max(top, product.price),
    0,
  );

  let filtered = list.filter((product) => {
    if (marka && product.eyebrow !== marka) return false;
    if (ust > 0 && product.price > ust) return false;
    if (indirimli && discountOf(product) <= 0) return false;
    if (stokta && product.available === false) return false;
    if (beden && !product.sizes.includes(beden.toUpperCase())) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    switch (sirala) {
      case "ucuz":
        return a.price - b.price;
      case "pahali":
        return b.price - a.price;
      case "indirim":
        return discountOf(b) - discountOf(a);
      case "yeni":
        // Katalog zaten son güncellenene göre sıralı geliyor.
        return 0;
      default:
        // Önerilen: stokta olanlar önce, sonra indirimliler.
        if ((a.available === false) !== (b.available === false)) {
          return a.available === false ? 1 : -1;
        }
        return discountOf(b) - discountOf(a);
    }
  });

  const pageSize = 24;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleProducts = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <main className="shell">
      <section className="panel collection-hero">
        <p className="eyebrow">ARVOCULTURE SEÇKİSİ</p>
        <h1>{label}</h1>
        <p>
          {exactCollection?.description ||
            "Kendine ait olanı keşfet. Her ürün; tasarım, nitelik ve kullanım deneyimi gözetilerek seçildi."}
        </p>
      </section>
      <section className="panel">
        <CollectionFilters
          total={list.length}
          shown={filtered.length}
          sizes={sizes}
          brands={brands}
          maxPrice={maxPrice}
        />
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
        {pageCount > 1 && (
          <nav
            className="collection-pagination"
            aria-label="Koleksiyon sayfaları"
          >
            {currentPage > 1 && (
              <Link
                prefetch={false}
                href={pageHref(slug, query, currentPage - 1)}
              >
                ← Önceki
              </Link>
            )}
            <span>
              {currentPage} / {pageCount}
            </span>
            {currentPage < pageCount && (
              <Link
                prefetch={false}
                href={pageHref(slug, query, currentPage + 1)}
              >
                Sonraki →
              </Link>
            )}
          </nav>
        )}
      </section>
    </main>
  );
}

/**
 * Sayfalama bağlantısı. Mevcut filtreler korunur; aksi hâlde
 * ikinci sayfaya geçen müşterinin seçimleri sıfırlanıyordu.
 */
function pageHref(
  slug: string,
  params: Record<string, string | undefined>,
  page: number,
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && key !== "sayfa") query.set(key, value);
  }
  query.set("sayfa", String(page));
  return `/koleksiyon/${slug}?${query.toString()}`;
}
