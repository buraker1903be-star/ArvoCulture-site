import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AddButton } from "@/components/cart";
import { ProductGallery } from "@/components/product-gallery";
import { SizePicker } from "@/components/size-picker";
import { JsonLd } from "@/components/json-ld";
import { getStorefrontProduct } from "@/lib/products";
import { formatPrice } from "@/lib/product-types";
import { breadcrumbSchema, productSchema } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getStorefrontProduct(slug);
  if (!product) return { title: "Ürün bulunamadı" };

  const description =
    product.subtitle || product.description.slice(0, 155) || product.name;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/urun/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: `/urun/${product.slug}`,
      ...(product.image ? { images: [{ url: product.image }] } : {}),
    },
    // Tükenmiş ürünü dizine ekletmiyoruz; stok gelince tekrar açılır.
    robots: { index: product.available !== false, follow: true },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getStorefrontProduct(slug);
  if (!product) notFound();

  return (
    <main className="product-page">
      <ProductGallery
        images={product.images}
        name={product.name}
        tone={product.tone}
        category={product.category}
      />
      <div className="product-info">
        <nav className="crumbs" aria-label="Konum">
          <Link href="/">Ana sayfa</Link>
          <span aria-hidden="true">/</span>
          <Link href="/koleksiyon/tumu">{product.category}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{product.name}</span>
        </nav>
        <p className="eyebrow">{product.eyebrow}</p>
        <h1>{product.name}</h1>
        <p className="lead">{product.subtitle}</p>
        <div className="detail-price">
          {formatPrice(product.price)}{" "}
          {product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}
        </div>
        <div className="tags">
          {product.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        {product.available === false ? (
          <button className="add-button" type="button" disabled>
            Tükendi
          </button>
        ) : product.category === "Giyim" ? (
          <SizePicker product={product} />
        ) : (
          <AddButton product={product} />
        )}
        <p className="stock-line" data-in-stock={product.available !== false}>
          {product.available === false
            ? "Şu anda stokta yok"
            : "Stokta — bugün kargoya hazırlanır"}
        </p>
        <div className="assurances">
          <span>✓ Güvenli alışveriş</span>
          <span>✓ Özenli gönderim</span>
          <span>✓ 14 gün içinde iade</span>
        </div>
        <details open>
          <summary>Ürün açıklaması</summary>
          <p>{product.description}</p>
        </details>
        <details>
          <summary>Teslimat ve iade</summary>
          <p>
            Siparişler özenle hazırlanır. Kullanılmamış ürünler yasal koşullar
            kapsamında iade edilebilir.
          </p>
        </details>
      </div>

      <JsonLd data={productSchema(product)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Ana sayfa", path: "/" },
          { name: product.category, path: "/koleksiyon/tumu" },
          { name: product.name, path: `/urun/${product.slug}` },
        ])}
      />
    </main>
  );
}
