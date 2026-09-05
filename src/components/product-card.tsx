import Image from "next/image";
import Link from "next/link";
import { QuickAdd } from "@/components/quick-add";
import { formatPrice, type Product } from "@/lib/product-types";

/** İndirim yüzdesi: rozet ve sıralama için tek kaynak. */
export function discountOf(product: Product) {
  if (product.discountPercent) return product.discountPercent;
  if (product.oldPrice && product.oldPrice > product.price) {
    return Math.round((1 - product.price / product.oldPrice) * 100);
  }
  return 0;
}

export function ProductCard({ product }: { product: Product }) {
  const off = discountOf(product);
  const href = `/urun/${product.slug}`;

  return (
    <article className="card">
      <Link href={href} className="card-art" aria-label={product.name}>
        <span className="card-flags">
          {off > 0 && <b className="tag tag-sale">%{off} indirim</b>}
          {product.bestSeller && <b className="tag tag-best">Çok satan</b>}
        </span>
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width:640px) 50vw,(max-width:980px) 33vw,(max-width:1280px) 25vw,20vw"
          />
        )}
      </Link>

      <p className="card-brand">{product.eyebrow}</p>
      <h3>
        <Link href={href}>{product.name}</Link>
      </h3>

      <div className="price">
        <b>{formatPrice(product.price)}</b>
        {product.oldPrice && product.oldPrice > product.price && (
          <del>{formatPrice(product.oldPrice)}</del>
        )}
      </div>

      <div className="card-action">
        <QuickAdd product={product} />
      </div>
    </article>
  );
}
