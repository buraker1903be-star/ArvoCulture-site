import Image from "next/image";
import Link from "next/link";
import { QuickAdd } from "@/components/quick-add";
import { formatPrice, type Product } from "@/lib/product-types";
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
  const showBadges = theme?.show_badges !== false;
  const discountPercent =
    product.discountPercent ??
    (product.oldPrice && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : 0);
  return (
    <article className="product-card">
      <Link
        href={`/urun/${product.slug}`}
        className={`product-art ${product.tone}`}
        aria-label={`${product.name} ürününü incele`}
      >
        {showBadges && (
          <span className="product-badges">
            {product.bestSeller && (
              <b className="product-badge bestseller">ÇOK SATAN</b>
            )}
            {discountPercent > 0 && (
              <b className="product-badge discount">-%{discountPercent}</b>
            )}
            {product.badge &&
              product.badge.toLocaleLowerCase("tr-TR") !== "çok satan" && (
                <b className={`product-badge ${product.badgeTone ?? "green"}`}>
                  {product.badge}
                </b>
              )}
          </span>
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
      </Link>
      {theme?.show_quick_add && <QuickAdd product={product} />}
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
