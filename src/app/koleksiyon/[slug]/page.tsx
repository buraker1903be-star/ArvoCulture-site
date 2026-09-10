import { ProductCard, discountOf } from "@/components/product-card";
import { CollectionFilters } from "@/components/collection-filters";
import { getStorefrontCollections } from "@/lib/collections";
import {
  getStorefrontCollectionProducts,
  getStorefrontProductsPage,
  getStorefrontFacets,
  CATALOG_PAGE_SIZE,
  type Product,
} from "@/lib/products";
import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo";

const labels: Record<string, string> = {
  giyim: "Giyim",
  bakim: "Kişisel Bakım",
  kozmetik: "Kozmetik",
  parfum: "Parfüm",
  takviyeler: "Takviyeler",
  tumu: "Tüm Ürünler",
};

const menuGroups: Record<string, string[]> = {
  giyim: ["Giyim"],
  bakim: [
    "Kişisel Bakım",
    "Cilt Bakımı",
    "Saç Bakımı",
    "Vücut Bakımı",
    "Diğer Bakımlar",
    "Sorununa Göre",
  ],
  kozmetik: ["Kozmetik"],
  parfum: ["Parfüm"],
  takviyeler: ["Takviyeler"],
};

/* Bedenler varyantlardan gelir; ürün etiketlerinde yok. */
const SIZE_ORDER = [
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "XXL",
  "3XL",
  "4XL",
];

/** Listede olmayan bedenler (tek beden, numara) sona. */
const bySizeOrder = (a: string, b: string) => {
  const ia = SIZE_ORDER.indexOf(a);
  const ib = SIZE_ORDER.indexOf(b);
  return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  /*
    Başlık ARC'taki koleksiyon adından geliyor.

    Önceden yalnızca aşağıdaki altı sabit slug'a bakılıyordu ve
    geri kalan her şey "Koleksiyon" oluyordu. Site haritasındaki
    118 kategori sayfasının tamamı aynı başlığı ve aynı açıklamayı
    taşıyordu: "Koleksiyon | ArvoCulture". Sayfanın kendi H1'i
    doğruydu ("Erkek T-Shirt"), yalnızca <title> yanlıştı — yani
    müşteri doğru sayfayı görüyor ama arama sonucunda hepsi aynı
    isimle sıralanıyordu.

    getStorefrontCollections React'in cache'iyle sarılı; aynı
    istekte sayfanın gövdesi de onu çağırıyor, bu yüzden burada
    ikinci bir veritabanı sorgusu doğmuyor.
  */
  const collections = await getStorefrontCollections();
  const collection = collections.find((item) => item.slug === slug);
  const label = collection?.title ?? labels[slug] ?? "Koleksiyon";

  /* ARC'taki açıklama varsa o kullanılıyor; arama sonucunda
     görünen metin kategoriye özel olmalı. */
  const ownDescription = collection?.description?.trim();
  const description =
    ownDescription && ownDescription.length > 40
      ? ownDescription.slice(0, 155)
      : `ArvoCulture ${label} seçkisi. Güncel ürünler, fiyatlar ve stok durumu.`;

  return {
    title: label,
    description,
    // Sayfalama parametresi (?sayfa=2) kanonik adresi bölmesin.
    alternates: { canonical: `/koleksiyon/${slug}` },
    openGraph: { url: `/koleksiyon/${slug}`, title: label, description },
  };
}

export default async function Collection({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sayfa?: string;
    sirala?: string;
    beden?: string;
    marka?: string;
    ust?: string;
    indirimli?: string;
    stokta?: string;
  }>;
}) {
  const { slug } = await params;
  // `params` yol parametresi; filtreler ayrı bir nesnede.
  const query = await searchParams;
  const requestedPage = Number(query.sayfa ?? "1");
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  /*
    Filtreleme ve sıralama sunucuda yapılıyor. Seçimler adres
    çubuğundan okunuyor: müşteri filtreli sayfayı paylaşabiliyor,
    geri tuşu çalışıyor ve arama motorları da sayfayı görebiliyor.
  */
  const beden = (query.beden ?? "").toString();
  const marka = (query.marka ?? "").toString();
  const ust = Number(query.ust ?? 0);
  const indirimli = query.indirimli === "1";
  const stokta = query.stokta === "1";
  const sirala = (query.sirala ?? "onerilen").toString();

  const collections = await getStorefrontCollections();
  const exactCollection = collections.find(
    (collection) => collection.slug === slug,
  );
  const label = exactCollection?.title ?? labels[slug] ?? "Tüm Ürünler";

  /*
    "Tüm Ürünler" kataloğun tamamını kapsar ve 3.400’ü aşkın ürün
    demektir. Bu sayfa eskiden hepsini çekip 24 tanesini
    gösteriyordu: 3,0 MB veri ve her ürün için gereksiz işlem.
    Artık filtre, sıralama ve sayfalama veritabanında yapılıyor.

    Diğer koleksiyonlar en fazla 200 ürün döndüren ayrı bir uç
    nokta kullanıyor; orada toplu çekmek ucuz ve filtreler bellekte
    çalışabiliyor.
  */
  const isFullCatalogue = slug === "tumu";

  let visibleProducts: Product[];
  let pageCount: number;
  let currentPage: number;
  let shownCount: number;
  let totalCount: number;
  let sizes: string[];
  let brands: string[];
  let maxPrice: number;

  if (isFullCatalogue) {
    const [result, facets] = await Promise.all([
      getStorefrontProductsPage(page, {
        brand: marka,
        size: beden,
        maxPrice: ust,
        onlyDiscounted: indirimli,
        onlyAvailable: stokta,
        sort: sirala,
      }),
      getStorefrontFacets(),
    ]);

    visibleProducts = result.products;
    pageCount = result.pageCount;
    currentPage = Math.min(result.page, result.pageCount);
    shownCount = result.total;
    totalCount = facets.total || result.total;
    sizes = [...facets.sizes].sort(bySizeOrder);
    brands = facets.brands.slice(0, 12);
    maxPrice = facets.maxPrice;
  } else {
    const list = await getStorefrontCollectionProducts({
      collectionSlug: exactCollection?.slug,
      menuGroups: exactCollection ? undefined : menuGroups[slug],
    });

    /* Filtre seçenekleri katalogdan türetilir; sabit liste
       tutulmuyor çünkü katalog sürekli değişiyor. */
    sizes = [...new Set(list.flatMap((product) => product.sizes))].sort(
      bySizeOrder,
    );
    brands = [...new Set(list.map((product) => product.eyebrow))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "tr"))
      .slice(0, 12);
    maxPrice = list.reduce((top, product) => Math.max(top, product.price), 0);

    let filtered = list.filter((product) => {
      if (marka && product.eyebrow !== marka) return false;
      if (ust > 0 && product.price > ust) return false;
      if (indirimli && discountOf(product) <= 0) return false;
      if (stokta && product.available === false) return false;
      if (beden && !product.sizes.includes(beden.toUpperCase())) return false;
      return true;
    });

    filtered = [...filtered].sort((a, b) => {
      switch (sirala) {
        case "ucuz":
          return a.price - b.price;
        case "pahali":
          return b.price - a.price;
        case "indirim":
          return discountOf(b) - discountOf(a);
        case "yeni":
          // Katalog zaten son güncellenene göre sıralı geliyor.
          return 0;
        default:
          // Önerilen: stokta olanlar önce, sonra indirimliler.
          if ((a.available === false) !== (b.available === false)) {
            return a.available === false ? 1 : -1;
          }
          return discountOf(b) - discountOf(a);
      }
    });

    pageCount = Math.max(1, Math.ceil(filtered.length / CATALOG_PAGE_SIZE));
    currentPage = Math.min(page, pageCount);
    visibleProducts = filtered.slice(
      (currentPage - 1) * CATALOG_PAGE_SIZE,
      currentPage * CATALOG_PAGE_SIZE,
    );
    shownCount = filtered.length;
    totalCount = list.length;
  }

  return (
    <main className="shell">
      <section className="panel collection-hero">
        <p className="eyebrow">ARVOCULTURE SEÇKİSİ</p>
        <h1>{label}</h1>
        <p>
          {exactCollection?.description ||
            "Kendine ait olanı keşfet. Her ürün; tasarım, nitelik ve kullanım deneyimi gözetilerek seçildi."}
        </p>
      </section>
      <section className="panel">
        <CollectionFilters
          total={totalCount}
          shown={shownCount}
          sizes={sizes}
          brands={brands}
          maxPrice={maxPrice}
        />
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>

        {/*
          Var olmayan bir sayfa numarası istendiğinde boş bir ızgara
          bırakmak yerine geri dönüş veriliyor. Sayfalama artık
          veritabanında olduğu için bu durum sessizce boş gelebilir.
        */}
        {visibleProducts.length === 0 && (
          <p className="hint">
            Bu seçimle ürün bulunamadı.{" "}
            <Link href={`/koleksiyon/${slug}`}>Filtreleri temizle</Link>
          </p>
        )}

        {pageCount > 1 && (
          <nav
            className="collection-pagination"
            aria-label="Koleksiyon sayfaları"
          >
            {currentPage > 1 && (
              <Link
                prefetch={false}
                href={pageHref(slug, query, currentPage - 1)}
              >
                ← Önceki
              </Link>
            )}
            <span>
              {currentPage} / {pageCount}
            </span>
            {currentPage < pageCount && (
              <Link
                prefetch={false}
                href={pageHref(slug, query, currentPage + 1)}
              >
                Sonraki →
              </Link>
            )}
          </nav>
        )}
      </section>

      {/*
        Listeleme sayfalarının hiçbir işaretlemesi yoktu. ItemList
        sayfadaki ürünleri ve sıralarını bildiriyor; kırıntı yolu ise
        koleksiyonun katalog içindeki yerini.
      */}
      <JsonLd
        data={collectionSchema({
          title: label,
          description:
            exactCollection?.description ||
            `ArvoCulture ${label} seçkisi. Güncel ürünler, fiyatlar ve stok durumu.`,
          path: `/koleksiyon/${slug}`,
          products: visibleProducts,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Ana sayfa", path: "/" },
          { name: label, path: `/koleksiyon/${slug}` },
        ])}
      />
    </main>
  );
}

/**
 * Sayfalama bağlantısı. Mevcut filtreler korunur; aksi hâlde
 * ikinci sayfaya geçen müşterinin seçimleri sıfırlanıyordu.
 */
function pageHref(
  slug: string,
  params: Record<string, string | undefined>,
  page: number,
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && key !== "sayfa") query.set(key, value);
  }
  query.set("sayfa", String(page));
  return `/koleksiyon/${slug}?${query.toString()}`;
}
