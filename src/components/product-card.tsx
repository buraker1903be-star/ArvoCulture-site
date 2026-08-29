import Image from "next/image";
import Link from "next/link";
import { formatPrice, Product } from "@/lib/products";
import type { StorefrontTheme } from "@/lib/storefront-theme";

export function ProductCard({
  product,
  index = 0,
  theme,
}: {
  product: Product;
  index?: number;
  theme?: StorefrontTheme;
}) {
  return (
    <article className="product-card">
      <Link
        href={`/urun/${product.slug}`}
        className={`product-art ${product.tone}`}
        aria-label={`${product.name} ürününü incele`}
      >
        {theme?.show_badges !== false && product.oldPrice && (
          <b className="product-badge">İNDİRİM</b>
        )}
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            quality={90}
            sizes="(max-width:600px) 50vw,(max-width:1000px) 33vw,25vw"
            style={{ objectFit: "contain" }}
          />
        ) : (
          <>
            <span className="art-number">0{index + 1}</span>
            <div className="bottle" />
            <span className="art-mark">AC</span>
          </>
        )}
        <span className="product-view">
          İncele <i>↗</i>
        </span>
        {theme?.show_quick_add && (
          <span className="quick-add">
            {product.available === false ? "Tükendi" : "Hızlı ekle +"}
          </span>
        )}
      </Link>
      {theme?.show_vendor !== false && (
        <p className="eyebrow">{product.eyebrow}</p>
      )}
      <h3>
        <Link href={`/urun/${product.slug}`}>{product.name}</Link>
      </h3>
      <div className="price">
        {formatPrice(product.price)}{" "}
        {product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}
      </div>
    </article>
  );
}
