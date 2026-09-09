import Image from "next/image";
import Link from "next/link";
import { QuickAdd } from "@/components/quick-add";
import { formatPrice, type Product } from "@/lib/product-types";
import { FavouriteButton } from "@/components/favourite-button";
import { CardGallery } from "@/components/card-gallery";

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
  const second = product.images?.[1];

  return (
    <article className="card">
      <Link
        href={href}
        className="card-art"
        aria-label={product.name}
        data-multi={second ? "true" : undefined}
        /*
          Görsel türü. Manken fotoğrafı çerçeveyi doldurur,
          paket çekimi nefes alır. Ayrım katalog katmanında
          yapılıyor (bkz. products.ts).
        */
        data-art={product.artStyle}
      >
        <span className="card-flags">
          {/*
            Tükendi rozeti önce gelir: müşteri indirimi görüp
            tıkladıktan sonra satın alamayacağını öğrenmemeli.
          */}
          {product.available === false ? (
            <b className="tag tag-out">Tükendi</b>
          ) : (
            <>
              {off > 0 && <b className="tag tag-sale">%{off} indirim</b>}
              {product.bestSeller && <b className="tag tag-best">Çok satan</b>}
            </>
          )}
        </span>
        {/*
          Dokunmatikte kaydırılabilir galeri, masaüstünde tek
          görsel. İki ayrı düzen: masaüstünde hover ile ikinci
          görsel zaten çalışıyor ve daha az etkileşim istiyor.
        */}
        {product.images.length > 1 ? (
          <CardGallery
            images={product.images.slice(0, 4)}
            alt={product.name}
            sizes="(max-width:640px) 50vw,(max-width:980px) 33vw,(max-width:1280px) 25vw,20vw"
          />
        ) : (
          product.image && (
            <Image
              className="card-img"
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width:640px) 50vw,(max-width:980px) 33vw,(max-width:1280px) 25vw,20vw"
            />
          )
        )}

      </Link>

      <FavouriteButton slug={product.slug} label={product.name} />

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
