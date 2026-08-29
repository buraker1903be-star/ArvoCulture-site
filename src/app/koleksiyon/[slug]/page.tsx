import { ProductCard } from "@/components/product-card";
import { getStorefrontProducts } from "@/lib/products";
import Link from "next/link";

const labels: Record<string, string> = {
  giyim: "Giyim",
  bakim: "Kişisel Bakım",
  kozmetik: "Kozmetik",
  parfum: "Parfüm",
  takviyeler: "Takviyeler",
  tumu: "Tüm Ürünler",
};

export default async function Collection({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sayfa?: string }>;
}) {
  const { slug } = await params;
  const requestedPage = Number((await searchParams).sayfa ?? "1");
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const label = labels[slug] ?? "Tüm Ürünler";
  const products = await getStorefrontProducts(200);
  const list =
    slug === "tumu" || !labels[slug]
      ? products
      : products.filter((product) =>
          slug === "bakim"
            ? product.category === "Kişisel Bakım"
            : product.category === label,
        );
  const pageSize = 24;
  const pageCount = Math.max(1, Math.ceil(list.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleProducts = list.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <main>
      <section className="collection-hero">
        <p className="eyebrow">ARVOCULTURE SEÇKİSİ</p>
        <h1>{label}</h1>
        <p>
          Kendine ait olanı keşfet. Her ürün; tasarım, nitelik ve kullanım
          deneyimi gözetilerek seçildi.
        </p>
      </section>
      <section className="featured">
        <div className="filterbar">
          <span>{list.length} ürün</span>
          <span>Önerilen sıralama ↓</span>
        </div>
        <div className="product-grid">
          {visibleProducts.map((product, index) => (
            <ProductCard key={product.slug} product={product} index={index} />
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
                href={`/koleksiyon/${slug}?sayfa=${currentPage - 1}`}
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
                href={`/koleksiyon/${slug}?sayfa=${currentPage + 1}`}
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
