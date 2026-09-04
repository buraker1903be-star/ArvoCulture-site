import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AddButton } from "@/components/cart";
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
      <div className={`product-gallery ${product.tone}`}>
        <span className="gallery-index">
          ARVOCULTURE / {product.category.toLocaleUpperCase("tr-TR")}
        </span>
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 50vw"
            style={{ objectFit: "contain" }}
          />
        ) : (
          <>
            <div className="product-object" />
            <b>AC</b>
          </>
        )}
      </div>
      <div className="product-info">
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
        {product.category === "Giyim" && (
          <>
            <label className="option-label">Beden seç</label>
            <div className="sizes">
              {["XS", "S", "M", "L", "XL"].map((size) => (
                <button type="button" key={size}>
                  {size}
                </button>
              ))}
            </div>
          </>
        )}
        {product.available === false ? (
          <button className="add-button" type="button" disabled>
            Tükendi
          </button>
        ) : (
          <AddButton product={product} />
        )}
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
