import { ProductCard } from "@/components/product-card";
import { getStorefrontProducts } from "@/lib/products";

export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q?.trim() ?? "";
  const products = await getStorefrontProducts(200);
  const normalized = query.toLocaleLowerCase("tr-TR");
  const results = normalized
    ? products.filter((product) =>
        `${product.name} ${product.category} ${product.eyebrow} ${product.subtitle}`
          .toLocaleLowerCase("tr-TR")
          .includes(normalized),
      )
    : products.slice(0, 12);
  return (
    <main className="simple-page">
      <p className="eyebrow">ARAMA</p>
      <h1>Ne arıyorsun?</h1>
      <form className="search-form" action="/arama">
        <input
          name="q"
          defaultValue={query}
          className="search-input"
          placeholder="Ürün, kategori veya koleksiyon ara"
          aria-label="Ürün ara"
          autoFocus
        />
        <button className="button button-dark" type="submit">
          Ara
        </button>
      </form>
      {query && (
        <p className="search-count">
          <b>{results.length}</b> sonuç · “{query}”
        </p>
      )}
      <div className="product-grid search-grid">
        {results.map((product, index) => (
          <ProductCard key={product.slug} product={product} index={index} />
        ))}
      </div>
      {query && !results.length && (
        <div className="empty-cart">
          <h2>Sonuç bulunamadı.</h2>
          <p>Farklı bir kelime deneyin veya tüm seçkiyi inceleyin.</p>
        </div>
      )}
    </main>
  );
}
