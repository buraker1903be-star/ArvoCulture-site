import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/product-types";
import type { StorefrontTheme } from "@/lib/storefront-theme";

/**
 * Ürün rayı. Ana sayfada yalnızca 4 ürün gösteriliyordu; katalogda
 * 200'den fazla ürün var. Ziyaretçinin ana sayfadan doğrudan ürüne
 * geçebilmesi dönüşümdeki en büyük kaldıraç.
 */
export function ProductRail({
  eyebrow,
  title,
  note,
  href,
  hrefLabel,
  products,
  theme,
}: {
  eyebrow: string;
  title: string;
  note?: string;
  href: string;
  hrefLabel: string;
  products: Product[];
  theme?: StorefrontTheme;
}) {
  if (products.length === 0) return null;

  return (
    <section className="rail" aria-labelledby={`rail-${href}`}>
      <div className="section-head">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`rail-${href}`}>{title}</h2>
          {note && <p className="rail-note">{note}</p>}
        </div>
        <Link href={href}>{hrefLabel}</Link>
      </div>
      <div className="rail-track">
        {products.map((product, index) => (
          <ProductCard
            key={product.slug}
            product={product}
            index={index}
            theme={theme}
          />
        ))}
      </div>
    </section>
  );
}
