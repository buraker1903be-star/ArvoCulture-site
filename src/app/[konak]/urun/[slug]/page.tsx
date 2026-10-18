import type { Metadata } from "next";
import { Fiyat } from "@/components/para-birimi";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { ProductGallery } from "@/components/product-gallery";
import { ProductBuy } from "@/components/product-buy";
import { RecentProducts } from "@/components/recent-products";
import { ProductCard, discountOf } from "@/components/product-card";
import { getStorefrontProduct, getStorefrontProducts } from "@/lib/products";
import { getProductVariants } from "@/lib/variants";
import { breadcrumbSchema, productSchema } from "@/lib/seo";
import { konagiAyarla, vitrinAdresi } from "@/lib/konak";
import { kategoriAdresi } from "@/lib/categories";
import { getSalesRules } from "@/lib/store-settings";
import { shippingTerms } from "@/lib/order-quote";
import { getStorefrontTheme } from "@/lib/storefront-theme";

/**
 * Ürün sayfası altmış saniyeliğine saklanıyor.
 *
 * Ölçüm: sayfa her istekte baştan çiziliyordu (`x-vercel-cache:
 * MISS`, ~355 ms). Sebebi, sayfadaki tüm veri çağrılarının POST
 * olması — Next yalnızca GET isteklerini önbelleğe alıyor, bu
 * yüzden segmentin yenilenme süresi sıfıra düşüyor ve sayfa
 * dinamik sayılıyordu. Buradaki tek satır, `arc.ts` içinde zaten
 * yazılı olan niyeti (`revalidate: 60`) gerçekten uygulanır hâle
 * getiriyor.
 *
 * Bedeli açık: bir fiyat değişikliği müşteriye en geç bir dakika
 * gecikmeyle yansıyor. Bunu kabul edilebilir kılan şey, ödenecek
 * tutarın burada değil ArvoARC'ta hesaplanması — vitrindeki rakam
 * bilgilendirme, sepetteki rakam taahhüt.
 *
 * Süre kısaltılmak istenirse değiştirilecek yer burası.
 */
export const revalidate = 60;

/*
  ADRES YOLDAN GELDİĞİ İÇİN BU SAYFA STATİK ÜRETİLEBİLİYOR.

  Burada bir koruma duruyordu: `VITRIN_KONAGI` tanımsızsa derleme
  durduruluyordu. Sebebi adresin istek başlığından okunmasıydı —
  statik üretimde `headers()` çağırmak DYNAMIC_SERVER_USAGE
  fırlatıyor ve 18.10.2026'da canlıda bütün ürün sayfaları (3.400)
  bu yüzden 500 verdi.

  Artık adres YOLUN parçası: `src/proxy.ts` her isteği
  `/<konak>/...` olarak yeniden yazıyor ve adres `params` ile
  geliyor, başlık okunmuyor. Koruma gereksiz kaldı; üstelik
  çözümün önünü keserdi.

  Kazanç yalnızca hatanın kalkması değil: önbellek anahtarı yolu
  içerdiği için her mağaza KENDİ sayfasını saklıyor ve rota
  önbelleği çok mağazalı kipte de çalışıyor.
*/

/**
 * Boş liste dönüyor ve bu bilinçli.
 *
 * `revalidate` tek başına yetmedi: canlıda ölçtüğümde sayfa hâlâ
 * her istekte baştan çiziliyordu (`x-vercel-cache: MISS`,
 * `cache-control: private, no-store`). Sebebi, `generateStaticParams`
 * bulunmayan dinamik bir segmentin Next tarafından tamamen dinamik
 * sayılması — yenilenme süresi verilmiş olsa bile saklanacak bir
 * sayfa üretilmiyor.
 *
 * Boş liste vermek, "bu yolu önceden üretme ama istendiğinde üret
 * ve sakla" demek. Derleme süresi değişmiyor: 3.429 ürünün hiçbiri
 * önceden çizilmiyor. İlk isteyen müşteri sayfayı üretiyor,
 * sonrakiler uçtan alıyor.
 *
 * `dynamicParams` öntanımlı olarak açık; listede olmayan slug'lar
 * yine çalışıyor, olmayan ürün yine 404 veriyor.
 */
export async function generateStaticParams() {
  return [];
}

type Params = { params: Promise<{ slug: string; konak: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, konak } = await params;
  /* Adres yoldan geliyor; üstveri düzenle aynı anda çalışabildiği
     için burada da bırakılıyor (lib/konak). */
  konagiAyarla(konak);
  const product = await getStorefrontProduct(slug);

  /* Olmayan ürünün 404'ü layout.tsx'te: üstveriden çağrılan
     notFound() durum kodunu kurmuyor (ölçüldü, gerekçe orada). */
  if (!product) return {};

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
      // Görsel: aynı klasördeki opengraph-image.tsx (marka kartı).
    },
    // Tükenmiş ürünü dizine ekletmiyoruz; stok gelince tekrar açılır.
    robots: { index: product.available !== false, follow: true },
  };
}

export default async function ProductPage({ params }: Params) {
  /* Adres yoldan geliyor; her sayfa onu veri katmanına kendisi
     bırakıyor — düzen ile sayfa AYNI ANDA çiziliyor, sıraya
     güvenilemiyor (lib/konak). */
  konagiAyarla((await params).konak);

  const { slug, konak } = await params;
  konagiAyarla(konak);

  const [product, catalogue, varyantSonucu, salesRules, adres, theme] = await Promise.all([
    getStorefrontProduct(slug),
    getStorefrontProducts(120),
    /* Gerçek bedenler; sepete doğru SKU yazılabilsin. Okuma
       başarısızsa "seçenek yok" demiyor, "bilinmiyor" diyor:
       SKU'suz sepet ArvoARC'ta rastgele varyanta bağlanıyordu
       (lib/variants.ts). */
    getProductVariants(slug),
    // Yapısal verideki kargo ücreti mağazanın gerçek tarifesi olsun.
    getSalesRules(),
    /* Şemadaki adresler kanonik adresten: önceden env.siteUrl
       sabitiydi ve ikinci bir kiracının ürün şeması ArvoCulture'ın
       adresini gösterirdi. */
    vitrinAdresi(),
    /* Ürünün kendi markası yoksa şemaya mağaza adı giriyor;
       sabit "ArvoCulture" ikinci bir kiracının markasız ürününü
       bizim markamızla bildiriyordu. */
    getStorefrontTheme(),
  ]);

  if (!product) notFound();

  const { varyantlar: variants, okunamadi: varyantOkunamadi } = varyantSonucu;

  const off = discountOf(product);
  // Güvence şeridi ve teslimat notu mağazanın gerçek tarifesiyle.
  const shipping = shippingTerms(salesRules);

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
          artStyle={product.artStyle}
        />

        <div className="pdp-info">
          <nav className="crumbs" aria-label="Konum">
            <Link href="/">Ana sayfa</Link>
            <span aria-hidden="true">/</span>
            {/* Görünen kırıntı da şemayla aynı adrese gidiyor. */}
            <Link href={kategoriAdresi(product.category)}>{product.category}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{product.name}</span>
          </nav>

          {/* Künye satırı: marka ve "çok satan" işareti — karttaki
              düzenin aynısı. Rozet görselin üzerinden buraya taşındı. */}
          <p className="eyebrow">
            {product.eyebrow && <span>{product.eyebrow}</span>}
            {product.bestSeller && <em>Çok satan</em>}
          </p>
          <h1>{product.name}</h1>
          {product.subtitle && <p className="lead">{product.subtitle}</p>}

          <div className="pdp-price">
            <b><Fiyat lira={product.price} /></b>
            {product.oldPrice && product.oldPrice > product.price && (
              <>
                <del><Fiyat lira={product.oldPrice} /></del>
                {off > 0 && <span className="price-off">−%{off}</span>}
                {/* Tutar olarak tasarruf, pahalı ürünlerde yüzdeden
                    daha ikna edici; ikisi birlikte duruyor. */}
                <span className="pdp-save">
                  <Fiyat lira={product.oldPrice - product.price} /> tasarruf
                </span>
              </>
            )}
          </div>

          <ProductBuy
            product={product}
            variants={variants}
            varyantOkunamadi={varyantOkunamadi}
          />

          {/* Satın alma kaygısını azaltan üç madde, butonun hemen
              altında; aşağı kaydırmaya gerek kalmıyor. */}
          <ul className="pdp-assurances">
            <li>
              <Link href="/teslimat">{shipping.badge}</Link>
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
                verildiğinde e-posta ile bilgilendirilirsiniz.{" "}
                {shipping.sentence}
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
                açılmış kozmetik ve kişisel bakım ürünleri hijyen
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

      {/* Son gezilenler: bu ürünü listeye ekler, diğerlerini gösterir. */}
      <RecentProducts currentSlug={product.slug} />

      {/* Varyantlar şemaya da giriyor: tek varyantlıda gerçek SKU ve
          kesin fiyat, çok varyantlıda fiyat aralığı (AggregateOffer).
          Önceden SKU olarak ürün slug'ı, fiyat olarak kataloğun en
          düşük fiyatı yazılıyordu. */}
      <JsonLd data={productSchema(product, adres, theme.store_name ?? "Mağaza", salesRules, variants)} />
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: "Ana sayfa", path: "/" },
            /* Basamağın adı ile gittiği yer aynı olmalı: "Kozmetik"
               yazıp tüm kataloğu açmak yanıltıcıydı (lib/categories). */
            { name: product.category, path: kategoriAdresi(product.category) },
            { name: product.name, path: `/urun/${product.slug}` },
          ],
          adres,
        )}
      />
    </main>
  );
}
