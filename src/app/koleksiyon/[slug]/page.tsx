import { ProductCard } from "@/components/product-card";
import { CollectionFilters } from "@/components/collection-filters";
import { getStorefrontCollections } from "@/lib/collections";
import {
  getStorefrontCollectionProductsPage,
  getStorefrontProductsPage,
  getStorefrontFacets,
  type Product,
} from "@/lib/products";
import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { SABIT_KOLEKSIYONLAR } from "@/lib/categories";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo";

/* Aynı liste yerleşimde 404 kararı için de okunuyor; tek yerde. */
const labels = SABIT_KOLEKSIYONLAR;

/*
  SABİT KATEGORİ SAYFALARININ KAPSAMI (17.10.2026 düzeltmesi).

  Dört kategori sayfası (/koleksiyon/giyim, /bakim, /kozmetik,
  /parfum) ArvoARC'ta karşılığı olan koleksiyon DEĞİL; menü
  gruplarından toplanıyor. Buradaki grup adları ArvoARC'ta
  koleksiyon üstverisindeki `menu_group` değerleriyle BİREBİR
  eşleşmek zorunda — eşleşmeyen ad sessizce hiçbir şey getirmiyor.

  Eski liste uydurma adlar taşıyordu ve kapsam çok dardı. Canlıda
  ölçüldü: /koleksiyon/giyim 32 ürün gösteriyordu, oysa giyim
  koleksiyonları "Üst Giyim", "Alt Giyim", "Dış Giyim", "Alt Üst
  Takım", "İç Giyim" ve "Çocuk" gruplarında duruyor ve binlerce
  ürün içeriyor. "Sorununa Göre" diye bir grup hiç yok; gerçek adı
  "İhtiyaca Göre". Kozmetiğin grubu "Makyaj", parfümün bir kısmı
  "Kime Göre" altında.

  "MARKA KOLEKSİYONLARI" BİLEREK YOK: bu ad hem bakım hem parfüm
  tarafında kullanılıyor (ArvoARC'ta ayrımı `parent` yapıyor, bu
  fonksiyon ise yalnızca menu_group'a bakıyor). Listeye eklenirse
  bakım sayfasına parfüm koleksiyonları, parfüm sayfasına bakım
  koleksiyonları düşerdi.

  Aksesuar burada yok: kendi sayfası var (/koleksiyon/aksesuar) ve
  kemer ile gözlük "giyim" değil.
*/
const menuGroups: Record<string, string[]> = {
  giyim: [
    "Giyim",
    "Üst Giyim",
    "Alt Giyim",
    "Dış Giyim",
    "Alt Üst Takım",
    "İç Giyim",
    "Çocuk",
  ],
  bakim: [
    "Kişisel Bakım",
    "Cilt Bakımı",
    "Saç Bakımı",
    "Vücut Bakımı",
    "Diğer Bakımlar",
    "İhtiyaca Göre",
  ],
  kozmetik: ["Kozmetik", "Makyaj"],
  parfum: ["Parfüm", "Kime Göre"],
};

/**
 * Birleştirilen koleksiyonlar.
 *
 * Parfümler ArvoARC'ta iki ayrı kaynaktan geliyor ve her cinsiyet için
 * iki koleksiyon var: LR'ninkiler ("parfumler-erkek") ve tedarikçi
 * kataloğundakiler ("kozmetik-kisisel-bakim-erkek-parfumu").
 * Müşteri için bu ayrımın bir anlamı yok — "erkek parfümü" arayan
 * biri hepsini bir arada görmeli, hangi tedarikçiden geldiğini
 * bilmek zorunda olmamalı. Menüde iki ayrı satır hâlinde durması
 * ise doğrudan karışıklık yaratıyordu.
 *
 * Burada uydurulan bir koleksiyon yok: ikisi de ArvoARC'ta duran
 * gerçek koleksiyonlar, yalnızca tek sayfada birleştiriliyorlar.
 * ArvoARC tarafında bu koleksiyonlar tek çatı altında toplanırsa
 * buradaki satır silinir ve hiçbir şey değişmez.
 */
const MERGED_COLLECTIONS: Record<string, string[]> = {
  "parfumler-erkek": [
    "parfumler-erkek",
    "kozmetik-kisisel-bakim-erkek-parfumu",
  ],
  "parfumler-kadin": [
    "parfumler-kadin",
    "kozmetik-kisisel-bakim-kadin-parfumu",
  ],
};

/** Birleştirmede yutulan koleksiyonlar: hangi sayfaya ait oldukları. */
const MERGED_INTO = new Map(
  Object.entries(MERGED_COLLECTIONS).flatMap(([hedef, kaynaklar]) =>
    kaynaklar
      .filter((kaynak) => kaynak !== hedef)
      .map((kaynak) => [kaynak, hedef] as const),
  ),
);

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
    Başlık ArvoARC'taki koleksiyon adından geliyor.

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

  /* Tanınmayan slug'ın 404'ü layout.tsx'te: üstveriden çağrılan
     notFound() durum kodunu kurmuyor (ölçüldü, gerekçe orada). */

  const label = collection?.title ?? labels[slug] ?? "Koleksiyon";

  /* ArvoARC'taki açıklama varsa o kullanılıyor; arama sonucunda
     görünen metin kategoriye özel olmalı. */
  const ownDescription = collection?.description?.trim();
  const description =
    ownDescription && ownDescription.length > 40
      ? ownDescription.slice(0, 155)
      : `ArvoCulture ${label} seçkisi. Güncel ürünler, fiyatlar ve stok durumu.`;

  /*
    Birleştirmede yutulan koleksiyon, içeriğini artık hedef sayfada
    da gösteriyor. İkisi de kendi başına dizine girerse aynı ürünler
    iki adreste görünür ve arama motoru hangisini göstereceğini
    bilemez. Kanonik adres hedefi işaret ediyor; sayfa erişilebilir
    kalıyor ama sıralamada tek bir adres yarışıyor.
  */
  const canonicalSlug = MERGED_INTO.get(slug) ?? slug;

  return {
    title: label,
    description,
    // Sayfalama parametresi (?sayfa=2) kanonik adresi bölmesin.
    alternates: { canonical: `/koleksiyon/${canonicalSlug}` },
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

    Diğer koleksiyonlar da aynı yolu kullanıyor (17.10.2026): eskiden
    en fazla 200 ürün çekip bellekte süzüyorlardı ve 200'den
    sonrasına ulaşmanın yolu yoktu — /koleksiyon/erkek, /kadin ve
    /cocuk üçü de tam "200 ürün" diyordu.
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
    /*
      KOLEKSİYON RAFI DA VERİTABANINDA SAYFALANIYOR.

      Burada liste toplu çekilip bellekte süzülüyor, sıralanıyor ve
      dilimleniyordu — katalog yolundaki SQL'in ikizi. Artık tek
      çağrı: süzgeç, sıralama, sayfa ve sayımlar SQL'den geliyor
      (lib/products.ts getStorefrontCollectionProductsPage).

      Birleştirilen koleksiyonlar da tek çağrıda: kaynak slug'ları
      çoğul gidiyor ve aynı ürün iki koleksiyonda duruyorsa
      tekilleştirme veritabanında yapılıyor. Önceden her kaynak için
      ayrı sorgu atılıp sonuçlar bellekte birleştiriliyordu.
    */
    const kaynaklar = MERGED_COLLECTIONS[slug] ?? (exactCollection ? [exactCollection.slug] : []);
    const result = await getStorefrontCollectionProductsPage(page, {
      collectionSlugs: kaynaklar,
      menuGroups: kaynaklar.length ? undefined : menuGroups[slug],
      brand: marka,
      size: beden,
      maxPrice: ust,
      onlyDiscounted: indirimli,
      onlyAvailable: stokta,
      sort: sirala,
    });

    visibleProducts = result.products;
    pageCount = result.pageCount;
    currentPage = Math.min(result.page, result.pageCount);
    shownCount = result.total;
    totalCount = result.collectionTotal;
    sizes = [...result.sizes].sort(bySizeOrder);
    brands = result.brands.slice(0, 12);
    maxPrice = result.maxPrice;
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
          <div className="collection-empty">
            <h2>Bu seçimle ürün bulunamadı.</h2>
            <p>
              Filtrelerden birini kaldırmayı ya da seçkinin tamamına göz
              atmayı deneyin.
            </p>
            <div className="order-actions">
              <Link className="btn" href={`/koleksiyon/${slug}`}>
                Filtreleri temizle
              </Link>
              {slug !== "tumu" && (
                <Link href="/koleksiyon/tumu">Tüm ürünler</Link>
              )}
            </div>
          </div>
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
