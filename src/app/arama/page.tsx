import { ProductCard } from "@/components/product-card";
import { getStorefrontProducts } from "@/lib/products";

export default async function Search() {
  const products = await getStorefrontProducts(12);
  return (
    <main className="simple-page">
      <p className="eyebrow">ARAMA</p>
      <h1>Ne arıyorsun?</h1>
      <input
        className="search-input"
        placeholder="Ürün, kategori veya koleksiyon ara"
        aria-label="Ürün ara"
      />
      <div className="product-grid search-grid">
        {products.map((product, index) => (
          <ProductCard key={product.slug} product={product} index={index} />
        ))}
      </div>
    </main>
  );
}
