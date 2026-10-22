/*
  KOLEKSİYON SAYFASININ GÖVDESİ — İKİ ROTA, TEK UYGULAMA.

  Türkçe (`/koleksiyon/[slug]`) ve İngilizce (`/en/koleksiyon/[slug]`)
  rotaları bu bileşeni çağırıyor. Kopyalanmadı: süzgeçler,
  sayfalama ve yüz satırlık koleksiyon çözümü iki yerde durursa
  kaçınılmaz olarak ayrışır.

  Dile bağlı olan: metinler (sözlükten), bağlantı öneki (`/en`) ve
  sayfalama adresi.
*/

import { ProductCard, discountOf } from "@/components/product-card";
import { ceviri, type SozlukAnahtari } from "@/lib/sozluk";
import { dilOneki, type Dil } from "@/lib/dil-onek";
import { CollectionFilters } from "@/components/collection-filters";
import { getStorefrontCollections } from "@/lib/collections";
import {
  getStorefrontCollectionProducts,
  getStorefrontCollectionProductsPage,
  getStorefrontCollectionFacets,
  getStorefrontProductsPage,
  getStorefrontFacets,
  CATALOG_PAGE_SIZE,
  type Product,
} from "@/lib/products";
import Link from "next/link";
import { getBlockedProducts } from "@/lib/engelli-urunler";
import { JsonLd } from "@/components/json-ld";
import { KATEGORI_MENU_GRUPLARI, SABIT_KOLEKSIYONLAR } from "@/lib/categories";
import { koleksiyonKapsami } from "@/lib/koleksiyon-kapsami";
import { DahaFazlaYukle } from "@/components/daha-fazla-yukle";
import { breadcrumbSchema, collectionSchema } from "@/lib/seo";
import { konagiAyarla, vitrinAdresi } from "@/lib/konak";
import { getStorefrontTheme } from "@/lib/storefront-theme";

/* Aynı liste yerleşimde 404 kararı için de okunuyor; tek yerde. */
const labels = SABIT_KOLEKSIYONLAR;

/* Kapsam listesi `lib/categories` içinde: ana sayfadaki kategori
   kartları da aynı grupları sayıyor ve iki kopya ilk eklenen
   grupta sessizce ayrışırdı. */
const menuGroups = KATEGORI_MENU_GRUPLARI;

/*
  Birleştirilen koleksiyonlar, yutulan slug'lar ve kapsam hesabı
  lib/koleksiyon-kapsami'ne taşındı: aynı hesabı "daha fazla
  yükle" ucu da yapıyor ve ikisi ayrılırsa düğmeyle gelen ürünler
  sayfadakinden farklı bir kümeden çıkardı.
*/

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



export async function KoleksiyonSayfasi({
  params,
  searchParams,
  dil,
}: {
  dil: Dil;
  params: Promise<{ slug: string; konak: string }>;
  searchParams: Promise<{
    sayfa?: string;
    sirala?: string;
    beden?: string;
    marka?: string;
    ust?: string;
    indirimli?: string;
    /* Eski bağlantılarda kalabilir; artık okunmuyor. */
    tukenenler?: string;
  }>;
}) {
  const onek = dilOneki(dil);
  const t = (anahtar: SozlukAnahtari) => ceviri(anahtar, dil);

  /* Adres yoldan geliyor; her sayfa onu veri katmanına kendisi
     bırakıyor — düzen ile sayfa AYNI ANDA çiziliyor, sıraya
     güvenilemiyor (lib/konak). */
  konagiAyarla((await params).konak);

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
  /*
    TÜKENENLER ARTIK VARSAYILAN OLARAK GİZLİ (19.10.2026).

    Süzgeç tersine çevrildi. Önce liste her şeyi gösteriyor,
    "Stokta olanlar" kutusu işaretlenirse tükenenler düşüyordu;
    sonuç canlıda görüldü: Kürk kategorisindeki ürünlerin hepsi
    tükenmişti ve müşteri baştan sona "Tükendi" rozetli bir
    listeyle karşılaşıyordu — satın alınamayacak ürünlerle dolu
    bir raf, boş raftan kötüdür.

    Tükenenleri görmek isteyen `?tukenenler=1` ile görebiliyor;
    bağlantı listenin altında duruyor. "Satılabilir mi" sorusunu
    ArvoARC yanıtlıyor (`arc_variant_available`): stoksuz satışa
    açık LR ürünleri stokları sıfır görünse de listede kalıyor.
  */
  const tukenenlerDe = query.tukenenler === "1";
  const stokta = !tukenenlerDe;
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

  /* Yapısal veri ve açıklama metni için: kanonik adres ve mağaza
     adı. Önceden ikisi de sabitti ("ArvoCulture", env.siteUrl) ve
     ikinci bir kiracının koleksiyon sayfası arama motoruna bizim
     markamızı ve adresimizi bildirirdi. */
  const [theme, adres, engelliSluglar] = await Promise.all([
    getStorefrontTheme(),
    vitrinAdresi(),
    /* Yurtdışına gönderilemeyen ürünler: aşağıdaki not için. Liste
       beş dakika önbellekli ve para biriminden bağımsız, yani rota
       önbelleğini bozmuyor (lib/engelli-urunler). */
    getBlockedProducts(),
  ]);

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
    const kapsam = koleksiyonKapsami(slug, Boolean(exactCollection));
    const kaynaklar = kapsam.collectionSlugs;
    /* Süzgeç seçenekleri ayrı ve beş dakika önbellekli çağrıda:
       sayfa sorgusunun içindeyken ağır koleksiyonlarda süre
       sınırını aşıyordu (lib/products.ts). */
    const [result, facets] = await Promise.all([
      getStorefrontCollectionProductsPage(page, {
        ...kapsam,
        brand: marka,
        size: beden,
        maxPrice: ust,
        onlyDiscounted: indirimli,
        onlyAvailable: stokta,
        sort: sirala,
      }),
      getStorefrontCollectionFacets(kapsam),
    ]);

    if (result.okunamadi) {
      /*
        RAF OKUNAMADIYSA ESKİ UCA DÜŞÜLÜYOR (17.10.2026).

        Sayfalayan fonksiyon ağır koleksiyonlarda anon rolünün süre
        sınırını aşabiliyor (canlıda 57014 ile düştü). O gün bu
        geri çekilme yolu yoktu: hata yutuldu, /koleksiyon/erkek
        "0 ürün" gösterdi ve mağaza kırıldı.

        Eski uç en çok 200 ürün veriyor ve süzgeci bellekte
        uyguluyor — yani kesik bir liste. Ama kesik liste, boş
        raftan iyidir: müşteri alışverişe devam edebiliyor.
      */
      const list = kaynaklar.length
        ? Object.values(
            Object.fromEntries(
              (
                await Promise.all(
                  kaynaklar.map((kaynak) =>
                    getStorefrontCollectionProducts({ collectionSlug: kaynak }),
                  ),
                )
              )
                .flat()
                .map((product) => [product.slug, product] as const),
            ),
          )
        : await getStorefrontCollectionProducts({ menuGroups: menuGroups[slug] });

      sizes = [...new Set(list.flatMap((product) => product.sizes))].sort(bySizeOrder);
      brands = [...new Set(list.map((product) => product.eyebrow))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "tr"))
        .slice(0, 12);
      maxPrice = list.reduce((top, product) => Math.max(top, product.price), 0);

      const filtered = list
        .filter((product) => {
          if (marka && product.eyebrow !== marka) return false;
          if (ust > 0 && product.price > ust) return false;
          if (indirimli && discountOf(product) <= 0) return false;
          if (stokta && product.available === false) return false;
          if (beden && !product.sizes.includes(beden.toUpperCase())) return false;
          return true;
        })
        .sort((a, b) => {
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
    } else {
      visibleProducts = result.products;
      pageCount = result.pageCount;
      currentPage = Math.min(result.page, result.pageCount);
      shownCount = result.total;
      totalCount = facets.total || result.total;
      sizes = [...facets.sizes].sort(bySizeOrder);
      brands = facets.brands.slice(0, 12);
      maxPrice = facets.maxPrice;
    }
  }

  return (
    <main className="shell">
      <section className="panel collection-hero">
        {/*
            MARKA ADI TEMADAN. Burada "ARVOCULTURE SEÇKİSİ" kodda
            SABİT yazılıydı: ikinci bir kiracının koleksiyon sayfası
            bizim markamızı gösterirdi ve hata vermezdi. AGENTS.md'nin
            açık kuralı — "sayfalara ArvoCulture YAZILMAZ".
        */}
        <p className="eyebrow">
          {t("koleksiyonSeckisi").replace("{magaza}", (theme.store_name ?? "").toLocaleUpperCase("tr"))}
        </p>
        <h1>{label}</h1>
        <p>{exactCollection?.description || t("koleksiyonAciklama")}</p>
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
            <ProductCard key={product.slug} product={product} onek={onek} />
          ))}
        </div>

        {/*
          DOLAR MODUNDA HEPSİ GİZLİYSE SEBEBİ YAZIYOR (22.10.2026).

          Gönderilemeyen ürünlerin kartları yurtdışı modunda CSS ile
          gizleniyor (lib/yurtdisi-gizleme) ve tamamı gönderilemeyen
          bir koleksiyonda — "çok satan cilt bakım" gibi — ızgara
          bomboş kalıyordu: filtreler duruyor, "24 ürün" yazıyor,
          ekranda hiçbir şey yok. Müşteri bunu arıza sanıyor.

          Karar SUNUCUDA verilebiliyor çünkü "hangi ürün
          gönderilemez" para biriminden bağımsız; gösterilip
          gösterilmeyeceğine CSS karar veriyor, yani rota önbelleği
          bozulmuyor. Not yalnızca gerçekten HEPSİ gizliyse
          basılıyor — bir kart bile görünüyorsa müşteri zaten
          görüyor.
        */}
        {visibleProducts.length > 0 &&
        visibleProducts.every((product) => engelliSluglar.includes(product.slug)) ? (
          <p className="yurtdisi-bos">
            None of the items in this collection can be shipped outside
            Türkiye.{" "}
            {/* İngilizce ağaçtayken kendi ana sayfasına, Türkçe
                ağaçtayken İngilizce vitrine götürüyor: aynı
                bağlantının iki ağaçta anlamı farklı. */}
            <Link href={onek || "/en"}>See what we ship worldwide</Link>.
          </p>
        ) : null}

        {/*
          Var olmayan bir sayfa numarası istendiğinde boş bir ızgara
          bırakmak yerine geri dönüş veriliyor. Sayfalama artık
          veritabanında olduğu için bu durum sessizce boş gelebilir.
        */}
        {visibleProducts.length === 0 && (
          <div className="collection-empty">
            <h2>{t("secimBos")}</h2>
            <p>
              Filtrelerden birini kaldırmayı ya da seçkinin tamamına göz
              atmayı deneyin.
            </p>
            <div className="order-actions">
              <Link className="btn" href={`/koleksiyon/${slug}`}>
                Filtreleri temizle
              </Link>
              {slug !== "tumu" && (
                <Link href={`${onek}/koleksiyon/tumu`}>{t("tumUrunler")}</Link>
              )}
            </div>
          </div>
        )}

        {/*
          SAYFALAMA YERİNE "DAHA FAZLA YÜKLE".

          Önce "← Önceki / Sonraki →" bağlantılarıydı: müşteri her
          sayfada başa dönüyor, kaldığı yeri kaybediyor ve ikinci
          sayfadan sonra çoğu zaman geri gelmiyordu. Liste artık
          büyüyor.

          Sunucu sayfalaması YERİNDE DURUYOR: ilk sayfa yine
          sunucuda çiziliyor ve sonraki sayfanın adresi düğmenin
          içindeki `<noscript>` bağlantısında — arama motoru ve
          JavaScript'siz tarayıcı kataloğun tamamına yine
          ulaşabiliyor.
        */}
        {pageCount > 1 && visibleProducts.length > 0 && (
          <DahaFazlaYukle
            slug={slug}
            ilkSayfa={currentPage}
            sayfaSayisi={pageCount}
            sonrakiAdres={pageHref(slug, query, currentPage + 1, onek)}
          />
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
            `${theme.store_name} ${label} seçkisi. Güncel ürünler, fiyatlar ve stok durumu.`,
          path: `/koleksiyon/${slug}`,
          products: visibleProducts,
          siteUrl: adres,
        })}
      />
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: t("anaSayfa"), path: onek || "/" },
            { name: label, path: `/koleksiyon/${slug}` },
          ],
          adres,
        )}
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
  onek = "",
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && key !== "sayfa") query.set(key, value);
  }
  query.set("sayfa", String(page));
  return `${onek}/koleksiyon/${slug}?${query.toString()}`;
}
