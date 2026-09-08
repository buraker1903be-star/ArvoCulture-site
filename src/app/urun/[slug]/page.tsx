import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { ProductGallery } from "@/components/product-gallery";
import { ProductBuy } from "@/components/product-buy";
import { ProductCard, discountOf } from "@/components/product-card";
import { getStorefrontProduct, getStorefrontProducts } from "@/lib/products";
import { getProductVariants } from "@/lib/variants";
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

  const [product, catalogue, variants] = await Promise.all([
    getStorefrontProduct(slug),
    getStorefrontProducts(120),
    // Gerçek bedenler; sepete doğru SKU yazılabilsin.
    getProductVariants(slug),
  ]);

  if (!product) notFound();

  const off = discountOf(product);

  // Benzer ürünler: aynı kategoriden, stokta olan, bu ürün hariç.
  const related = catalogue
    .filter(
      (item) =>
        item.slug !== product.slug &&
        item.category === product.category &&
        item.available !== false,
    )
    .slice(0, 5);

  return (
    <main className="shell">
      <section className="panel pdp">
        <ProductGallery
          images={product.images}
          name={product.name}
          discount={off}
          bestSeller={Boolean(product.bestSeller)}
          artStyle={product.artStyle}
        />

        <div className="pdp-info">
          <nav className="crumbs" aria-label="Konum">
            <Link href="/">Ana sayfa</Link>
            <span aria-hidden="true">/</span>
            <Link href="/koleksiyon/tumu">{product.category}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{product.name}</span>
          </nav>

          <p className="eyebrow">{product.eyebrow}</p>
          <h1>{product.name}</h1>
          {product.subtitle && <p className="lead">{product.subtitle}</p>}

          <div className="pdp-price">
            <b>{formatPrice(product.price)}</b>
            {product.oldPrice && product.oldPrice > product.price && (
              <>
                <del>{formatPrice(product.oldPrice)}</del>
                <span className="pdp-save">
                  {formatPrice(product.oldPrice - product.price)} tasarruf
                </span>
              </>
            )}
          </div>

          <ProductBuy product={product} variants={variants} />

          {/* Satın alma kaygısını azaltan üç madde, butonun hemen
              altında; aşağı kaydırmaya gerek kalmıyor. */}
          <ul className="pdp-assurances">
            <li>
              <Link href="/teslimat">2.000 TL üzeri ücretsiz kargo</Link>
            </li>
            <li>
              <Link href="/iptal-iade">14 gün içinde iade</Link>
            </li>
            <li>
              <Link href="/gizlilik">3D Secure ile güvenli ödeme</Link>
            </li>
          </ul>

          {product.tags.length > 0 && (
            <div className="tags">
              {product.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}

          <div className="pdp-details">
            <details open>
              <summary>
                <span>Ürün açıklaması</span>
                <i aria-hidden="true" />
              </summary>
              <p>{product.description || product.subtitle}</p>
            </details>

            {product.specs.length > 0 && (
              <details>
                <summary>
                  <span>Ürün özellikleri</span>
                  <i aria-hidden="true" />
                </summary>
                <dl className="spec-list">
                  {product.specs.map((spec) => (
                    <div key={spec.label}>
                      <dt>{spec.label}</dt>
                      <dd>{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            )}

            {product.sizeGuide.length > 0 && (
              <details>
                <summary>
                  <span>Beden tablosu</span>
                  <i aria-hidden="true" />
                </summary>
                <dl className="spec-list">
                  {product.sizeGuide.map((row) => (
                    <div key={row.label}>
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            )}

            <details>
              <summary>
                <span>Teslimat</span>
                <i aria-hidden="true" />
              </summary>
              <p>
                Siparişiniz ödeme onayının ardından hazırlanır ve kargoya
                verildiğinde e-posta ile bilgilendirilirsiniz. Kargo ücreti
                120 TL&apos;dir; 2.000 TL ve üzeri siparişlerde ücretsizdir.
              </p>
            </details>

            <details>
              <summary>
                <span>İade koşulları</span>
                <i aria-hidden="true" />
              </summary>
              <p>
                Kullanılmamış ve yeniden satılabilir durumdaki ürünler
                teslimattan itibaren 14 gün içinde iade edilebilir. Ambalajı
                açılmış kozmetik, kişisel bakım ve takviye ürünleri hijyen
                gerekçesiyle iade kapsamı dışındadır.
              </p>
            </details>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="panel">
          <div className="head">
            <div>
              <h2>Benzer ürünler</h2>
              <p>{product.category} kategorisinden seçtiklerimiz.</p>
            </div>
            <Link href="/koleksiyon/tumu">Tüm ürünler</Link>
          </div>
          <div className="grid">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      )}

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
