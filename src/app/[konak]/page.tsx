import { konagiAyarla } from "@/lib/konak";
import Image from "next/image";
import Link from "next/link";
import { CouponCopy } from "@/components/coupon-strip";
import { getPopularSearches } from "@/lib/popular-searches";
import { canOptimizeImage } from "@/lib/image-hosts";
import { SearchOverlay } from "@/components/search-overlay";
import {
  ProductBlock,
  Perks,
  CategoryStrip,
  HelpStrip,
} from "@/components/home-blocks";
import { ThemePreviewBridge } from "@/components/theme-preview-bridge";
import { formatPrice } from "@/lib/product-types";
import {
  getStorefrontProducts,
  getStorefrontCollectionProducts,
  getStorefrontDeals,
  getStorefrontFacets,
} from "@/lib/products";
import { getStorefrontDiscounts } from "@/lib/discounts";
import { getSalesRules } from "@/lib/store-settings";
import { shippingTerms } from "@/lib/order-quote";
import { Reveal } from "@/components/reveal";
import { RecentProducts } from "@/components/recent-products";
import { ForYou } from "@/components/for-you";
import { CATEGORIES, kategoriSayilariyla } from "@/lib/categories";
import { getStorefrontCollections } from "@/lib/collections";
import { vitrinAdresi } from "@/lib/konak";
import {
  getStorefrontTheme,
  type StorefrontTheme,
} from "@/lib/storefront-theme";

/**
 * Ana sayfa. Sıralama, Türkiye’de alışveriş yapan kullanıcının
 * öncelik sırasına göre kurulmuştur: önce fiyat/indirim, sonra ürün
 * görseli, sonra bulunabilirlik, sonra güven.
 *
 *   Hero → Arama + kupon + güvence (tek panel) → İNDİRİMDEKİLER → Kategoriler
 *   → Çok satanlar → Kampanya → Yeni gelenler → Yardım
 *
 * `data-arvo-section` / `data-arvo-field` nitelikleri ArvoARC panelinin
 * canlı düzenleme bağlantılarıdır; kaldırılırsa panel bölümü seçemez.
 */

export default async function Home({
  params,
}: {
  params: Promise<{ konak: string }>;
}) {
  /* Adres yoldan geliyor; her sayfa onu veri katmanına kendisi
     bırakıyor — düzen ile sayfa AYNI ANDA çiziliyor, sıraya
     güvenilemiyor (lib/konak). */
  konagiAyarla((await params).konak);

  const [theme, products, discounts, curatedBest, dealItems, facets] =
    await Promise.all([
      getStorefrontTheme(),
      getStorefrontProducts(200),
      getStorefrontDiscounts(),
      /*
      Çok satanlar ArvoARC’taki "Çok Satanlar" koleksiyonundan gelir.
      Slug eski adından kalma; başlık panelden değiştirilmiş.
      Böylece hangi ürünlerin öne çıkacağına panelden siz karar
      verirsiniz. Öncesinde katalog sırasına düşüyordu ve
      tedarikçiden yeni gelen, hiç satılmamış ürünler "çok satan"
      olarak gösteriliyordu.
    */
      getStorefrontCollectionProducts({
        collectionSlug: "cok-satan-cilt-bakim-urunleri",
      }),
      /*
      İndirimliler ayrı uç noktadan gelir. Katalogdan süzmek,
      katalog 3.000 ürünü aştıktan sonra işe yaramıyordu:
      ana sayfa ilk 200 ürünü çekiyor ve indirimliler o listeye
      hiç giremiyordu.
    */
      getStorefrontDeals(10),
      /* Kapaktaki kanıt satırının ürün sayısı buradan: katalog
         listesi ilk 200 ile sınırlı ve onu saymak kataloğu
         olduğundan küçük gösteriyordu ("200+" yazarken 3.407 ürün
         vardı). */
      getStorefrontFacets(),
    ]);

  const coupon = discounts.find((discount) => discount.code);

  // Tükenmiş ürün ana sayfada gösterilmez: müşteriyi satın
  // alamayacağı bir sayfaya götürmek en pahalı terk noktasıdır.
  const inStock = products.filter((product) => product.available !== false);

  const deals = dealItems.filter((product) => product.available !== false);

  /*
    Koleksiyon boşsa ArvoARC’ta işaretlenmiş ürünlere düşülür.
    Katalog sırasına asla düşülmez.
  */
  const curated = curatedBest.filter((product) => product.available !== false);
  const flagged = inStock.filter((product) => product.bestSeller);
  const best = (curated.length > 0 ? curated : flagged).slice(0, 10);

  const fresh = inStock.slice(0, 5);

  /*
    Sonuç vermeyen terimler gösterilmiyor: müşteri tıklayıp boş
    sayfayla karşılaşmasın.
  */
  const searchTerms = await getPopularSearches();
  // Düzen (layout) zaten okuyor; cache ile aynı istekte tekrar sorgu yok.
  const shippingBadge = shippingTerms(await getSalesRules()).badge;

  /*
    Kategori kartlarındaki ürün sayısı GERÇEK: koleksiyon listesinin
    `product_count` alanından geliyor. O liste menü için zaten her
    istekte okunuyor ve `cache` ile aynı istekte tek sorgu — kartlar
    sayıyı bedavaya alıyor. Okunamazsa kart sayısız çiziliyor.

    `siteUrl` kategori şemasının tam adresleri için; ana sayfanın
    `ItemList`i yoktu (bkz. lib/seo → kategoriListesiSchema).
  */
  const [koleksiyonlar, siteUrl] = await Promise.all([
    getStorefrontCollections(),
    vitrinAdresi(),
  ]);
  const categories = kategoriSayilariyla(CATEGORIES, koleksiyonlar);

  return (
    <main className="shell">
      <ThemePreviewBridge />

      <Hero theme={theme} />

      {/*
        Arama, kupon ve güvence tek panelde. Önceden iki ayrı bant
        (güvence şeridi + arama/kupon) masaüstünde ~230px, mobilde
        ~460px — ekranın yarısından fazlası — ürünlerden önce yer
        kaplıyordu. Hiçbir bilgi silinmedi; güvence hâlâ hero'dan
        hemen sonra.
      */}
      <section
        className="panel panel-tight utility"
        aria-label="Arama, kampanya ve alışveriş güvencesi"
      >
        <div className="utility-row">
          <div className="utility-search">
            <SearchOverlay terms={searchTerms} />
          </div>

          {coupon?.code && (
            <div className="coupon">
              <div>
                <strong>
                  İlk alışverişte{" "}
                  {coupon.discount_type === "percentage"
                    ? `%${coupon.value}`
                    : formatPrice(coupon.value / 100)}{" "}
                  indirim
                </strong>
                <small>Kodu sepette uygulayın</small>
              </div>
              <CouponCopy code={coupon.code} />
            </div>
          )}
        </div>

        <Perks shippingBadge={shippingBadge} urunSayisi={facets.total} />
      </section>

      {/* Fiyat birinci öncelik: indirimler en üstte. */}
      <Reveal>
        <ProductBlock
          title="İndirimdeki ürünler"
          note="Sınırlı stokla sunulan güncel fırsatlar."
          href="/koleksiyon/firsatlar"
          hrefLabel="Tüm fırsatlar"
          products={deals}
          /*
            TEK SATIR, YATAY KAYDIRMALI (18.10.2026).

            Izgarada on fırsat iki satıra yayılıyor ve ana sayfanın
            dikey uzunluğunu şişiriyordu; müşteri "indirimdekiler"i
            görmek için kaydırıyor, sonra kategorileri görmek için
            yine kaydırıyordu. Rafta on ürün tek satırda duruyor ve
            yanal kaydırma, listenin DEVAMI olduğunu kendiliğinden
            söylüyor — telefonda alıştığımız hareket bu.
          */
          rail
        />
      </Reveal>

      <Reveal>
        <CategoryStrip items={categories} siteUrl={siteUrl} />
      </Reveal>

      {/* Satış verisi yoksa bölüm hiç görünmez. Hiç satılmamış
          ürünü "çok satan" diye göstermek güveni zedeler. */}
      {/* Bu bölüm yatay raf: ızgara tekrarını kırıyor. */}
      <Reveal>
        <ProductBlock
          title="Çok satanlar"
          note="Müşterilerimizin en sık tercih ettiği ürünler."
          href="/koleksiyon/cok-satan-cilt-bakim-urunleri"
          hrefLabel="Tümünü gör"
          products={best}
          alt
          rail
        />
      </Reveal>

      {/* Başlıksız kampanya bloğu çizilmiyor: varsayılan metin
          ArvoCulture'ın ARVO10 kuponuydu, artık boş. Boş bir
          kampanya paneli müşteriye anlamsız bir kutu gösterirdi. */}
      {theme.show_campaign && theme.campaign_title && (
        <Reveal>
          <section data-arvo-section="campaign" className="panel promo">
            {theme.campaign_image_url && (
              <Image
                unoptimized={!canOptimizeImage(theme.campaign_image_url)}
                src={theme.campaign_image_url}
                alt=""
                width={1600}
                height={600}
                sizes="(max-width: 1600px) 100vw, 1600px"
              />
            )}
            {/* Filigran: indirim oranı, panelin sağ tarafındaki boşluğu
              dolduran dev bir kontur rakam. Dekoratif olduğu için
              ekran okuyuculardan gizli. */}
            {coupon?.discount_type === "percentage" && (
              <span className="promo-watermark" aria-hidden="true">
                %{coupon.value}
              </span>
            )}

            <div className="promo-body">
              <p className="promo-eyebrow">Yeni müşterilere özel</p>
              <h2 data-arvo-field="campaign_title">{theme.campaign_title}</h2>
              <p data-arvo-field="campaign_description">
                {theme.campaign_description}
              </p>

              {/* Kupon kodu, açıklama metninin içinde kaybolmasın diye
                ayrı bir kart olarak gösteriliyor. */}
              {coupon?.code && (
                <div className="promo-code">
                  <div>
                    <small>İndirim kodu</small>
                    <strong>{coupon.code}</strong>
                  </div>
                  <CouponCopy code={coupon.code} />
                </div>
              )}

              <Link className="btn btn-light" href="/koleksiyon/tumu">
                Alışverişe başla
              </Link>
            </div>
          </section>
        </Reveal>
      )}

      {theme.show_featured && (
        <Reveal>
          <div data-arvo-section="featured">
            <ProductBlock
              title={theme.featured_title}
              eyebrow={theme.featured_eyebrow}
              href="/koleksiyon/tumu"
              hrefLabel="Tüm ürünler"
              products={fresh}
            />
          </div>
        </Reveal>
      )}

      {/* Daha önce gelen ziyaretçi kaldığı yerden devam etsin. */}
      <Reveal>
        <RecentProducts />
      </Reveal>

      {/*
        Vitrinin müşteriye göre değişen parçası. Yeni ziyaretçide
        hiç görünmüyor; gösterecek bir şey olmadan "senin için"
        demek süs olurdu.
      */}
      <Reveal>
        <ForYou />
      </Reveal>

      <Reveal>
        <HelpStrip />
      </Reveal>
    </main>
  );
}

function Hero({ theme }: { theme: StorefrontTheme }) {
  return (
    <section data-arvo-section="hero" className="panel hero">
      {theme.hero_image_url && (
        <Image
          /*
            İzinli adreste görsel optimize ediliyor: telefona 1920px'lik
            dosya yerine ekran genişliğinde WebP gidiyor (bkz.
            lib/image-hosts.ts). Sayfanın en büyük öğesi bu görsel;
            yavaş bağlantıda açılış süresini o belirliyor.
          */
          unoptimized={!canOptimizeImage(theme.hero_image_url)}
          src={theme.hero_image_url}
          alt=""
          width={2000}
          height={1000}
          sizes="(max-width: 1600px) 100vw, 1600px"
          preload
          fetchPriority="high"
        />
      )}
      {/*
        Karartma katmanı. Metnin okunabilirliği görsele bağlı
        kalmasın; panelden farklı bir fotoğraf yüklendiğinde de
        başlık okunur olsun.
      */}
      <span className="hero-veil" aria-hidden="true" />

      <div className="hero-body">
        {/* Sınıf şart: `.hero-eyebrow` üst etiketin harf aralığını ve
            yanındaki altın çizgiyi taşıyor. */}
        <p className="hero-eyebrow" data-arvo-field="hero_eyebrow">
          {theme.hero_eyebrow}
        </p>
        <h1 data-arvo-field="hero_title">
          {theme.hero_title}{" "}
          <span data-arvo-field="hero_emphasis">{theme.hero_emphasis}</span>
        </h1>
        <p data-arvo-field="hero_description" className="hero-lede">
          {theme.hero_description}
        </p>
        <div className="hero-cta">
          {/* Tek baskın eylem; ikincisi sessiz bağlantı. */}
          <Link
            data-arvo-field="primary_cta_label"
            className="btn"
            href={theme.primary_cta_href}
          >
            {theme.primary_cta_label}
          </Link>
          {/* İkinci düğme ancak etiketi VE adresi varsa çiziliyor.
              Varsayılanları "Bakımı keşfet" → /koleksiyon/bakim idi;
              o koleksiyon başka mağazada yok, yani düğme 404'e
              çıkıyordu. */}
          {theme.secondary_cta_label && theme.secondary_cta_href && (
            <Link
              data-arvo-field="secondary_cta_label"
              href={theme.secondary_cta_href}
            >
              {theme.secondary_cta_label}
            </Link>
          )}
        </div>

        {/*
          KANIT SATIRI BURADAN KALDIRILDI (18.10.2026).

          Kapağa üç rakam konmuştu ama hemen altındaki panelde
          aynı şeyler zaten yazıyordu: "14 gün iade" ve "3D
          Secure" iki kez, aralarında yüz piksel. Bir ekranda aynı
          şeyi iki kez söylemek güven vermiyor, dikkat dağıtıyor.

          Rakamlar aşağıdaki panele taşındı (components/home-blocks
          → Perks): oradaki maddeler BAĞLANTILI, yani müşteri
          "14 gün iade" yazısına dokunup koşulları okuyabiliyor.
          Kapakta yalnızca fotoğraf, başlık ve tek bir eylem
          kalıyor.
        */}

        {/*
          Kategori kısayolları. Hero’nun altında, kaydırmadan
          erişilebilir. Müşteri "nereden başlayacağım" sorusuna
          ilk ekranda yanıt buluyor.
        */}
        {/* Hero ayrı bir bileşen; sabit listeyi doğrudan okur. */}
        <nav className="hero-jump" aria-label="Kategoriler">
          {CATEGORIES.map((category) => (
            <Link key={category.href} href={category.href}>
              {category.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
